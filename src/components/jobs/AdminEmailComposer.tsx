import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, Inbox, Loader2, Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { composedEmailSchema, renderComposedEmail, type ReceivedEmail } from "@/lib/admin-email";
import { sendAdminEmail, getReceivedEmails, getReceivedEmail } from "@/lib/admin-email.functions";

export function AdminEmailComposer() {
  const send = useServerFn(sendAdminEmail);
  const qc = useQueryClient();
  const [form, setForm] = useState({ recipient: "", recipientName: "", subject: "", message: "" });
  const [requestId, setRequestId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const change = (name: keyof typeof form, value: string) => { setForm((previous) => ({ ...previous, [name]: value })); setErrors((previous) => ({ ...previous, [name]: "" })); setFailure(""); setRequestId(null); };
  async function submit() {
    if (!requestId || busy) return;
    setBusy(true); setFailure("");
    try {
      const result = await send({ data: { ...form, requestId } });
      await qc.invalidateQueries({ queryKey: ["interview-email-history"] });
      if (result.status === "accepted") {
        toast.success("Email accepted for sending from info@jaydevassociates.com.");
        setForm({ recipient: "", recipientName: "", subject: "", message: "" }); setRequestId(null); setConfirm(false);
      } else {
        setConfirm(false);
        setFailure(result.status === "pending" ? "This email is already being processed. Check email history before sending again." : "The email could not be sent. It has been recorded in email history.");
      }
    } catch { setConfirm(false); setFailure("Sending could not be confirmed. Check email history, then try again without changing the message to avoid duplicates."); }
    finally { setBusy(false); }
  }
  return <section className="min-w-0 space-y-5">
    <div><h2 className="font-display text-xl font-semibold">Compose email</h2><p className="mt-2 text-sm text-muted-foreground">From: Jaydev Associates &lt;info@jaydevassociates.com&gt;</p></div>
    <form className="max-w-3xl space-y-5" onSubmit={(event) => {
      event.preventDefault();
      const id = requestId ?? crypto.randomUUID();
      const result = composedEmailSchema.safeParse({ ...form, requestId: id });
      if (!result.success) { const messages: Record<string, string> = {}; for (const issue of result.error.issues) messages[String(issue.path[0])] = issue.message; setErrors(messages); return; }
      setRequestId(id); setConfirm(true);
    }}>
      <div className="grid gap-5 sm:grid-cols-2">{([{ name: "recipient", label: "Recipient email", type: "email", max: 255 }, { name: "recipientName", label: "Recipient name (optional)", type: "text", max: 120 }] as const).map((field) => <div key={field.name}><Label htmlFor={`email-${field.name}`}>{field.label}</Label><Input id={`email-${field.name}`} type={field.type} maxLength={field.max} value={form[field.name]} disabled={busy} onChange={(event) => change(field.name, event.target.value)} className="mt-2" aria-invalid={Boolean(errors[field.name])} required={field.name === "recipient"} />{errors[field.name] && <p role="alert" className="mt-2 text-sm text-destructive">{errors[field.name]}</p>}</div>)}</div>
      <div><Label htmlFor="email-subject">Subject</Label><Input id="email-subject" maxLength={200} value={form.subject} disabled={busy} onChange={(event) => change("subject", event.target.value)} required className="mt-2" />{errors["subject"] && <p role="alert" className="mt-2 text-sm text-destructive">{errors["subject"]}</p>}</div>
      <div><Label htmlFor="email-message">Message</Label><Textarea id="email-message" rows={10} maxLength={15000} value={form.message} disabled={busy} onChange={(event) => change("message", event.target.value)} required className="mt-2" />{errors["message"] && <p role="alert" className="mt-2 text-sm text-destructive">{errors["message"]}</p>}</div>
      {failure && <p role="alert" className="text-sm text-destructive">{failure}</p>}
      <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={() => setPreview(true)}><Eye />Preview email</Button><Button type="submit" disabled={busy}><Send />Review and send</Button></div>
    </form>
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Email preview</DialogTitle><DialogDescription>{form.recipient ? `To: ${form.recipient}` : "Jaydev Associates"}</DialogDescription></DialogHeader><iframe title="Composed email preview" sandbox="" srcDoc={renderComposedEmail(form)} className="h-[60vh] w-full rounded-md border border-border" /></DialogContent></Dialog>
    <Dialog open={confirm} onOpenChange={(open) => { if (!busy) setConfirm(open); }}><DialogContent><DialogHeader><DialogTitle>Send this email?</DialogTitle><DialogDescription className="break-all">To: {form.recipient}</DialogDescription></DialogHeader><p className="break-words font-semibold">{form.subject}</p><p className="text-sm text-muted-foreground">From info@jaydevassociates.com</p><div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>Cancel</Button><Button disabled={busy} onClick={() => void submit()}>{busy ? <Loader2 className="animate-spin" /> : <Send />}Send email</Button></div></DialogContent></Dialog>
  </section>;
}

export function AdminEmailInbox() {
  const load = useServerFn(getReceivedEmails);
  const read = useServerFn(getReceivedEmail);
  const query = useQuery({ queryKey: ["received-emails"], queryFn: () => load(), retry: false });
  const [selected, setSelected] = useState<{ email: ReceivedEmail; html: string | null; text: string } | null>(null);
  const [reading, setReading] = useState(false);
  return <section className="min-w-0 space-y-5"><div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Inbox className="size-5 text-primary" />Received emails</h2><Button variant="outline" size="icon" aria-label="Refresh received emails" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw /></Button></div>
    {query.isPending && <p className="text-muted-foreground">Loading received emails…</p>}
    {query.isError && <p role="alert" className="text-destructive">Received emails could not be loaded.</p>}
    {query.data && !query.data.available && <div className="border-l-2 border-gold py-3 pl-4"><h3 className="font-semibold">Receiving not connected</h3><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{query.data.message}</p></div>}
    {query.data?.available && !query.data.emails.length && <p className="text-muted-foreground">No received emails in Resend.</p>}
    <div className="divide-y divide-border">{query.data?.emails.map((email) => <article key={email.id} className="flex min-w-0 flex-wrap justify-between gap-4 py-5"><div className="min-w-0 flex-1"><h3 className="break-words font-semibold">{email.subject}</h3><p className="mt-2 break-all text-sm text-muted-foreground">From: {email.from}</p><p className="mt-1 break-all text-sm text-muted-foreground">To: {email.to.join(", ")}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(email.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p></div><Button variant="outline" disabled={reading} onClick={async () => { setReading(true); try { const body = await read({ data: { id: email.id } }); setSelected({ email, ...body }); } catch { toast.error("This received email could not be opened."); } finally { setReading(false); } }}><Eye />View email</Button></article>)}</div>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{selected?.email.subject}</DialogTitle><DialogDescription className="break-all">From: {selected?.email.from}</DialogDescription></DialogHeader>{selected?.html ? <iframe title="Received email message" sandbox="" referrerPolicy="no-referrer" srcDoc={selected.html.replace(/<head[^>]*>/i, '<head><meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src data:;">')} className="h-[60vh] w-full rounded-md border border-border" /> : <p className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words text-sm">{selected?.text}</p>}</DialogContent></Dialog>
  </section>;
}