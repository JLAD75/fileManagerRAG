'use client'

import { useRouter } from 'next/navigation'
import { getUserData, removeAuthData } from '@/lib/auth'

interface NavbarProps {
  onToggleChat: () => void
}

export default function Navbar({ onToggleChat }: NavbarProps) {
  const router = useRouter()
  const user = getUserData()

  const handleLogout = () => {
    removeAuthData()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              File Manager RAG
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleChat}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Agent IA
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
