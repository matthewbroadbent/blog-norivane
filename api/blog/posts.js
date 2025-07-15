import { createClient } from '@supabase/supabase-js';

const getSupabaseWithAuth = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('posts').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const supabase = getSupabaseWithAuth(req);
    if (!supabase) return res.status(401).json({ error: 'Unauthorized: Missing token' });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

    // THE FIX IS HERE: Changed from await req.json() to req.body
    const postData = req.body;
    
    const { data, error } = await supabase.from('posts').insert([postData]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}