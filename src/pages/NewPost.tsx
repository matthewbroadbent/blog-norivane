import React from 'react'
import { PostEditor } from '../components/PostEditor'
import { Post } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export function NewPost() {
  const { user } = useAuth()

  const handleSave = async (data: Partial<Post>) => {
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('posts')
      .insert([{
        ...data,
        author_id: user.id,
      }])

    if (error) throw error
  }

  return <PostEditor onSave={handleSave} />
}
