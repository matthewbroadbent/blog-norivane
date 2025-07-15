/*
  # Create posts table for Norivane blog

  1. New Tables
    - `posts`
      - `id` (uuid, primary key) - Unique identifier for each post
      - `title` (text, required) - Post title
      - `slug` (text, unique, required) - URL-friendly version of title
      - `content` (jsonb) - TipTap editor JSON content with rich text and videos
      - `excerpt` (text) - Brief post description
      - `featured_image` (text) - URL to featured image
      - `status` (text) - Post status: 'draft' or 'published'
      - `published_at` (timestamptz) - When post was published
      - `created_at` (timestamptz) - When post was created
      - `updated_at` (timestamptz) - When post was last updated
      - `author_id` (uuid) - References auth.users for post author
      - `meta_title` (text) - SEO meta title
      - `meta_description` (text) - SEO meta description
      - `tags` (text array) - Post tags for categorization

  2. Security
    - Enable RLS on `posts` table
    - Add policy for authenticated users to manage their posts
    - Add policy for public read access to published posts

  3. Indexes
    - Index on slug for fast lookups
    - Index on status and published_at for filtering
    - Index on author_id for author-specific queries
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content jsonb,
  excerpt text,
  featured_image text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  meta_title text,
  meta_description text,
  tags text[] DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- RLS Policies

-- Policy: Authenticated users can manage their own posts
CREATE POLICY "Authors can manage own posts"
  ON posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy: Public can read published posts
CREATE POLICY "Public can read published posts"
  ON posts
  FOR SELECT
  TO public
  USING (status = 'published');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();