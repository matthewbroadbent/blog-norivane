// api/blog/posts/[slug].js

import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGIN = 'https://www.norivane.co.uk'; 

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
};

const getSupabaseWithAuth = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
};

export default async function handler(req, res) {
  // --- ALWAYS CALL CORS HEADERS AT THE VERY TOP ---
  setCorsHeaders(res);

  // --- Handle preflight OPTIONS request ---
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const slug = req.query.slug;
  const supabaseUnauthenticated = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

  // --- GET a single post by slug ---
  if (req.method === 'GET') {
    const { data, error } = await supabaseUnauthenticated.from('posts').select('*').eq('slug', slug).single();
    
    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Post not found (Database returned no rows)' });
        }
        return res.status(500).json({ error: error.message || 'Internal server error during GET' });
    }
    if (!data) {
        return res.status(404).json({ error: 'Post not found (Data is null)' });
    }
    return res.status(200).json(data);
  }

  // --- PUT (Update) a single post by slug ---
  if (req.method === 'PUT') {
    const supabase = getSupabaseWithAuth(req);
    if (!supabase) return res.status(401).json({ error: 'Unauthorized: Missing token' });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const postData = req.body;

    const { data, error } = await supabase.from('posts').update(postData).eq('slug', slug).select();
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Post not found or update failed.' });
    }
    return res.status(200).json(data[0]);
  }

  // --- DELETE a single post by slug ---
  if (req.method === 'DELETE') {
    const supabase = getSupabaseWithAuth(req);
    if (!supabase) return res.status(401).json({ error: 'Unauthorized: Missing token' });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { error } = await supabase.from('posts').delete().eq('slug', slug);
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(204).end();
  }

  // --- Handle any other methods not explicitly allowed ---
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}