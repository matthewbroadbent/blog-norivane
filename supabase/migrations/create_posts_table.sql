/*
  # Create posts table for Norivane blog CMS

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text, required) - Post title
      - `slug` (text, unique, required) - URL-friendly version of title
      - `content` (text, required) - Main post content in Markdown
      - `excerpt` (text) - Brief description/summary
      - `featured_image` (text) - URL to featured image
      - `status` (enum) - Either 'draft' or 'published'
      - `published_at` (timestamptz) - When post was published
      - `created_at` (timestamptz) - When post was created
      - `updated_at` (timestamptz) - When post was last updated
      - `author_id` (uuid, foreign key) - References auth.users
      - `meta_title` (text) - SEO meta title
      - `meta_description` (text) - SEO meta description
      - `tags` (text array) - Post tags for categorisation

  2. Security
    - Enable RLS on `posts` table
    - Add policy for authenticated users to manage posts
    - Add policy for public read access to published posts

  3. Indexes
    - Index on slug for fast lookups
    - Index on status and published_at for filtering
    - Index on author_id for author-specific queries
*/

-- Create enum for post status
CREATE TYPE post_status AS ENUM ('draft', 'published');

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text DEFAULT '',
  featured_image text,
  status post_status DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  meta_title text,
  meta_description text,
  tags text[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can manage posts"
  ON posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read published posts"
  ON posts
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();