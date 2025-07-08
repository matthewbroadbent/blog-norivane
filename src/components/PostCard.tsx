import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Edit, Eye, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Post } from '../types'

interface PostCardProps {
  post: Post
  onDelete: (id: string) => void
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id)
    }
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {post.featured_image && (
        <img 
          src={post.featured_image} 
          alt={post.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      
      <div className="flex items-center justify-between mb-2">
        <span className={`status-badge ${post.status === 'published' ? 'status-published' : 'status-draft'}`}>
          {post.status}
        </span>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar size={14} />
          <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2 text-gray-900">{post.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link
            to={`/edit/${post.id}`}
            className="flex items-center space-x-1 text-teal-600 hover:text-teal-700 transition-colors"
          >
            <Edit size={16} />
            <span>Edit</span>
          </Link>
          {post.status === 'published' && (
            <a
              href={`https://norivane.co.uk/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Eye size={16} />
              <span>View</span>
            </a>
          )}
        </div>
        
        <button
          onClick={handleDelete}
          className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  )
}
