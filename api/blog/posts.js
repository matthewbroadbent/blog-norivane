import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dlcisomjvwmxtlhnsgmh.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsY2lzb21qdndteHRsaG5zZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NzA2MTEsImV4cCI6MjA2NzU0NjYxMX0.umIDH1GBa5EaUGe5ROC7AanE8QmVNM8Y0IOjRyNqz60'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      res.status(500).json({ error: 'Failed to fetch posts' })
      return
    }

    // Transform posts for public consumption
    const publicPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      published_at: post.published_at,
      created_at: post.created_at,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      tags: post.tags || []
    }))

    res.status(200).json({ posts: publicPosts })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
