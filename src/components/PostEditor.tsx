import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { TipTapEditor } from './TipTapEditor'
import { Post } from '../types'
import toast from 'react-hot-toast'

interface PostEditorProps {
  post?: Post
  onSave: (data: Partial<Post>) => Promise<void>
}

interface FormData {
  title: string
  slug: string
  content: any
  excerpt: string
  featured_image: string
  status: 'draft' | 'published'
  meta_title: string
  meta_description: string
  tags: string
}

export function PostEditor({ post, onSave }: PostEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editorContent, setEditorContent] = useState(post?.content || null)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content || null,
      excerpt: post?.excerpt || '',
      featured_image: post?.featured_image || '',
      status: post?.status || 'draft',
      meta_title: post?.meta_title || '',
      meta_description: post?.meta_description || '',
      tags: post?.tags?.join(', ') || '',
    }
  })

  const title = watch('title')

  // Auto-generate slug from title
  React.useEffect(() => {
    if (title && !post) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', slug)
    }
  }, [title, setValue, post])

  const onSubmit = async (data: FormData) => {
    setIsSaving(true)
    try {
      const postData: Partial<Post> = {
        ...data,
        content: editorContent,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        published_at: data.status === 'published' && post?.status !== 'published' 
          ? new Date().toISOString() 
          : post?.published_at
      }
      
      await onSave(postData)
      toast.success(post ? 'Post updated successfully!' : 'Post created successfully!')
      navigate('/')
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error('Error saving post')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} />
            <span>Back to Posts</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {post ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye size={16} />
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2"
          >
            {isSaving ? <div className="loading" /> : <Save size={16} />}
            <span>{isSaving ? 'Saving...' : 'Save Post'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isPreview ? (
            <div className="card">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              <div className="prose prose-lg max-w-none">
                {/* Preview would render the TipTap content as HTML */}
                <div>Preview mode - content would be rendered here</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="card">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    id="title"
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter post title..."
                  />
                  {errors.title && <div className="error">{errors.title.message}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="slug">Slug *</label>
                  <input
                    id="slug"
                    type="text"
                    {...register('slug', { required: 'Slug is required' })}
                    placeholder="post-url-slug"
                  />
                  {errors.slug && <div className="error">{errors.slug.message}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="excerpt">Excerpt</label>
                  <textarea
                    id="excerpt"
                    rows={3}
                    {...register('excerpt')}
                    placeholder="Brief description of the post..."
                  />
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <TipTapEditor
                    content={editorContent}
                    onChange={setEditorContent}
                    placeholder="Start writing your post..."
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Post Settings</h3>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="featured_image">Featured Image URL</label>
              <input
                id="featured_image"
                type="url"
                {...register('featured_image')}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                id="tags"
                type="text"
                {...register('tags')}
                placeholder="tag1, tag2, tag3"
              />
              <div className="meta-text">Separate tags with commas</div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
            
            <div className="form-group">
              <label htmlFor="meta_title">Meta Title</label>
              <input
                id="meta_title"
                type="text"
                {...register('meta_title')}
                placeholder="SEO title for search engines"
              />
            </div>

            <div className="form-group">
              <label htmlFor="meta_description">Meta Description</label>
              <textarea
                id="meta_description"
                rows={3}
                {...register('meta_description')}
                placeholder="SEO description for search engines"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
