'use client'

import Login from '@/components/Auth/Login'
import Register from '@/components/Auth/Register'
import { useState } from "react";

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            File Manager RAG
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestion intelligente de documents avec IA
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                showLogin
                  ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                !showLogin
                  ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Inscription
            </button>
          </div>

          {showLogin ? (
            <Login />
          ) : (
            <Register onSuccess={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    </main>
  );
}
