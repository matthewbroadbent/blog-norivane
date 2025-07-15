// api/blog/posts.js

import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGIN = 'https://www.norivane.co.uk';

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Only methods this file handles
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
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
          return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data);
  }

  // --- POST (Create) a new post ---
  if (req.method === 'POST') {
    const supabase = getSupabaseWithAuth(req);
    if (!supabase) return res.status(401).json({ error: 'Unauthorized: Missing token' });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

    const postData = req.body;

    const { data, error } = await supabase.from('posts').insert(postData).select();
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data[0]);
  }

  // --- Handle any other methods not explicitly allowed ---
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}