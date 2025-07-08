import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Image, Tag, Calendar, Globe } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export function NewPost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [slug, setSlug] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [tags, setTags] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [dbStatus, setDbStatus] = useState<string>('checking...')
  
  const { user } = useAuth()
  const navigate = useNavigate()

  // Check database connection and table structure on component mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        console.log('Checking database connection...')
        
        // Test basic connection
        const { data: connectionTest, error: connectionError } = await supabase
          .from('posts')
          .select('count')
          .limit(1)

        if (connectionError) {
          console.error('Database connection error:', connectionError)
          setDbStatus(`Connection failed: ${connectionError.message}`)
          return
        }

        console.log('Database connection successful')
        
        // Check table structure
        const { data: tableInfo, error: tableError } = await supabase
          .rpc('get_table_info', { table_name: 'posts' })
          .single()

        if (tableError) {
          console.log('Could not get table info (this is normal):', tableError.message)
        } else {
          console.log('Table structure:', tableInfo)
        }

        setDbStatus('Connected')
      } catch (error: any) {
        console.error('Database check failed:', error)
        setDbStatus(`Error: ${error.message}`)
      }
    }

    if (user) {
      checkDatabase()
    }
  }, [user])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value))
    }
  }

  const testDatabaseWrite = async () => {
    try {
      console.log('Testing database write with minimal data...')
      
      const testData = {
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post-' + Date.now(),
        status: 'draft' as const,
        author_id: user?.id
      }

      console.log('Test data:', testData)

      const { data, error } = await supabase
        .from('posts')
        .insert([testData])
        .select()

      if (error) {
        console.error('Test write failed:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        toast.error(`Database test failed: ${error.message}`)
      } else {
        console.log('Test write successful:', data)
        toast.success('Database test successful!')
        
        // Clean up test post
        if (data && data[0]) {
          await supabase.from('posts').delete().eq('id', data[0].id)
          console.log('Test post cleaned up')
        }
      }
    } catch (error: any) {
      console.error('Test write exception:', error)
      toast.error(`Test failed: ${error.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to create a post')
      return
    }

    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!content.trim()) {
      toast.error('Content is required')
      return
    }

    setIsLoading(true)

    try {
      console.log('=== POST CREATION DEBUG ===')
      console.log('User:', user)
      console.log('Environment:', {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      })

      const postData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 160) + '...',
        slug: slug.trim() || generateSlug(title),
        featured_image: featuredImage.trim() || null,
        status,
        meta_description: metaDescription.trim() || excerpt.trim() || content.substring(0, 160),
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        author_id: user.id,
        published_at: status === 'published' ? new Date().toISOString() : null
      }

      console.log('Post data to insert:', postData)
      console.log('Data types:', {
        title: typeof postData.title,
        content: typeof postData.content,
        slug: typeof postData.slug,
        status: typeof postData.status,
        author_id: typeof postData.author_id,
        tags: Array.isArray(postData.tags)
      })

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('=== SUPABASE ERROR DETAILS ===')
        console.error('Code:', error.code)
        console.error('Message:', error.message)
        console.error('Details:', error.details)
        console.error('Hint:', error.hint)
        console.error('Full error object:', error)
        
        throw error
      }

      console.log('Post created successfully:', data)
      toast.success(`Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)
      navigate('/')
    } catch (error: any) {
      console.error('=== CATCH BLOCK ERROR ===')
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error.constructor.name)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Full error:', error)
      console.error('Error stack:', error.stack)
      
      // More specific error messages
      if (error.code === '23505') {
        toast.error('A post with this slug already exists. Please use a different title or slug.')
      } else if (error.code === '42501') {
        toast.error('Permission denied. Please check your authentication.')
      } else if (error.code === '42P01') {
        toast.error('Posts table does not exist. Please check your database setup.')
      } else if (error.message?.includes('posts')) {
        toast.error('Database error: ' + error.message)
      } else {
        toast.error('Error creating post: ' + (error.message || 'Unknown error - check console for details'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div className="header-left">
          <button
            onClick={() => navigate('/')}
            className="back-btn"
          >
            <ArrowLeft size={20} />
            <span>Back to Posts</span>
          </button>
          <div className="header-divider"></div>
          <h1 className="editor-title">Create New Post</h1>
          <span className="db-status" style={{ 
            marginLeft: '1rem', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '4px', 
            fontSize: '0.75rem',
            backgroundColor: dbStatus === 'Connected' ? '#10b981' : '#ef4444',
            color: 'white'
          }}>
            DB: {dbStatus}
          </span>
        </div>
        
        <div className="header-actions">
          <button
            onClick={testDatabaseWrite}
            className="preview-btn"
            style={{ marginRight: '0.5rem' }}
          >
            Test DB
          </button>
          
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`preview-btn ${previewMode ? 'active' : ''}`}
          >
            <Eye size={18} />
            <span>Preview</span>
          </button>
          
          <div className="save-actions">
            <button
              onClick={(e) => {
                setStatus('draft')
                handleSubmit(e)
              }}
              disabled={isLoading || !title.trim()}
              className="save-btn draft"
            >
              <Save size={18} />
              <span>{isLoading ? 'Saving...' : 'Save Draft'}</span>
            </button>
            
            <button
              onClick={(e) => {
                setStatus('published')
                handleSubmit(e)
              }}
              disabled={isLoading || !title.trim() || !content.trim()}
              className="save-btn publish"
            >
              <Globe size={18} />
              <span>{isLoading ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="editor-container">
        {!previewMode ? (
          <div className="editor-form">
            <div className="form-section main">
              <div className="input-group">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter your post title..."
                  className="title-input"
                  autoFocus
                />
              </div>

              <div className="input-group">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your post content..."
                  className="content-textarea"
                  rows={20}
                />
              </div>
            </div>

            <div className="form-section sidebar">
              <div className="section-card">
                <div className="section-header">
                  <Tag size={18} />
                  <h3>Post Settings</h3>
                </div>
                
                <div className="input-group">
                  <label>Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief description of your post..."
                    className="excerpt-input"
                    rows={3}
                  />
                </div>

                <div className="input-group">
                  <label>URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-url-slug"
                    className="slug-input"
                  />
                  <span className="input-hint">
                    norivane.co.uk/blog/{slug || 'your-post-slug'}
                  </span>
                </div>

                <div className="input-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="tags-input"
                  />
                  <span className="input-hint">Separate tags with commas</span>
                </div>
              </div>

              <div className="section-card">
                <div className="section-header">
                  <Image size={18} />
                  <h3>Featured Image</h3>
                </div>
                
                <div className="input-group">
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="image-input"
                  />
                  {featuredImage && (
                    <div className="image-preview">
                      <img src={featuredImage} alt="Featured" />
                    </div>
                  )}
                </div>
              </div>

              <div className="section-card">
                <div className="section-header">
                  <Globe size={18} />
                  <h3>SEO Settings</h3>
                </div>
                
                <div className="input-group">
                  <label>Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description for search engines..."
                    className="meta-input"
                    rows={3}
                  />
                  <span className="input-hint">
                    {metaDescription.length}/160 characters
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-container">
            <div className="preview-content">
              <h1 className="preview-title">{title || 'Untitled Post'}</h1>
              {featuredImage && (
                <img src={featuredImage} alt="Featured" className="preview-image" />
              )}
              <div className="preview-text">
                {content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
