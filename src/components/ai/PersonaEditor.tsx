'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { AiPersona } from '@/lib/api/aiAdmin';

const DIALS: { key: keyof AiPersona; label: string; low: string; high: string }[] = [
  { key: 'warmth', label: 'Warmth', low: 'reserved', high: 'very warm' },
  { key: 'directness', label: 'Directness', low: 'gentle', high: 'blunt' },
  { key: 'humor', label: 'Humor', low: 'serious', high: 'playful' },
  { key: 'empathy', label: 'Empathy', low: 'practical', high: 'deeply empathetic' },
  { key: 'energy', label: 'Energy', low: 'calm', high: 'high-energy' },
  { key: 'formality', label: 'Formality', low: 'casual', high: 'formal' },
  { key: 'assertiveness', label: 'Assertiveness', low: 'soft', high: 'assertive' },
];

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring';

type Draft = Partial<AiPersona> & { _use?: string; _avoid?: string };

function lines(arr?: string[]): string { return (arr || []).join('\n'); }
function fromLines(s: string): string[] { return s.split('\n').map((x) => x.trim()).filter(Boolean); }

const EMPTY: Draft = {
  key: '', display_name: '', tagline: '', short_bio: '',
  warmth: 60, directness: 50, humor: 30, empathy: 70, energy: 50, formality: 40, assertiveness: 50,
  verbosity: 'medium', emoji_usage: 'sparing', reading_level: 'plain', language: 'en',
  personality_traits: [], catchphrases: [], conversational_quirks: [], expertise_areas: [],
  do_say: [], dont_say: [], example_dialogues: [], vocabulary_prefs: {},
  model: 'deepseek-chat', temperature: 0.7, is_founding_partner: false, sort_order: 0,
};

export function PersonaEditor({
  open, persona, onClose, onSave,
}: {
  open: boolean;
  persona: AiPersona | null;
  onClose: () => void;
  onSave: (data: Partial<AiPersona>) => Promise<void>;
}) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (persona) {
      setD({ ...persona, _use: (persona.vocabulary_prefs?.use || []).join('\n'), _avoid: (persona.vocabulary_prefs?.avoid || []).join('\n') });
    } else {
      setD({ ...EMPTY });
    }
    setError(null);
  }, [persona, open]);

  const set = (k: keyof Draft, v: any) => setD((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setError(null);
    if (!d.display_name?.trim() || !d.key?.trim()) {
      setError('Display name and key are required.');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<AiPersona> = {
        ...d,
        vocabulary_prefs: { use: fromLines(d._use || ''), avoid: fromLines(d._avoid || '') },
        example_dialogues: (d.example_dialogues || []).filter((e) => e.user?.trim() || e.assistant?.trim()),
      };
      delete (payload as any)._use;
      delete (payload as any)._avoid;
      delete (payload as any).id; delete (payload as any).created_at; delete (payload as any).updated_at;
      delete (payload as any).is_active; delete (payload as any).is_default;
      await onSave(payload);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );

  const ListField = ({ label, k, hint }: { label: string; k: keyof Draft; hint?: string }) => (
    <Field label={label} hint={hint}>
      <Textarea rows={3} value={lines(d[k] as string[])} onChange={(e) => set(k, fromLines(e.target.value))} placeholder="One per line" />
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{persona ? `Edit ${persona.display_name}` : 'New persona'}</DialogTitle>
          <DialogDescription>The advocate answers the friendly intake form; map their answers here.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="identity" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-6 grid grid-cols-4">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="identity" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Display name *"><Input value={d.display_name || ''} onChange={(e) => set('display_name', e.target.value)} placeholder="Nora" /></Field>
                <Field label="Key (slug) *" hint="lowercase, unique"><Input value={d.key || ''} onChange={(e) => set('key', e.target.value)} placeholder="nora-healthxplain" /></Field>
              </div>
              <Field label="Tagline"><Input value={d.tagline || ''} onChange={(e) => set('tagline', e.target.value)} placeholder="in HealthXplain's spirit" /></Field>
              <Field label="Short bio (card)"><Textarea rows={2} value={d.short_bio || ''} onChange={(e) => set('short_bio', e.target.value)} /></Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Addresses warrior as"><Input value={d.preferred_address || ''} onChange={(e) => set('preferred_address', e.target.value)} placeholder="Warrior" /></Field>
                <Field label="Pronouns"><Input value={d.pronouns || ''} onChange={(e) => set('pronouns', e.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Avatar URL"><Input value={d.avatar_url || ''} onChange={(e) => set('avatar_url', e.target.value)} /></Field>
                <Field label="Accent color"><Input value={d.accent_color || ''} onChange={(e) => set('accent_color', e.target.value)} placeholder="#E5407A" /></Field>
              </div>
              <Field label="Advocate profile" hint="who this is modelled on"><Textarea rows={2} value={d.advocate_profile || ''} onChange={(e) => set('advocate_profile', e.target.value)} /></Field>
              <Field label="Backstory / lived experience"><Textarea rows={2} value={d.backstory || ''} onChange={(e) => set('backstory', e.target.value)} /></Field>
              <Field label="Mission / what they care about"><Textarea rows={2} value={d.mission_values || ''} onChange={(e) => set('mission_values', e.target.value)} /></Field>
              <Field label="Cultural context"><Input value={d.cultural_context || ''} onChange={(e) => set('cultural_context', e.target.value)} /></Field>
            </TabsContent>

            <TabsContent value="personality" className="space-y-5 mt-0">
              <p className="text-xs text-muted-foreground">Drag each dial. These compile into the persona&apos;s tone.</p>
              {DIALS.map((dl) => (
                <div key={dl.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{dl.label}</Label>
                    <span className="text-xs tabular-nums text-muted-foreground">{(d[dl.key] as number) ?? 50}</span>
                  </div>
                  <input type="range" min={0} max={100} value={(d[dl.key] as number) ?? 50}
                    onChange={(e) => set(dl.key, Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                  <div className="flex justify-between text-[11px] text-muted-foreground/70"><span>{dl.low}</span><span>{dl.high}</span></div>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <Field label="Verbosity">
                  <select className={selectClass} value={d.verbosity} onChange={(e) => set('verbosity', e.target.value)}>
                    <option value="short">Short</option><option value="medium">Medium</option><option value="long">Long</option>
                  </select>
                </Field>
                <Field label="Emoji usage">
                  <select className={selectClass} value={d.emoji_usage} onChange={(e) => set('emoji_usage', e.target.value)}>
                    <option value="none">None</option><option value="sparing">Sparing</option><option value="frequent">Frequent</option>
                  </select>
                </Field>
                <Field label="Reading level">
                  <select className={selectClass} value={d.reading_level} onChange={(e) => set('reading_level', e.target.value)}>
                    <option value="plain">Plain</option><option value="simple">Simple</option><option value="clinical">Clinical</option>
                  </select>
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4 mt-0">
              <ListField label="Personality traits" k="personality_traits" hint="e.g. caring, steady" />
              <ListField label="Catchphrases" k="catchphrases" hint='e.g. "Hey Warrior 💗"' />
              <ListField label="Conversational quirks" k="conversational_quirks" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Words to use"><Textarea rows={3} value={d._use || ''} onChange={(e) => set('_use', e.target.value)} placeholder="One per line" /></Field>
                <Field label="Words to avoid"><Textarea rows={3} value={d._avoid || ''} onChange={(e) => set('_avoid', e.target.value)} placeholder="One per line" /></Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ListField label="Do say" k="do_say" />
                <ListField label="Don't say" k="dont_say" />
              </div>
              <Field label="Greeting template"><Textarea rows={2} value={d.greeting_template || ''} onChange={(e) => set('greeting_template', e.target.value)} /></Field>
              <Field label="Sign-off style"><Input value={d.signoff_style || ''} onChange={(e) => set('signoff_style', e.target.value)} /></Field>

              {/* Few-shot examples */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Example dialogues (few-shot — the strongest lever)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => set('example_dialogues', [...(d.example_dialogues || []), { user: '', assistant: '' }])}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
                {(d.example_dialogues || []).map((ex, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-muted-foreground">Example {i + 1}</span>
                      <button type="button" onClick={() => set('example_dialogues', (d.example_dialogues || []).filter((_, j) => j !== i))} className="text-destructive hover:opacity-70"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <Input placeholder="Warrior says…" value={ex.user} onChange={(e) => { const a = [...(d.example_dialogues || [])]; a[i] = { ...a[i], user: e.target.value }; set('example_dialogues', a); }} />
                    <Textarea rows={2} placeholder="You reply…" value={ex.assistant} onChange={(e) => { const a = [...(d.example_dialogues || [])]; a[i] = { ...a[i], assistant: e.target.value }; set('example_dialogues', a); }} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-0">
              <ListField label="Expertise areas" k="expertise_areas" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Model"><Input value={d.model || ''} onChange={(e) => set('model', e.target.value)} /></Field>
                <Field label="Temperature"><Input type="number" step="0.1" min="0" max="2" value={d.temperature ?? 0.7} onChange={(e) => set('temperature', Number(e.target.value))} /></Field>
                <Field label="Sort order"><Input type="number" value={d.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} /></Field>
              </div>
              <Field label="System prompt override" hint="Leave empty to auto-compile from the fields above"><Textarea rows={4} value={d.system_prompt || ''} onChange={(e) => set('system_prompt', e.target.value)} /></Field>
              <div className="rounded-lg border p-3 space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={!!d.is_founding_partner} onChange={(e) => set('is_founding_partner', e.target.checked)} className="accent-primary h-4 w-4" />
                  Founding partner
                </label>
                {d.is_founding_partner && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Partner name"><Input value={d.partner_name || ''} onChange={(e) => set('partner_name', e.target.value)} /></Field>
                    <Field label="Partner logo URL"><Input value={d.partner_logo_url || ''} onChange={(e) => set('partner_logo_url', e.target.value)} /></Field>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {error && <p className="px-6 text-sm text-destructive">{error}</p>}
        <DialogFooter className="px-6 pb-6 pt-2 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {persona ? 'Save changes' : 'Create persona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
