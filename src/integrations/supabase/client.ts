// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://upjngryedsymnazqlqta.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwam5ncnllZHN5bW5henFscXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MzQ2MTAsImV4cCI6MjA1NjMxMDYxMH0.mTgH5ruGhCDb57eyyMDfmGubGEN6nF_glSFKW9cDqMM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);