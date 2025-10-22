'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

interface ExcelViewerProps {
  fileUrl: string
}

interface SheetData {
  name: string
  data: any[][]
}

export default function ExcelViewer({ fileUrl }: ExcelViewerProps) {
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [activeSheet, setActiveSheet] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const response = await fetch(fileUrl)
        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        const sheetsData: SheetData[] = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
          return {
            name: sheetName,
            data: data,
          }
        })

        setSheets(sheetsData)
      } catch (err) {
        console.error('Error loading Excel:', err)
        setError('Erreur lors de la lecture du fichier Excel')
      } finally {
        setLoading(false)
      }
    }

    loadExcel()
  }, [fileUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (sheets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Aucune donnée trouvée dans ce fichier Excel</p>
      </div>
    )
  }

  const currentSheet = sheets[activeSheet]

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex border-b border-gray-300 bg-white px-4 overflow-x-auto">
          {sheets.map((sheet, index) => (
            <button
              key={index}
              onClick={() => setActiveSheet(index)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeSheet === index
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* Table container */}
      <div className="flex-1 overflow-auto p-4">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 bg-white">
              <thead className="bg-gray-50">
                {currentSheet.data.length > 0 && (
                  <tr>
                    {currentSheet.data[0].map((cell: any, colIndex: number) => (
                      <th
                        key={colIndex}
                        className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider sticky top-0 bg-gray-50"
                      >
                        {cell !== undefined && cell !== null ? String(cell) : ''}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentSheet.data.slice(1).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell: any, colIndex: number) => (
                      <td
                        key={colIndex}
                        className="whitespace-nowrap px-3 py-2 text-sm text-gray-900"
                      >
                        {cell !== undefined && cell !== null ? String(cell) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="border-t border-gray-300 bg-white px-4 py-2 text-xs text-gray-600">
        {currentSheet.data.length > 0 && (
          <span>
            {currentSheet.data.length - 1} ligne(s) × {currentSheet.data[0]?.length || 0} colonne(s)
          </span>
        )}
      </div>
    </div>
  )
}
