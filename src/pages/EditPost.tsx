import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PostEditor } from '../components/PostEditor'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { Post } from '../types'
import toast from 'react-hot-toast'

export function EditPost() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPost(id)
    }
  }, [id])

  const fetchPost = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) throw error
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Error loading post')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (postData: Partial<Post>) => {
    if (!id) throw new Error('Post ID not found')

    // Use admin client to bypass RLS for updating posts
    const { error } = await supabaseAdmin
      .from('posts')
      .update(postData)
      .eq('id', id)

    if (error) throw error
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading" />
        <span className="ml-2 text-gray-600">Loading post...</span>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h2>
        <p className="text-gray-600">The post you're looking for doesn't exist.</p>
      </div>
    )
  }

  return <PostEditor post={post} onSave={handleSave} />
}
