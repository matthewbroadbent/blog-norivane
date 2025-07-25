import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Calendar, Tag } from 'lucide-react'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { Post } from '../types'
import toast from 'react-hot-toast'

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Error loading posts')
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      // Use admin client to bypass RLS for deleting posts
      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setPosts(posts.filter(post => post.id !== id))
      toast.success('Post deleted successfully')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Error deleting post')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading" />
        <span className="ml-2 text-gray-600">Loading posts...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-2">Manage your blog content</p>
        </div>
        
        <Link to="/new" className="btn-primary flex items-center space-x-2">
          <Plus size={16} />
          <span>New Post</span>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first blog post.</p>
          <Link to="/new" className="btn-primary">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <div key={post.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {post.title}
                    </h2>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>
                        {post.published_at 
                          ? `Published ${formatDate(post.published_at)}`
                          : `Created ${formatDate(post.created_at)}`
                        }
                      </span>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Tag size={14} />
                        <span>{post.tags.slice(0, 3).join(', ')}</span>
                        {post.tags.length > 3 && <span>+{post.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {post.status === 'published' && (
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="View Post"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  
                  <Link
                    to={`/edit/${post.id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                    title="Edit Post"
                  >
                    <Edit size={16} />
                  </Link>
                  
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete Post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
