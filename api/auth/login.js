// api/auth/login.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client directly in the API route using environment variables.
// This is the secure, standard way to do it on Vercel.
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Ensure we are only handling POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Call Supabase to sign the user in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({ session: data.session });
  } catch (err) {
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}