import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";
import fs from "fs/promises";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { DocumentChunk } from "../types";

export class DocumentProcessor {
  async processFile(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);

    if (filePath.endsWith(".pdf")) {
      return await this.processPDF(buffer);
    } else if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls")) {
      return await this.processExcel(buffer);
    } else if (filePath.endsWith(".csv")) {
      return await this.processCSV(buffer);
    } else if (filePath.endsWith(".docx")) {
      return await this.processDOCX(buffer);
    } else if (filePath.endsWith(".txt")) {
      return await this.processTXT(buffer);
    }

    throw new Error("Unsupported file format");
  }

  private async processPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer, {
        max: 0, // Process all pages
        version: "v2.0.550",
      });
      // Limit text size to prevent memory issues
      const text = data.text;
      if (text.length > 1000000) {
        // 1MB of text
        console.warn("PDF text exceeds 1MB, truncating...");
        return text.substring(0, 1000000);
      }
      return text;
    } catch (error) {
      console.error("PDF processing error:", error);
      throw new Error(
        "Failed to process PDF. The file may be corrupted or too large."
      );
    }
  }

  private async processExcel(buffer: Buffer): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    let text = "";

    workbook.eachSheet((worksheet, sheetId) => {
      const sheetName = worksheet.name;
      const rowCount = worksheet.rowCount;
      const columnCount = worksheet.columnCount;

      text += `\n=== FEUILLE: ${sheetName} ===\n`;
      text += `Nombre de lignes: ${rowCount}, Nombre de colonnes: ${columnCount}\n\n`;

      // Extract headers from first row
      const firstRow = worksheet.getRow(1);
      const headers: string[] = [];

      firstRow.eachCell((cell, colNumber) => {
        const value = this.getCellValue(cell);
        headers[colNumber - 1] = value || `Colonne${colNumber}`;
      });

      // Add headers line
      text += `EN-TÊTES: ${headers.join(" | ")}\n`;
      text +=
        "=" + "=".repeat(Math.min(headers.join(" | ").length, 100)) + "\n\n";

      // Process data rows (skip first row as it's headers)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData: string[] = [];

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1] || `Colonne${colNumber}`;
          const value = this.getCellValue(cell);

          if (value) {
            rowData.push(`${header}: ${value}`);
          }
        });

        if (rowData.length > 0) {
          text += `Ligne ${rowNumber}: ${rowData.join(", ")}\n`;
        }
      });

      text += "\n";
    });

    return text;
  }

  // Helper method to extract cell value consistently
  private getCellValue(cell: any): string {
    if (cell === null || cell === undefined) return "";

    const value = cell.value;

    if (value === null || value === undefined) return "";
    if (typeof value === "object" && "text" in value) return String(value.text);
    if (typeof value === "object" && "result" in value)
      return String(value.result);
    if (typeof value === "object" && "richText" in value) {
      return value.richText.map((t: any) => t.text).join("");
    }

    return String(value);
  }

  private async processCSV(buffer: Buffer): Promise<string> {
    const content = buffer.toString("utf-8");
    const records = parse(content, {
      skip_empty_lines: true,
    });

    const text = records.map((row: any[]) => row.join(", ")).join("\n");

    return text;
  }

  private async processDOCX(buffer: Buffer): Promise<string> {
    // Use convertToHtml to preserve document structure
    const result = await mammoth.convertToHtml(
      { buffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh",
          "p[style-name='Title'] => h1.title:fresh",
        ],
      }
    );

    // Convert HTML to structured text
    const structuredText = this.htmlToStructuredText(result.value);
    return structuredText;
  }

  private async processTXT(buffer: Buffer): Promise<string> {
    return buffer.toString("utf-8");
  }

  // Convert HTML from DOCX to structured text preserving hierarchy
  private htmlToStructuredText(html: string): string {
    let text = html;

    // Preserve document structure with clear markers
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n═══ $1 ═══\n\n");
    text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n\n▬▬ $1 ▬▬\n\n");
    text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n\n── $1 ──\n\n");
    text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n\n• $1\n\n");
    text = text.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "\n\n▸ $1\n\n");
    text = text.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "\n\n▹ $1\n\n");

    // Preserve lists with indentation
    text = text.replace(/<ul[^>]*>/gi, "\n");
    text = text.replace(/<\/ul>/gi, "\n");
    text = text.replace(/<ol[^>]*>/gi, "\n");
    text = text.replace(/<\/ol>/gi, "\n");
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "  • $1\n");

    // Preserve tables
    text = text.replace(/<table[^>]*>/gi, "\n\n[TABLEAU]\n");
    text = text.replace(/<\/table>/gi, "\n[/TABLEAU]\n\n");
    text = text.replace(/<tr[^>]*>/gi, "");
    text = text.replace(/<\/tr>/gi, "\n");
    text = text.replace(/<td[^>]*>(.*?)<\/td>/gi, " | $1");
    text = text.replace(/<th[^>]*>(.*?)<\/th>/gi, " | **$1**");

    // Preserve emphasis
    text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
    text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
    text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
    text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

    // Preserve line breaks and paragraphs
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

    // Remove remaining HTML tags
    text = text.replace(/<[^>]+>/g, "");

    // Decode HTML entities
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    // Clean up excessive whitespace while preserving structure
    text = text.replace(/\n{4,}/g, "\n\n\n"); // Max 3 line breaks
    text = text.replace(/[ \t]+/g, " "); // Multiple spaces to single
    text = text.trim();

    return text;
  }

  chunkText(
    text: string,
    fileId: string,
    fileName: string,
    chunkSize = 600, // Reduced from 1000 to 600 for better granularity
    overlap = 300 // Increased from 200 to 300 for better context preservation
  ): DocumentChunk[] {
    // Limit total text size
    if (text.length > 1000000) {
      console.warn("Text too large, truncating to 1MB");
      text = text.substring(0, 1000000);
    }

    // Special handling for Excel files
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      return this.chunkExcelText(text, fileId, fileName);
    }

    // Special handling for Word files
    if (fileName.endsWith(".docx")) {
      return this.chunkWordText(text, fileId, fileName);
    }

    const chunks: DocumentChunk[] = [];

    // Semantic chunking: split by paragraphs first to preserve structure
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

    // Limit number of chunks to prevent memory issues
    const MAX_CHUNKS = 1000; // Increased from 500 to handle more granular chunks
    let currentChunk = "";
    let chunkIndex = 0;
    let wordCount = 0;

    for (let i = 0; i < paragraphs.length && chunkIndex < MAX_CHUNKS; i++) {
      const paragraph = paragraphs[i].trim();
      const paragraphWords = paragraph.split(/\s+/).filter((w) => w.length > 0);
      const paragraphWordCount = paragraphWords.length;

      // If paragraph alone exceeds chunk size, split it
      if (paragraphWordCount > chunkSize) {
        // Save current chunk if not empty
        if (currentChunk.trim().length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: {
              fileId,
              fileName: fileName,
              chunkIndex,
              totalChunks: 0,
            },
          });
          chunkIndex++;
          currentChunk = "";
          wordCount = 0;
        }

        // Split large paragraph into smaller chunks
        let start = 0;
        while (start < paragraphWords.length && chunkIndex < MAX_CHUNKS) {
          const end = Math.min(start + chunkSize, paragraphWords.length);
          const chunk = paragraphWords.slice(start, end).join(" ");

          chunks.push({
            content: chunk,
            metadata: {
              fileId,
              fileName: fileName,
              chunkIndex,
              totalChunks: 0,
            },
          });

          start = end - overlap;
          chunkIndex++;
        }
      } else if (wordCount + paragraphWordCount > chunkSize) {
        // Current chunk is full, save it and start new one
        if (currentChunk.trim().length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: {
              fileId,
              fileName: fileName,
              chunkIndex,
              totalChunks: 0,
            },
          });
          chunkIndex++;
        }

        // Start new chunk with overlap from previous chunk
        const previousWords = currentChunk
          .split(/\s+/)
          .filter((w) => w.length > 0);
        const overlapWords = previousWords.slice(-overlap);
        currentChunk = overlapWords.join(" ") + " " + paragraph;
        wordCount = overlapWords.length + paragraphWordCount;
      } else {
        // Add paragraph to current chunk
        if (currentChunk.length > 0) {
          currentChunk += "\n\n" + paragraph;
        } else {
          currentChunk = paragraph;
        }
        wordCount += paragraphWordCount;
      }
    }

    // Add the last chunk if not empty
    if (currentChunk.trim().length > 0 && chunkIndex < MAX_CHUNKS) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          fileId,
          fileName: fileName,
          chunkIndex,
          totalChunks: 0,
        },
      });
    }

    if (chunkIndex >= MAX_CHUNKS) {
      console.warn(
        `Reached maximum of ${MAX_CHUNKS} chunks, some content was skipped`
      );
    }

    // Update total chunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    console.log(`Created ${chunks.length} semantic chunks for ${fileName}`);
    return chunks;
  }

  // Special chunking for Excel files - preserve headers with each chunk
  private chunkExcelText(
    text: string,
    fileId: string,
    fileName: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const lines = text.split("\n");

    // Find sheet headers and structure
    let currentSheet = "";
    let currentHeaders = "";
    let currentSheetInfo = "";
    let dataRows: string[] = [];
    let chunkIndex = 0;
    const rowsPerChunk = 15; // Group rows in chunks of 15

    for (const line of lines) {
      // Detect sheet header
      if (line.startsWith("=== FEUILLE:")) {
        // Save previous sheet's data if exists
        if (dataRows.length > 0) {
          this.createExcelChunks(
            chunks,
            currentSheetInfo,
            currentHeaders,
            dataRows,
            fileId,
            fileName,
            chunkIndex,
            rowsPerChunk
          );
          chunkIndex = chunks.length;
          dataRows = [];
        }

        currentSheet = line;
        currentSheetInfo = line;
      } else if (line.startsWith("Nombre de lignes:")) {
        currentSheetInfo += "\n" + line;
      } else if (line.startsWith("EN-TÊTES:")) {
        currentHeaders = line;
      } else if (line.startsWith("Ligne ")) {
        dataRows.push(line);
      }
    }

    // Save last sheet's data
    if (dataRows.length > 0) {
      this.createExcelChunks(
        chunks,
        currentSheetInfo,
        currentHeaders,
        dataRows,
        fileId,
        fileName,
        chunkIndex,
        rowsPerChunk
      );
    }

    // Update total chunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    console.log(`Created ${chunks.length} Excel chunks for ${fileName}`);
    return chunks;
  }

  private createExcelChunks(
    chunks: DocumentChunk[],
    sheetInfo: string,
    headers: string,
    dataRows: string[],
    fileId: string,
    fileName: string,
    startIndex: number,
    rowsPerChunk: number
  ): void {
    // Split data rows into chunks, always including headers
    for (let i = 0; i < dataRows.length; i += rowsPerChunk) {
      const chunkRows = dataRows.slice(i, i + rowsPerChunk);
      const content = `${sheetInfo}\n\n${headers}\n${"=".repeat(
        50
      )}\n\n${chunkRows.join("\n")}`;

      chunks.push({
        content: content,
        metadata: {
          fileId,
          fileName: fileName,
          chunkIndex: startIndex + Math.floor(i / rowsPerChunk),
          totalChunks: 0, // Will be updated later
        },
      });
    }
  }

  // Special chunking for Word documents - preserve headings with their content
  private chunkWordText(
    text: string,
    fileId: string,
    fileName: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const lines = text.split("\n");

    let currentSection = {
      heading: "",
      level: 0,
      content: [] as string[],
    };

    const sections: (typeof currentSection)[] = [];
    let chunkIndex = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect headings by markers
      if (trimmed.startsWith("═══")) {
        // H1 - Start new major section
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          heading: trimmed.replace(/═/g, "").trim(),
          level: 1,
          content: [],
        };
      } else if (trimmed.startsWith("▬▬")) {
        // H2 - Subsection
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          heading: trimmed.replace(/▬/g, "").trim(),
          level: 2,
          content: [],
        };
      } else if (trimmed.startsWith("──")) {
        // H3 - Subsubsection
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          heading: trimmed.replace(/─/g, "").trim(),
          level: 3,
          content: [],
        };
      } else if (
        trimmed.startsWith("•") ||
        trimmed.startsWith("▸") ||
        trimmed.startsWith("▹")
      ) {
        // H4/H5/H6 - Minor headings
        if (currentSection.content.length > 0 && currentSection.level < 4) {
          sections.push({ ...currentSection });
        }
        if (currentSection.level >= 4) {
          currentSection.content.push(line);
        } else {
          currentSection = {
            heading: trimmed.replace(/[•▸▹]/g, "").trim(),
            level: 4,
            content: [],
          };
        }
      } else if (trimmed.length > 0) {
        // Regular content
        currentSection.content.push(line);
      }
    }

    // Add last section
    if (currentSection.content.length > 0 || currentSection.heading) {
      sections.push(currentSection);
    }

    // Create chunks from sections, combining small sections
    const maxWordsPerChunk = 600;
    const minWordsPerChunk = 300;
    let currentChunk = "";
    let currentWordCount = 0;

    for (const section of sections) {
      const sectionText = this.formatSection(section);
      const sectionWords = sectionText.split(/\s+/).length;

      // If section alone is too big, split it
      if (sectionWords > maxWordsPerChunk) {
        // Save current chunk if exists
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: {
              fileId,
              fileName,
              chunkIndex: chunkIndex++,
              totalChunks: 0,
            },
          });
          currentChunk = "";
          currentWordCount = 0;
        }

        // Split large section
        const sectionChunks = this.splitLargeSection(section, maxWordsPerChunk);
        for (const chunk of sectionChunks) {
          chunks.push({
            content: chunk,
            metadata: {
              fileId,
              fileName,
              chunkIndex: chunkIndex++,
              totalChunks: 0,
            },
          });
        }
      } else if (
        currentWordCount + sectionWords > maxWordsPerChunk &&
        currentWordCount >= minWordsPerChunk
      ) {
        // Current chunk is full enough, save it
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            fileId,
            fileName,
            chunkIndex: chunkIndex++,
            totalChunks: 0,
          },
        });
        currentChunk = sectionText;
        currentWordCount = sectionWords;
      } else {
        // Add to current chunk
        currentChunk += (currentChunk ? "\n\n" : "") + sectionText;
        currentWordCount += sectionWords;
      }
    }

    // Add last chunk
    if (currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          fileId,
          fileName,
          chunkIndex: chunkIndex++,
          totalChunks: 0,
        },
      });
    }

    // Update total chunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    console.log(
      `Created ${chunks.length} structured Word chunks for ${fileName}`
    );
    return chunks;
  }

  private formatSection(section: {
    heading: string;
    level: number;
    content: string[];
  }): string {
    const headingMarker = ["═══", "▬▬", "──", "•"][
      Math.min(section.level - 1, 3)
    ];
    const heading = section.heading
      ? `${headingMarker} ${section.heading} ${headingMarker}\n\n`
      : "";

    return heading + section.content.join("\n");
  }

  private splitLargeSection(
    section: { heading: string; level: number; content: string[] },
    maxWords: number
  ): string[] {
    const chunks: string[] = [];
    const headingMarker = ["═══", "▬▬", "──", "•"][
      Math.min(section.level - 1, 3)
    ];
    const heading = section.heading
      ? `${headingMarker} ${section.heading} ${headingMarker}\n\n`
      : "";

    let currentChunk = heading;
    let currentWords = heading.split(/\s+/).length;

    for (const line of section.content) {
      const lineWords = line.split(/\s+/).length;

      if (currentWords + lineWords > maxWords && currentChunk !== heading) {
        chunks.push(currentChunk.trim());
        currentChunk = heading + line + "\n";
        currentWords = heading.split(/\s+/).length + lineWords;
      } else {
        currentChunk += line + "\n";
        currentWords += lineWords;
      }
    }

    if (currentChunk.trim() !== heading.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
