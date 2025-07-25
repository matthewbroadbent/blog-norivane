// api/auth/login.js

import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGIN = 'https://www.norivane.co.uk';

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Methods handled by this specific file
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Authorization not strictly needed for preflight for basic login
  res.setHeader('Access-Control-Max-Age', '86400');
};

export default async function handler(req, res) {
  // --- ALWAYS CALL CORS HEADERS AT THE VERY TOP ---
  setCorsHeaders(res);

  // --- Handle preflight OPTIONS request ---
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

  if (req.method === 'POST') {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('[POST /api/auth/login] Login error:', error.message);
      return res.status(401).json({ error: error.message });
    }
    console.log('[POST /api/auth/login] User signed in successfully.');
    return res.status(200).json(data);
  }

  // --- Handle any other methods not explicitly allowed ---
  res.setHeader('Allow', ['POST', 'OPTIONS']);
  console.warn(`[HANDLER END] Method '${req.method}' Not Allowed for path: ${req.url}.`);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
