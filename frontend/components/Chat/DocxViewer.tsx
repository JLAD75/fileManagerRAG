'use client'

import mammoth from 'mammoth'
import { useEffect, useState } from 'react'

interface DocxViewerProps {
  fileUrl: string
}

export default function DocxViewer({ fileUrl }: DocxViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadDocx = async () => {
      try {
        const response = await fetch(fileUrl)
        const arrayBuffer = await response.arrayBuffer()
        
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Title'] => h1:fresh",
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Heading 4'] => h4:fresh",
              "p[style-name='Quote'] => blockquote:fresh",
            ],
          }
        )

        setHtmlContent(result.value)

        // Log any warnings
        if (result.messages.length > 0) {
          console.log('Mammoth conversion messages:', result.messages)
        }
      } catch (err) {
        console.error('Error loading DOCX:', err)
        setError('Erreur lors de la lecture du fichier Word')
      } finally {
        setLoading(false)
      }
    }

    loadDocx()
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

  if (!htmlContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Aucun contenu trouvé dans ce document</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Document content with Word-like styling */}
        <div
          className="docx-content prose prose-sm md:prose-base lg:prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            fontFamily: 'Calibri, Arial, sans-serif',
            lineHeight: '1.6',
            color: '#333',
          }}
        />
      </div>

      {/* CSS for Word-like styling */}
      <style jsx>{`
        .docx-content {
          /* Headings */
        }
        .docx-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: #2c3e50;
        }
        .docx-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.8em;
          margin-bottom: 0.4em;
          color: #34495e;
        }
        .docx-content h3 {
          font-size: 1.2em;
          font-weight: bold;
          margin-top: 0.6em;
          margin-bottom: 0.3em;
          color: #34495e;
        }
        .docx-content p {
          margin-bottom: 0.8em;
          text-align: justify;
        }
        .docx-content ul,
        .docx-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .docx-content li {
          margin-bottom: 0.3em;
        }
        .docx-content blockquote {
          border-left: 4px solid #3498db;
          padding-left: 1em;
          margin-left: 0;
          font-style: italic;
          color: #555;
        }
        .docx-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .docx-content table td,
        .docx-content table th {
          border: 1px solid #ddd;
          padding: 8px;
        }
        .docx-content table th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: left;
        }
        .docx-content strong {
          font-weight: bold;
        }
        .docx-content em {
          font-style: italic;
        }
        .docx-content u {
          text-decoration: underline;
        }
        .docx-content a {
          color: #3498db;
          text-decoration: underline;
        }
        .docx-content img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
      `}</style>
    </div>
  )
}
