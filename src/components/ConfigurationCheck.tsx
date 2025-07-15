import React from 'react'
import { AlertTriangle, Settings, Database } from 'lucide-react'

export function ConfigurationCheck() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Configuration Required
          </h1>
          <p className="text-gray-600">
            Please connect to Supabase before proceeding with the application.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Database className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Supabase Setup</h3>
              <p className="text-sm text-blue-700 mt-1">
                Connect to Supabase in the chat box to configure your database connection.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <Settings className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Environment Variables</h3>
              <p className="text-sm text-gray-600 mt-1">
                Make sure your <code className="bg-gray-200 px-1 rounded">.env</code> file contains:
              </p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>• VITE_SUPABASE_URL</li>
                <li>• VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This application requires a properly configured Supabase project with authentication enabled and the posts table set up.
          </p>
        </div>
      </div>
    </div>
  )
}
