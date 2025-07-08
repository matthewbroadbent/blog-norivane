import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { ArrowRight, Mail, Lock, User } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Account created successfully! You can now sign in.')
          setIsSignUp(false)
          setPassword('')
          setCurrentStep(0)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Signed in successfully!')
          navigate('/')
        }
      }
    } catch (error) {
      toast.error(`An error occurred during ${isSignUp ? 'sign up' : 'sign in'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp)
    setPassword('')
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep === 0 && email) {
      setCurrentStep(1)
    }
  }

  const prevStep = () => {
    if (currentStep === 1) {
      setCurrentStep(0)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient"></div>
      </div>
      
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
                  style={{ width: `${((currentStep + 1) / 2) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">{currentStep + 1} of 2</span>
            </div>
          </div>

          <div className="auth-body">
            <form onSubmit={handleSubmit} className="auth-form">
              {currentStep === 0 ? (
                <div className="form-step active">
                  <div className="step-icon">
                    <Mail size={24} />
                  </div>
                  
                  <h1 className="step-title">
                    {isSignUp ? "Let's create your admin account" : "Welcome back"}
                  </h1>
                  
                  <p className="step-subtitle">
                    {isSignUp 
                      ? "First, we'll need your email address to set up your CMS"
                      : "Enter your email to access your blog CMS"
                    }
                  </p>

                  <div className="input-group">
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="auth-input"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!email}
                    className="auth-button primary"
                  >
                    Continue
                    <ArrowRight size={20} />
                  </button>
                </div>
              ) : (
                <div className="form-step active">
                  <div className="step-icon">
                    <Lock size={24} />
                  </div>
                  
                  <h1 className="step-title">
                    {isSignUp ? "Create a secure password" : `Welcome back, ${email.split('@')[0]}`}
                  </h1>
                  
                  <p className="step-subtitle">
                    {isSignUp 
                      ? "Choose a strong password to protect your content"
                      : "Enter your password to continue"
                    }
                  </p>

                  <div className="input-group">
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSignUp ? "Create password" : "Enter password"}
                        className="auth-input"
                        required
                        minLength={isSignUp ? 6 : undefined}
                        autoFocus
                      />
                    </div>
                    {isSignUp && (
                      <p className="input-hint">
                        Password must be at least 6 characters long
                      </p>
                    )}
                  </div>

                  <div className="button-group">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="auth-button secondary"
                    >
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading || !password}
                      className="auth-button primary"
                    >
                      {isLoading ? (
                        <div className="button-loading">
                          <div className="loading-spinner"></div>
                        </div>
                      ) : (
                        <>
                          {isSignUp ? 'Create Account' : 'Sign In'}
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="auth-footer">
            <button
              type="button"
              onClick={handleModeSwitch}
              className="mode-switch"
            >
              {isSignUp 
                ? 'Already have an account? Sign in instead' 
                : 'Need to create an admin account? Sign up instead'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
