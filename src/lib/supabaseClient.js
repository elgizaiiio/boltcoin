import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axeaidkkxgpgrmnmkfzn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZWFpZGtreGdwZ3Jtbm1rZnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTU4NjIsImV4cCI6MjA2MzM5MTg2Mn0.38zcnA6NMawBYyoWal_3Ai8R30g_nniAaNKiAYGJAJk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);