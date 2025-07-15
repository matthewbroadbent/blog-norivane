// api/blog/posts.js

import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGIN = 'https://www.norivane.co.uk';

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Methods handled by this specific file
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
    // Consider adding slugification here if the frontend doesn't guarantee it for new posts
    // For example: postData.slug = slugify(postData.title); if you have a slugify utility here

    const { data, error } = await supabase.from('posts').insert(postData).select();
    if (error) {
        console.error('[POST /api/blog/posts] Error creating post:', error.message);
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data[0]); // 201 Created
  }

  // --- Handle any other methods not explicitly allowed ---
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  console.warn(`[HANDLER END] Method '${req.method}' Not Allowed for path: ${req.url}.`);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}