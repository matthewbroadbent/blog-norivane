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
  // New block to handle preflight OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const slug = req.query.slug;
  const supabaseUnauthenticated = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

  if (req.method === 'GET') {
    const { data, error } = await supabaseUnauthenticated.from('posts').select('*').eq('slug', slug).single();
    if (error) return res.status(404).json({ error: 'Post not found' });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const supabase = getSupabaseWithAuth(req);
    if (!supabase) return res.status(401).json({ error: 'Unauthorized: Missing token' });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    
    const postData = await req.json();
    const { data, error } = await supabase.from('posts').update(postData).eq('slug', slug).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }
  
  res.setHeader('Allow', ['GET', 'PUT', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}