import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, PenTool, FileText, Settings } from 'lucide-react'
import { Logo } from './Logo'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <Logo size="md" />
              <span className="text-sm font-medium text-gray-600">CMS</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <FileText size={18} />
                <span>Posts</span>
              </Link>
              <Link 
                to="/new" 
                className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <PenTool size={18} />
                <span>New Post</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
