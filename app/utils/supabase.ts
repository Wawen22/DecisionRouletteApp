import { createClient } from '@supabase/supabase-js';

// Queste variabili d'ambiente dovranno essere configurate nel file .env
const supabaseUrl = 'https://iwfdkbfibttzsdldmtnh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZmRrYmZpYnR0enNkbGRtdG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODg3MTcsImV4cCI6MjA1OTk2NDcxN30.FXYYIeqWoiFCrcu4y2iPVnIgj9ISd9WVWln77hfkEps';

// Crea un client Supabase con opzioni di debug
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'decision-roulette'
    }
  },
  // Abilita il debug in sviluppo
  ...(process.env.NODE_ENV === 'development' && {
    debug: true
  })
});

// Tipi per le tabelle del database
export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
};

export type Wheel = {
  id: string;
  title: string;
  owner_id: string;
  group_id?: string;
  created_at: string;
};

export type WheelOption = {
  id: string;
  wheel_id: string;
  text: string;
  color?: string;
  penalty?: string;
  bonus?: string;
};

export type Spin = {
  id: string;
  wheel_id: string;
  user_id: string;
  result_option_id: string;
  spun_at: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
};
