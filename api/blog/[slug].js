// api/blog/posts/[slug].js

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
  console.log(`[START] Handler invoked for method: ${req.method} and path: ${req.url}`);
  console.log(`[${req.method}] Processing request for slug: ${req.query.slug}`);
  console.log(`[${req.method}] Full URL: ${req.url}`);
  console.log(`[${req.method}] Headers:`, req.headers);

  const slug = req.query.slug;
  const supabaseUnauthenticated = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

  // --- GET a single post by slug ---
  if (req.method === 'GET') {
    const { data, error } = await supabaseUnauthenticated.from('posts').select('*').eq('slug', slug).single();
    
    if (error) {
        console.error(`[GET ERROR] Supabase query error for slug '${slug}':`, error.message, error.details);
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Post not found (Database returned no rows)' });
        }
        return res.status(500).json({ error: error.message || 'Internal server error during GET' });
    }
    if (!data) {
        console.warn(`[GET WARNING] Post not found: Data is null for slug '${slug}'.`);
        return res.status(404).json({ error: 'Post not found (Data is null)' });
    }
    console.log(`[GET SUCCESS] Successfully fetched post for slug '${slug}'.`);
    return res.status(200).json(data);
  }

  // --- PUT (Update) a single post by slug ---
  if (req.method === 'PUT') {
    const supabase = getSupabaseWithAuth(req);
    if (!supabase) {
        console.error(`[PUT ERROR] Unauthorized: Missing token for PUT request to slug '${slug}'.`);
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error(`[PUT ERROR] Unauthorized: User not found for token for PUT request to slug '${slug}'.`);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    console.log(`[PUT INFO] Authenticated user for PUT to slug '${slug}':`, user.email);

    const postData = req.body;
    console.log(`[PUT INFO] Received post data for update to slug '${slug}':`, postData);

    // Use admin client for updating posts to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('posts').update(postData).eq('slug', slug).select();
    
    if (error) {
        console.error(`[PUT ERROR] Supabase PUT error for slug '${slug}':`, error.message, error.details);
        return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
        console.warn(`[PUT WARNING] Update failed: No data returned or post not found for slug '${slug}'.`);
        return res.status(404).json({ error: 'Post not found or update failed.' });
    }
    console.log(`[PUT SUCCESS] Successfully updated post for slug '${slug}'.`);
    return res.status(200).json(data[0]);
  }

  // --- DELETE a single post by slug ---
  if (req.method === 'DELETE') {
    const supabase = getSupabaseWithAuth(req);
    if (!supabase) {
        console.error(`[DELETE ERROR] Unauthorized: Missing token for DELETE request to slug '${slug}'.`);
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error(`[DELETE ERROR] Unauthorized: User not found for token for DELETE request to slug '${slug}'.`);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    console.log(`[DELETE INFO] Authenticated user for DELETE to slug '${slug}':`, user.email);

    // Use admin client for deleting posts to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('posts').delete().eq('slug', slug);
    
    if (error) {
        console.error(`[DELETE ERROR] Supabase DELETE error for slug '${slug}':`, error.message, error.details);
        return res.status(500).json({ error: error.message });
    }
    console.log(`[DELETE SUCCESS] Successfully deleted post for slug '${slug}'.`);
    return res.status(204).end();
  }

  // --- Handle any other methods not explicitly allowed ---
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
  console.warn(`[HANDLER END] Method '${req.method}' Not Allowed for path: ${req.url}.`);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
