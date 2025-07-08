import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, PenTool, FileText, Plus, Search, Bell, User } from 'lucide-react'
import { Logo } from './Logo'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      navigate('/login')
    }
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="cms-layout">
      <header className="cms-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="logo-container">
              <Logo size="md" variant="dark" />
              <div className="cms-badge">
                <span>CMS</span>
              </div>
            </Link>
          </div>
          
          <nav className="header-nav">
            <Link 
              to="/" 
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Posts</span>
            </Link>
            <Link 
              to="/new" 
              className={`nav-item ${isActive('/new') ? 'active' : ''}`}
            >
              <PenTool size={18} />
              <span>New Post</span>
            </Link>
          </nav>

          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <User size={16} />
              </div>
              <div className="user-details">
                <span className="user-email">{user?.email}</span>
                <span className="user-role">Admin</span>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="sign-out-btn"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="cms-main">
        <div className="main-container">
          {children}
        </div>
      </main>
    </div>
  )
}
