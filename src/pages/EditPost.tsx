import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PostEditor } from '../components/PostEditor'
import { Post } from '../types'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function EditPost() {
  const { id } = useParams<{ id: string }>()
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
      toast.error('Error fetching post')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: Partial<Post>) => {
    if (!id) throw new Error('Post ID not found')

    const { error } = await supabase
      .from('posts')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
        <p className="text-gray-600">The post you're looking for doesn't exist.</p>
      </div>
    )
  }

  return <PostEditor post={post} onSave={handleSave} />
}
