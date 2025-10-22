'use client'

import { getAuthToken } from '@/lib/auth'
import { useEffect, useState } from 'react'
import DocxViewer from './DocxViewer'
import ExcelViewer from './ExcelViewer'

interface DocumentViewerProps {
  fileId: string
  fileName: string
  onClose: () => void
}

export default function DocumentViewer({ fileId, fileName, onClose }: DocumentViewerProps) {
  const [fileUrl, setFileUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const token = getAuthToken()
        if (!token) {
          setError('Non authentifié')
          setLoading(false)
          return
        }

        // Create blob URL for the document
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${fileId}/download`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du document')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setFileUrl(url)
      } catch (err) {
        console.error('Error loading document:', err)
        setError('Impossible de charger le document')
      } finally {
        setLoading(false)
      }
    }

    loadDocument()

    // Cleanup blob URL on unmount
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [fileId])

  const isPDF = fileName.toLowerCase().endsWith('.pdf')
  const isExcel = fileName.toLowerCase().endsWith('.xlsx') || 
                  fileName.toLowerCase().endsWith('.xls') || 
                  fileName.toLowerCase().endsWith('.csv')
  const isDocx = fileName.toLowerCase().endsWith('.docx')
  const isText = fileName.toLowerCase().endsWith('.txt')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 dark:bg-opacity-90">
      <div className="relative w-full h-full max-w-7xl max-h-screen m-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{fileName}</h3>
          <div className="flex gap-2">
            <a
              href={fileUrl}
              download={fileName}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Télécharger
            </a>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-red-400 dark:text-red-500 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : isPDF ? (
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={fileName}
            />
          ) : isExcel ? (
            <ExcelViewer fileUrl={fileUrl} />
          ) : isDocx ? (
            <DocxViewer fileUrl={fileUrl} />
          ) : isText ? (
            <iframe
              src={fileUrl}
              className="w-full h-full bg-white p-4"
              title={fileName}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-8 bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Prévisualisation non disponible pour ce type de fichier
                </p>
                <a
                  href={fileUrl}
                  download={fileName}
                  className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Télécharger le fichier
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
