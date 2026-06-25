'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Sparkles, Plus, MoreVertical, Star, Pencil, Power, ShieldAlert, Users2, MessagesSquare,
  Flag, Siren, RefreshCw, BellRing,
} from 'lucide-react';
import { aiAdminApi, AiPersona, AiOverview, AiAuditEvent, AiFlaggedMessage } from '@/lib/api/aiAdmin';
import { PersonaEditor } from '@/components/ai/PersonaEditor';

function fmtDate(s: string) {
  return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Persona card ────────────────────────────────────────────────────────────────
function PersonaCard({ p, onEdit, onToggle, onDefault }: {
  p: AiPersona; onEdit: () => void; onToggle: () => void; onDefault: () => void;
}) {
  const accent = p.accent_color || '#6366f1';
  return (
    <Card className={`relative overflow-hidden ${p.is_active ? '' : 'opacity-60'}`}>
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ background: accent }}>
            {p.display_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{p.display_name}</h3>
              {p.is_default && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1"><Star className="h-3 w-3" />Default</Badge>}
              {!p.is_active && <Badge variant="secondary">Inactive</Badge>}
              {p.is_founding_partner && <Badge variant="outline" className="text-xs">Founding Partner</Badge>}
            </div>
            {p.tagline && <p className="text-xs text-muted-foreground truncate">{p.tagline}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
              {!p.is_default && <DropdownMenuItem onClick={onDefault}><Star className="h-4 w-4 mr-2" />Set as default</DropdownMenuItem>}
              <DropdownMenuItem onClick={onToggle}><Power className="h-4 w-4 mr-2" />{p.is_active ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {p.short_bio && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.short_bio}</p>}

        <div className="mt-4 space-y-1.5">
          {[['Warmth', p.warmth], ['Directness', p.directness], ['Humor', p.humor]].map(([label, val]) => (
            <div key={label as string} className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-muted-foreground">{label}</span>
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${val}%`, background: accent }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Stat tile ───────────────────────────────────────────────────────────────────
function Stat({ icon: Icon, label, value, sub, tone = 'default' }: {
  icon: any; label: string; value: React.ReactNode; sub?: string; tone?: 'default' | 'warn' | 'danger';
}) {
  const tones = { default: 'text-primary bg-primary/10', warn: 'text-amber-600 bg-amber-100', danger: 'text-red-600 bg-red-100' };
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
          <div>
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        </div>
        {sub && <p className="text-[11px] text-muted-foreground/70 mt-2">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AiCompanionPage() {
  const [personas, setPersonas] = useState<AiPersona[]>([]);
  const [overview, setOverview] = useState<AiOverview | null>(null);
  const [audit, setAudit] = useState<{ events: AiAuditEvent[]; flagged: AiFlaggedMessage[] }>({ events: [], flagged: [] });
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AiPersona | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, o, a] = await Promise.all([aiAdminApi.listPersonas(), aiAdminApi.overview(), aiAdminApi.audit()]);
      setPersonas(p); setOverview(o); setAudit(a);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Partial<AiPersona>) => {
    if (editing) await aiAdminApi.updatePersona(editing.id, data);
    else await aiAdminApi.createPersona(data);
    await load();
  };
  const toggle = async (p: AiPersona) => { await aiAdminApi.setActive(p.id, !p.is_active); await load(); };
  const makeDefault = async (p: AiPersona) => { await aiAdminApi.setDefault(p.id); await load(); };

  const consentPct = overview && overview.total_warriors > 0
    ? Math.round((overview.consented_warriors / overview.total_warriors) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center"><Sparkles className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">AI Companion</h1>
            <p className="text-sm text-muted-foreground">Manage companion voices, adoption, and safety.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button size="sm" onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="h-4 w-4 mr-2" />New persona</Button>
        </div>
      </div>

      <Tabs defaultValue="personas">
        <TabsList>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="adoption">Adoption</TabsTrigger>
          <TabsTrigger value="safety">Safety &amp; Audit</TabsTrigger>
        </TabsList>

        {/* Personas */}
        <TabsContent value="personas" className="mt-5">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : personas.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
              No personas yet. Create one from an advocate&apos;s intake form.
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {personas.map((p) => (
                <PersonaCard key={p.id} p={p}
                  onEdit={() => { setEditing(p); setEditorOpen(true); }}
                  onToggle={() => toggle(p)} onDefault={() => makeDefault(p)} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Adoption */}
        <TabsContent value="adoption" className="mt-5">
          {loading || !overview ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Users2} label="Warriors opted in" value={`${overview.consented_warriors}/${overview.total_warriors}`} sub={`${consentPct}% consent rate`} />
              <Stat icon={Sparkles} label="Active personas" value={overview.active_personas} />
              <Stat icon={MessagesSquare} label="Conversations" value={overview.conversations} sub={`${overview.assistant_messages} AI replies`} />
              <Stat icon={BellRing} label="Open signals" value={overview.open_signals} />
            </div>
          )}
        </TabsContent>

        {/* Safety & Audit */}
        <TabsContent value="safety" className="mt-5 space-y-5">
          {loading ? <Skeleton className="h-40 rounded-xl" /> : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat icon={Siren} label="Crisis escalations" value={overview?.escalations ?? 0} tone="warn" />
                <Stat icon={ShieldAlert} label="Guardrail violations" value={overview?.violations ?? 0} tone="danger" />
                <Stat icon={Flag} label="Flagged messages" value={overview?.flagged_messages ?? 0} tone="danger" />
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Recent safety events</CardTitle></CardHeader>
                <CardContent>
                  {audit.events.length === 0 ? <p className="text-sm text-muted-foreground py-4">No safety events recorded.</p> : (
                    <div className="divide-y">
                      {audit.events.map((e) => (
                        <div key={e.id} className="py-3 flex items-center gap-3">
                          <Badge variant={e.purpose === 'guardrail_violation' ? 'destructive' : 'secondary'} className="shrink-0">
                            {e.purpose === 'guardrail_escalation' ? 'Escalation' : 'Violation'}
                          </Badge>
                          <span className="text-sm flex-1 truncate">{e.full_name || `User ${e.user_id}`}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{fmtDate(e.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Flagged messages</CardTitle></CardHeader>
                <CardContent>
                  {audit.flagged.length === 0 ? <p className="text-sm text-muted-foreground py-4">No flagged messages.</p> : (
                    <div className="divide-y">
                      {audit.flagged.map((m) => (
                        <div key={m.id} className="py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium truncate">{m.full_name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{fmtDate(m.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.preview}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <PersonaEditor open={editorOpen} persona={editing} onClose={() => setEditorOpen(false)} onSave={save} />
    </div>
  );
}
