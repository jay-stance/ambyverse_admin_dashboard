import api from './axios';

interface BackendResponse<T> { status: string; data: T; }
function unwrap<T>(r: { data: BackendResponse<T> }): T { return r.data.data; }

export interface PersonaExample { user: string; assistant: string; }

export interface AiPersona {
  id: string;
  key: string;
  display_name: string;
  tagline?: string | null;
  avatar_url?: string | null;
  accent_color?: string | null;
  short_bio?: string | null;
  advocate_profile?: string | null;
  backstory?: string | null;
  mission_values?: string | null;
  cultural_context?: string | null;
  warmth: number; directness: number; humor: number; empathy: number;
  energy: number; formality: number; assertiveness: number;
  trait_openness?: number | null; trait_conscientiousness?: number | null;
  trait_extraversion?: number | null; trait_agreeableness?: number | null; trait_neuroticism?: number | null;
  verbosity: string; emoji_usage: string; humor_style?: string | null; reading_level: string;
  language: string; pronouns?: string | null; preferred_address?: string | null;
  personality_traits: string[]; catchphrases: string[]; conversational_quirks: string[];
  vocabulary_prefs: { use?: string[]; avoid?: string[] };
  expertise_areas: string[]; do_say: string[]; dont_say: string[];
  example_dialogues: PersonaExample[];
  greeting_template?: string | null; signoff_style?: string | null;
  system_prompt?: string | null; model: string; temperature: number; voice_id?: string | null;
  is_founding_partner: boolean; partner_name?: string | null; partner_logo_url?: string | null;
  is_active: boolean; is_default: boolean; sort_order: number;
  created_at: string; updated_at: string;
}

export interface AiOverview {
  total_warriors: number; consented_warriors: number; active_personas: number;
  conversations: number; assistant_messages: number; flagged_messages: number;
  escalations: number; violations: number; open_signals: number;
  tokens_this_month: number;
}

export interface AiUsage {
  month_total: number;
  top_users: { user_id: string; full_name: string | null; total: number; calls: number }[];
}

export interface AiAuditEvent { id: string; user_id: string; full_name?: string; purpose: string; data_scope: any; created_at: string; }
export interface AiFlaggedMessage { id: string; conversation_id: string; full_name?: string; preview: string; created_at: string; }

export const aiAdminApi = {
  listPersonas: async (): Promise<AiPersona[]> => unwrap(await api.get<BackendResponse<AiPersona[]>>('/admin/ai/personas')),
  createPersona: async (data: Partial<AiPersona>): Promise<AiPersona> => unwrap(await api.post<BackendResponse<AiPersona>>('/admin/ai/personas', data)),
  updatePersona: async (id: string, data: Partial<AiPersona>): Promise<AiPersona> => unwrap(await api.put<BackendResponse<AiPersona>>(`/admin/ai/personas/${id}`, data)),
  setActive: async (id: string, active: boolean): Promise<void> => { await api.patch(`/admin/ai/personas/${id}/active`, { active }); },
  setDefault: async (id: string): Promise<void> => { await api.post(`/admin/ai/personas/${id}/default`); },
  overview: async (): Promise<AiOverview> => unwrap(await api.get<BackendResponse<AiOverview>>('/admin/ai/overview')),
  usage: async (): Promise<AiUsage> => unwrap(await api.get<BackendResponse<AiUsage>>('/admin/ai/usage')),
  audit: async (): Promise<{ events: AiAuditEvent[]; flagged: AiFlaggedMessage[] }> =>
    unwrap(await api.get<BackendResponse<{ events: AiAuditEvent[]; flagged: AiFlaggedMessage[] }>>('/admin/ai/audit')),
};
