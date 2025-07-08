export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image?: string
  status: 'draft' | 'published'
  published_at?: string
  created_at: string
  updated_at: string
  author_id: string
  meta_title?: string
  meta_description?: string
  tags?: string[]
}

export interface User {
  id: string
  email: string
  created_at: string
}
