import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Grid, List, Calendar, TrendingUp } from 'lucide-react'
import { PostCard } from '../components/PostCard'
import { Post } from '../types'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner large"></div>
        <p className="loading-text">Loading your posts...</p>
      </div>
    )
  }

  return (
    <div className="post-list-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Blog Posts</h1>
            <p className="page-subtitle">Manage and create engaging content for your blog</p>
          </div>
          
          <Link to="/new" className="create-btn">
            <Plus size={20} />
            <span>New Post</span>
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FileText size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Posts</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon published">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.published}</span>
              <span className="stat-label">Published</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon drafts">
              <Calendar size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.drafts}</span>
              <span className="stat-label">Drafts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-controls">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search posts by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
              className="filter-select"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
          
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={48} />
          </div>
          <h3 className="empty-title">
            {posts.length === 0 ? "No posts yet" : "No posts found"}
          </h3>
          <p className="empty-description">
            {posts.length === 0 
              ? "Start creating engaging content for your blog audience."
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {posts.length === 0 && (
            <Link to="/new" className="empty-action">
              <Plus size={20} />
              Create Your First Post
            </Link>
          )}
        </div>
      ) : (
        <div className={`posts-container ${viewMode}`}>
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}
