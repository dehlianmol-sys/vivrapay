import { createClient } from '@supabase/supabase-js';

// Publishable anon key — safe to include in client code.
const url = 'https://ccnznmdiuqcozdqqhjrh.supabase.co';
const anonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbnpubWRpdXFjb3pkcXFoanJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MzYxMDUsImV4cCI6MjA5OTQxMjEwNX0.un8HLAnHFfFqNmwanmnrBSMnZmxoA_IyaPoyQ1O6GZU';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
