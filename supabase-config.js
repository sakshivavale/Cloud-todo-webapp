// supabase-config.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://ulwgsooafdkrzeilnmkf.supabase.co";
const supabaseAnonKey = "sb_publishable_3IoJM59rxw4r-A9egqJkww__8Sg-AuT"; // Paste full copied key here

export const supabase = createClient(supabaseUrl, supabaseAnonKey);