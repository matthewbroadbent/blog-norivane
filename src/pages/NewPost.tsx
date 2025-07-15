import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PostEditor } from '../components/PostEditor'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Post } from '../types'

export function NewPost() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSave = async (postData: Partial<Post>) => {
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('posts')
      .insert([{
        ...postData,
        author_id: user.id,
      }])

    if (error) throw error
  }

  return <PostEditor onSave={handleSave} />
}
