'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '@/lib/api'
import { FileItem } from '@/types'
import FileList from './FileList'

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const response = await api.get('/files')
      setFiles(response.data)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true)

    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        await api.post('/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }

    setUploading(false)
    fetchFiles()
  }

  const handleDelete = async (fileId: string) => {
    try {
      await api.delete(`/files/${fileId}`)
      fetchFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes Documents</h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              {uploading ? (
                <p className="font-medium">Upload en cours...</p>
              ) : isDragActive ? (
                <p className="font-medium">Déposez les fichiers ici</p>
              ) : (
                <>
                  <p className="font-medium">
                    Glissez-déposez vos fichiers ici, ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Formats supportés: PDF, XLSX, CSV, DOCX, TXT
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <FileList files={files} onDelete={handleDelete} loading={loading} />
    </div>
  )
}
