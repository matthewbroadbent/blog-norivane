import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { PostCard } from '../components/PostCard'
import { Post } from '../types'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')

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
      toast.error('Error fetching posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setPosts(posts.filter(post => post.id !== id))
      toast.success('Post deleted successfully')
    } catch (error) {
      toast.error('Error deleting post')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading" />
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
          <Plus size={20} />
          <span>New Post</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
          className="w-full sm:w-auto"
        >
          <option value="all">All Posts</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600 mb-6">
            {posts.length === 0 
              ? "Get started by creating your first blog post."
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {posts.length === 0 && (
            <Link to="/new" className="btn-primary">
              Create Your First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
