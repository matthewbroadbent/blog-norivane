import React from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Logo } from './Logo'

export function ConfigurationCheck() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="text-yellow-600" size={48} />
            </div>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              Supabase Configuration Required
            </h2>
            <p className="text-yellow-700 mb-4">
              Please connect to Supabase in the chat box before proceeding with database operations.
            </p>
            <div className="bg-white rounded-md p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Required Steps:</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Connect to Supabase in the chat</li>
                <li>Ensure your .env file has the correct credentials</li>
                <li>Refresh this page</li>
              </ol>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors"
            >
              <ExternalLink size={16} />
              <span>Open Supabase Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
