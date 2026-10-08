import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getInterviewEmailHistory } from "@/lib/interview-email-history.functions";
import { deliveryLabel, type EmailHistoryEntry } from "@/lib/interview-email-history";

export function InterviewEmailHistory() {
  const fetchHistory = useServerFn(getInterviewEmailHistory);
  const [selected, setSelected] = useState<EmailHistoryEntry | null>(null);
  const query = useQuery({ queryKey: ["interview-email-history"], queryFn: () => fetchHistory() });
  return <section className="min-w-0 space-y-5">
    <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Mail className="size-5 text-primary" />Interview emails</h2><Button variant="outline" size="icon" aria-label="Refresh email history" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw className="size-4" /></Button></div>
    {query.isPending && <p className="text-muted-foreground">Loading emails…</p>}
    {query.isError && <p role="alert" className="text-destructive">Email history could not be loaded.</p>}
    {query.data?.length === 0 && <p className="text-muted-foreground">No interview emails recorded.</p>}
    <div className="divide-y divide-border">{query.data?.map((email) => <article key={email.id} className="flex min-w-0 flex-wrap items-start justify-between gap-4 py-5">
      <div className="min-w-0 flex-1 space-y-2"><h3 className="break-words font-semibold">{email.subject}</h3><p className="break-all text-sm text-muted-foreground">To: {email.recipient}</p><p className="text-xs text-muted-foreground">{email.sentAt ? new Date(email.sentAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" : "Original send time unavailable"}</p><p className="text-sm text-primary">{deliveryLabel(email.status)}</p></div>
      <Button variant="outline" disabled={!email.html} onClick={() => setSelected(email)}><Eye className="mr-2 size-4" />View email</Button>
    </article>)}</div>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{selected?.subject}</DialogTitle><DialogDescription>To: {selected?.recipient} · {selected ? deliveryLabel(selected.status) : ""}</DialogDescription></DialogHeader>{selected?.html && <iframe title="Email message" sandbox="" srcDoc={selected.html} className="h-[65vh] w-full rounded-md border border-border bg-card" />}</DialogContent></Dialog>
  </section>;
}