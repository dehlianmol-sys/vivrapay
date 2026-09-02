import { createClient } from '@supabase/supabase-js';

// Publishable anon key — safe to include in client code.
const url = 'https://dmqiauxksjspxwtvdcdx.supabase.co';
const anonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcWlhdXhrc2pzcHh3dHZkY2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDc5OTAsImV4cCI6MjEwMzg4Mzk5MH0.NEhF7zRlaUMgGbhDY08y2WyMDSttd0G6xcytBA-SG6A';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
