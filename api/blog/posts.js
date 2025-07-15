// api/blog/posts.js

import { createClient } from '@supabase/supabase-js';

// Removed: ALLOWED_ORIGIN constant
// Removed: setCorsHeaders function

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
  // Removed: setCorsHeaders(res);
  // Removed: if (req.method === 'OPTIONS') { return res.status(200).end(); }

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

    const { data, error } = await supabase.from('posts').insert(postData).select();
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