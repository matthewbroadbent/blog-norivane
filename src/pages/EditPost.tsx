import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Image, Tag, Calendar, Globe, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Post } from '../types'
import toast from 'react-hot-toast'

export function EditPost() {
  const [post, setPost] = useState<Post | null>(null)
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
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setPost(data)
      setTitle(data.title)
      setContent(data.content)
      setExcerpt(data.excerpt || '')
      setSlug(data.slug)
      setFeaturedImage(data.featured_image || '')
      setStatus(data.status)
      setTags(data.tags ? data.tags.join(', ') : '')
      setMetaDescription(data.meta_description || '')
    } catch (error) {
      toast.error('Error fetching post')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          excerpt: excerpt || content.substring(0, 160) + '...',
          slug,
          featured_image: featuredImage || null,
          status,
          meta_description: metaDescription || excerpt || content.substring(0, 160),
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success(`Post ${status === 'published' ? 'published' : 'updated'} successfully!`)
      navigate('/')
    } catch (error) {
      toast.error('Error updating post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Post deleted successfully')
      navigate('/')
    } catch (error) {
      toast.error('Error deleting post')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner large"></div>
        <p className="loading-text">Loading post...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="error-container">
        <h2>Post not found</h2>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Posts
        </button>
      </div>
    )
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
          <h1 className="editor-title">Edit Post</h1>
        </div>
        
        <div className="header-actions">
          <button
            onClick={handleDelete}
            className="delete-btn"
          >
            <Trash2 size={18} />
            <span>Delete</span>
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
              <span>Save Draft</span>
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
              <span>Publish</span>
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
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title..."
                  className="title-input"
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
