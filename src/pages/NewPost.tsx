import React, { useState } from 'react'
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
  
  const { user } = useAuth()
  const navigate = useNavigate()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            excerpt: excerpt || content.substring(0, 160) + '...',
            slug: slug || generateSlug(title),
            featured_image: featuredImage || null,
            status,
            meta_description: metaDescription || excerpt || content.substring(0, 160),
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            author_id: user.id
          }
        ])

      if (error) throw error

      toast.success(`Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)
      navigate('/')
    } catch (error) {
      toast.error('Error creating post')
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
        </div>
        
        <div className="header-actions">
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
