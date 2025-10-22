import pdfParse from 'pdf-parse'
import xlsx from 'xlsx'
import { parse } from 'csv-parse/sync'
import mammoth from 'mammoth'
import fs from 'fs/promises'
import { DocumentChunk } from '../types'

export class DocumentProcessor {
  async processFile(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath)

    if (filePath.endsWith('.pdf')) {
      return this.processPDF(buffer)
    } else if (filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
      return this.processExcel(buffer)
    } else if (filePath.endsWith('.csv')) {
      return this.processCSV(buffer)
    } else if (filePath.endsWith('.docx')) {
      return this.processDOCX(buffer)
    } else if (filePath.endsWith('.txt')) {
      return this.processTXT(buffer)
    }

    throw new Error('Unsupported file format')
  }

  private async processPDF(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer)
    return data.text
  }

  private processExcel(buffer: Buffer): Promise<string> {
    return new Promise((resolve) => {
      const workbook = xlsx.read(buffer, { type: 'buffer' })
      let text = ''

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName]
        const csv = xlsx.utils.sheet_to_csv(sheet)
        text += `Sheet: ${sheetName}\n${csv}\n\n`
      })

      resolve(text)
    })
  }

  private processCSV(buffer: Buffer): Promise<string> {
    return new Promise((resolve) => {
      const content = buffer.toString('utf-8')
      const records = parse(content, {
        skip_empty_lines: true,
      })

      const text = records
        .map((row: any[]) => row.join(', '))
        .join('\n')

      resolve(text)
    })
  }

  private async processDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  private processTXT(buffer: Buffer): Promise<string> {
    return Promise.resolve(buffer.toString('utf-8'))
  }

  chunkText(text: string, fileId: string, chunkSize = 1000, overlap = 200): DocumentChunk[] {
    const chunks: DocumentChunk[] = []
    const words = text.split(/\s+/)

    let start = 0
    let chunkIndex = 0

    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length)
      const chunk = words.slice(start, end).join(' ')

      chunks.push({
        content: chunk,
        metadata: {
          fileId,
          fileName: fileId,
          chunkIndex,
          totalChunks: 0,
        },
      })

      start = end - overlap
      chunkIndex++
    }

    // Update total chunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length
    })

    return chunks
  }
}
