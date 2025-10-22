'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Login from '@/components/Auth/Login'
import Register from '@/components/Auth/Register'

export default function Home() {
  const [showLogin, setShowLogin] = useState(true)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            File Manager RAG
          </h1>
          <p className="text-gray-600">
            Gestion intelligente de documents avec IA
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                showLogin
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                !showLogin
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inscription
            </button>
          </div>

          {showLogin ? <Login /> : <Register onSuccess={() => setShowLogin(true)} />}
        </div>
      </div>
    </main>
  )
}
