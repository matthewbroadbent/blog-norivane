import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PostEditor } from '../components/PostEditor'
import { supabaseAdmin } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Post } from '../types'

export function NewPost() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSave = async (postData: Partial<Post>) => {
    if (!user) throw new Error('User not authenticated')

    // Use admin client to bypass RLS for creating posts
    const { error } = await supabaseAdmin
      .from('posts')
      .insert([{
        ...postData,
        author_id: user.id,
      }])

    if (error) throw error
  }

  return <PostEditor onSave={handleSave} />
}
