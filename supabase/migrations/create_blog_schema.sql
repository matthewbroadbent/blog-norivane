/*
# Blog CMS Database Schema

## Overview
This migration creates the complete database schema for the blog CMS system, including posts table with all necessary columns for content management, SEO, and user relationships.

## 1. New Tables
- `posts` - Main content table for blog posts
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text, required) - Post title
  - `slug` (text, unique, required) - URL-friendly identifier
  - `content` (text, required) - Main post content
  - `excerpt` (text) - Brief description/summary
  - `featured_image` (text) - URL to featured image
  - `status` (enum) - Publication status (draft/published)
  - `published_at` (timestamptz) - Publication timestamp
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `author_id` (uuid) - Reference to auth.users
  - `meta_title` (text) - SEO title override
  - `meta_description` (text) - SEO description
  - `tags` (text array) - Post tags for categorization

## 2. Security
- Enable RLS on posts table
- Add policies for authenticated users to manage their own posts
- Add policy for public read access to published posts

## 3. Indexes
- Unique index on slug for fast URL lookups
- Index on status and published_at for filtering
- Index on author_id for user-specific queries

## 4. Functions
- Auto-update updated_at timestamp on record changes
*/

-- Create custom types
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for authenticated users to read all posts (for admin/author views)
CREATE POLICY "Authenticated users can read all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for public to read published posts only
CREATE POLICY "Public can read published posts"
  ON posts
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Policy for authenticated users to insert their own posts
CREATE POLICY "Users can create their own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy for users to update their own posts
CREATE POLICY "Users can update their own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy for users to delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);