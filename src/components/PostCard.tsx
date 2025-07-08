import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Edit, Eye, Trash2, Clock, User, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { Post } from '../types'

interface PostCardProps {
  post: Post
  onDelete: (id: string) => void
  viewMode?: 'grid' | 'list'
}

export function PostCard({ post, onDelete, viewMode = 'grid' }: PostCardProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      onDelete(post.id)
    }
  }

  const cardClass = viewMode === 'list' ? 'post-card list-view' : 'post-card grid-view'

  return (
    <article className={cardClass}>
      {post.featured_image && viewMode === 'grid' && (
        <div className="post-image">
          <img 
            src={post.featured_image} 
            alt={post.title}
            loading="lazy"
          />
          <div className="image-overlay">
            <span className={`status-badge ${post.status}`}>
              {post.status}
            </span>
          </div>
        </div>
      )}
      
      <div className="post-content">
        {viewMode === 'list' && (
          <div className="list-meta">
            {post.featured_image && (
              <div className="list-image">
                <img src={post.featured_image} alt={post.title} />
              </div>
            )}
            <span className={`status-badge ${post.status}`}>
              {post.status}
            </span>
          </div>
        )}

        <div className="post-header">
          <h3 className="post-title">{post.title}</h3>
          <div className="post-meta">
            <div className="meta-item">
              <Calendar size={14} />
              <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
            </div>
            <div className="meta-item">
              <Clock size={14} />
              <span>{Math.ceil(post.content.length / 1000)} min read</span>
            </div>
          </div>
        </div>

        <p className="post-excerpt">{post.excerpt}</p>

        <div className="post-actions">
          <div className="action-group">
            <Link
              to={`/edit/${post.id}`}
              className="action-btn primary"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>
            
            {post.status === 'published' && (
              <a
                href={`https://norivane.co.uk/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn secondary"
              >
                <ExternalLink size={16} />
                <span>View Live</span>
              </a>
            )}
          </div>
          
          <button
            onClick={handleDelete}
            className="action-btn danger"
            title="Delete post"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
