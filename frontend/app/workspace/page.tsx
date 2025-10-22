'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Layout/Navbar'
import FileManager from '@/components/FileManager/FileManager'
import ChatInterface from '@/components/Chat/ChatInterface'
import { checkAuth } from '@/lib/auth'

export default function WorkspacePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const auth = checkAuth()
    if (!auth) {
      router.push('/')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onToggleChat={() => setShowChat(!showChat)} />

      <div className="flex">
        <div
          className={`${
            showChat ? "w-1/2" : "w-full"
          } bg-gray-50 dark:bg-gray-900 transition-all duration-300`}
        >
          <FileManager />
        </div>

        {showChat && (
          <div className="w-1/2 bg-gray-50 dark:bg-gray-900 border-l border-gray-200">
            <ChatInterface onClose={() => setShowChat(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
