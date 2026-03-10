const SUPABASE_URL = 'https://aepchzmkisygjfniislx.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcGNoem1raXN5Z2pmbmlpc2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA2MDg0OCwiZXhwIjoyMDg4NjM2ODQ4fQ.btpNBDmW3QOaZKwULuOQF-unpV2JguDcsHymSAmUD2A';

export interface InteractionAnalysis {
  id: number;
  interaction_id: number;
  main_topic: string | null;
  subtopic: string | null;
  emotion: string | null;
  urgency: string | null;
  barrier_type: string | null;
  need_type: string | null;
  proposal_present: boolean | null;
  needs_review: boolean | null;
  short_summary: string | null;
  created_at: string;
  needs_human_support_reason: string | null;
}

export async function fetchInteractionAnalysis(): Promise<InteractionAnalysis[]> {
  const res = await fetch(`${SUPABASE_URL}/interaction_analysis?select=*&order=created_at.asc`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return res.json();
}
