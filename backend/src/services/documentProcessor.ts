import pdfParse from 'pdf-parse'
import ExcelJS from 'exceljs'
import { parse } from 'csv-parse/sync'
import mammoth from 'mammoth'
import fs from 'fs/promises'
import { DocumentChunk } from '../types'

export class DocumentProcessor {
  async processFile(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath)

    if (filePath.endsWith('.pdf')) {
      return await this.processPDF(buffer)
    } else if (filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
      return await this.processExcel(buffer)
    } else if (filePath.endsWith('.csv')) {
      return await this.processCSV(buffer)
    } else if (filePath.endsWith('.docx')) {
      return await this.processDOCX(buffer)
    } else if (filePath.endsWith('.txt')) {
      return await this.processTXT(buffer)
    }

    throw new Error('Unsupported file format')
  }

  private async processPDF(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer)
    return data.text
  }

  private async processExcel(buffer: Buffer): Promise<string> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    let text = ''

    workbook.eachSheet((worksheet, sheetId) => {
      text += `Sheet: ${worksheet.name}\n`

      worksheet.eachRow((row, rowNumber) => {
        const rowValues = row.values as any[]
        // Skip the first element as it's undefined (exceljs quirk)
        const cleanedRow = rowValues.slice(1).map(cell => {
          if (cell === null || cell === undefined) return ''
          if (typeof cell === 'object' && 'text' in cell) return cell.text
          if (typeof cell === 'object' && 'result' in cell) return cell.result
          return String(cell)
        })
        text += cleanedRow.join(', ') + '\n'
      })

      text += '\n'
    })

    return text
  }

  private async processCSV(buffer: Buffer): Promise<string> {
    const content = buffer.toString('utf-8')
    const records = parse(content, {
      skip_empty_lines: true,
    })

    const text = records
      .map((row: any[]) => row.join(', '))
      .join('\n')

    return text
  }

  private async processDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  private async processTXT(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8')
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
