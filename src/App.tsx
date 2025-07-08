import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { PostList } from './pages/PostList'
import { NewPost } from './pages/NewPost'
import { EditPost } from './pages/EditPost'
import { ConfigurationCheck } from './components/ConfigurationCheck'
import { useAuth } from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

function App() {
  // Check if Supabase is properly configured
  if (!isSupabaseConfigured) {
    return <ConfigurationCheck />
  }

  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading" />
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PostList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <NewPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
