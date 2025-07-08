import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from 'lucide-react'
import { Logo } from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, signIn, signUp } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Account created successfully!')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Welcome back!')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-gradient"></div>
      
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Logo size="lg" variant="dark" />
            </div>
            
            <div className="auth-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: isSignUp ? '100%' : '50%' }}
                ></div>
              </div>
              <span className="progress-text">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </span>
            </div>
          </div>

          <div className="auth-body">
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-step active">
                <div className="step-icon">
                  {isSignUp ? <UserPlus size={24} /> : <LogIn size={24} />}
                </div>
                
                <h1 className="step-title">
                  {isSignUp ? 'Create your account' : 'Sign in to your account'}
                </h1>
                
                <p className="step-subtitle">
                  {isSignUp 
                    ? 'Join Norivane and start managing your blog content with ease.'
                    : 'Welcome back to your blog management dashboard.'
                  }
                </p>

                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="auth-input"
                      required
                      disabled={loading}
                    />
                    <Mail size={20} className="input-icon" />
                  </div>
                  <div className="input-hint">
                    <span>We'll use this to send you important updates</span>
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="auth-input"
                      required
                      disabled={loading}
                    />
                    <Lock size={20} className="input-icon" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="input-hint">
                    <span>
                      {isSignUp 
                        ? 'Choose a strong password with at least 6 characters'
                        : 'Enter the password for your account'
                      }
                    </span>
                  </div>
                </div>

                <div className="button-group">
                  <button
                    type="submit"
                    className="auth-button primary"
                    disabled={loading || !email || !password}
                  >
                    {loading ? (
                      <div className="button-loading">
                        <div className="loading-spinner"></div>
                      </div>
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="auth-footer">
            <button
              type="button"
              onClick={toggleMode}
              className="mode-switch"
              disabled={loading}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
