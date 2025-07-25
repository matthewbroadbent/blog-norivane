// api/blog/posts.js

import { createClient } from '@supabase/supabase-js';

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

// Admin client for server operations
const getSupabaseAdmin = () => {
  return createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  );
};

export default async function handler(req, res) {
  const supabaseUnauthenticated = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

  // --- GET all posts ---
  if (req.method === 'GET') {
      const { data, error } = await supabaseUnauthenticated.from('posts').select('*');
      if (error) {
          console.error('[GET /api/blog/posts] Error fetching all posts:', error.message);
          return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data);
  }

  // --- POST (Create) a new post ---
  if (req.method === 'POST') {
    const supabase = getSupabaseWithAuth(req);
    if (!supabase) {
        console.error('[POST /api/blog/posts] Unauthorized: Missing token.');
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('[POST /api/blog/posts] Unauthorized: Invalid token.');
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const postData = req.body;

    // Use admin client for creating posts to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('posts').insert({
      ...postData,
      author_id: user.id
    }).select();
    
    if (error) {
        console.error('[POST /api/blog/posts] Error creating post:', error.message);
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data[0]);
  }

  // --- Handle any other methods not explicitly allowed ---
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  console.warn(`[HANDLER END] Method '${req.method}' Not Allowed for path: ${req.url}.`);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
