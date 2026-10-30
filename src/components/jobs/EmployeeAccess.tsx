import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UserPlus, KeyRound, ShieldOff, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createEmployee, listEmployees, manageEmployee, changeEmployeePassword } from "@/lib/staff-access.functions";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { passwordChangeSchema } from "@/lib/staff-access";

export function EmployeeAccess() {
  const load = useServerFn(listEmployees);
  const create = useServerFn(createEmployee);
  const manage = useServerFn(manageEmployee);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data: employees, error, isLoading } = useQuery({ queryKey: ["employees"], queryFn: () => load() });
  async function action(userId: string, action: "reset" | "activate" | "deactivate") {
    if (!window.confirm(action === "reset" ? "Reset this employee’s password and email new temporary credentials?" : `${action === "activate" ? "Activate" : "Deactivate"} this employee’s access?`)) return;
    setBusy(true);
    try {
      const result = await manage({ data: { userId, action } });
      if (action === "reset" && !result.emailAccepted) toast.warning("Password reset, but the email could not be sent. Reset again to send new credentials.");
      else toast.success(action === "reset" ? "New credentials accepted for sending" : "Employee access updated");
      await qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update access."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl font-semibold">Employee access</h2><Button onClick={() => setOpen(true)}><UserPlus />Create Employee Access</Button></div>
    {isLoading && <p className="text-muted-foreground">Loading employees…</p>}
    {error && <p role="alert" className="text-destructive">Could not load employee accounts.</p>}
    {!isLoading && !error && !employees?.length && <p className="text-muted-foreground">No employee accounts yet.</p>}
    <div className="grid gap-4 xl:grid-cols-2">{employees?.map((employee) => <article key={employee.user_id} className="min-w-0 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold text-card-foreground">{employee.full_name}</h3><span className={employee.active ? "text-gold" : "text-muted-foreground"}>{employee.active ? employee.must_change_password ? "Password change required" : "Active" : "Deactivated"}</span></div>
      <p className="mt-1 text-sm text-muted-foreground">{employee.designation}</p>
      <dl className="mt-4 space-y-2 break-words text-sm"><div><dt className="text-muted-foreground">Email</dt><dd>{employee.email}</dd></div><div><dt className="text-muted-foreground">Contact</dt><dd>{employee.phone}</dd></div><div><dt className="text-muted-foreground">Joining date</dt><dd>{employee.joining_date}</dd></div><div><dt className="text-muted-foreground">Account created</dt><dd>{formatDateTime(employee.created_at)}</dd></div>{employee.notes && <div><dt className="text-muted-foreground">Notes</dt><dd>{employee.notes}</dd></div>}</dl>
      <div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={() => void action(employee.user_id, "reset")}><KeyRound />Reset password</Button><Button variant={employee.active ? "destructive" : "outline"} disabled={busy} onClick={() => void action(employee.user_id, employee.active ? "deactivate" : "activate")}>{employee.active ? <ShieldOff /> : <ShieldCheck />}{employee.active ? "Deactivate" : "Activate"}</Button></div>
    </article>)}</div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Create Employee Access</DialogTitle><DialogDescription>Platform Administrator</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault(); const fd = new FormData(event.currentTarget); setBusy(true);
        try {
          const result = await create({ data: { fullName: String(fd.get("fullName")), designation: String(fd.get("designation")), phone: String(fd.get("phone")), email: String(fd.get("email")), joiningDate: String(fd.get("joiningDate")), notes: String(fd.get("notes") ?? "") } });
          if (result.emailAccepted) toast.success("Employee created. Temporary credentials accepted for sending.");
          else toast.warning("Employee created, but the email could not be sent. Use Reset password to send new credentials.");
          setOpen(false); await qc.invalidateQueries({ queryKey: ["employees"] });
        } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create employee."); }
        finally { setBusy(false); }
      }}>
        {[{ name: "fullName", label: "Full name", type: "text" }, { name: "designation", label: "Post / designation", type: "text" }, { name: "phone", label: "Contact number", type: "tel" }, { name: "email", label: "Email address", type: "email" }, { name: "joiningDate", label: "Joining date", type: "date" }].map((field) => <div key={field.name}><Label htmlFor={field.name}>{field.label}</Label><Input className="mt-2" id={field.name} name={field.name} type={field.type} required /></div>)}
        <div><Label htmlFor="notes">Notes</Label><Textarea className="mt-2" id="notes" name="notes" maxLength={2000} /></div><Button type="submit" disabled={busy} className="w-full">{busy && <Loader2 className="animate-spin" />}Create and email credentials</Button>
      </form></DialogContent></Dialog>
  </div>;
}

export function EmployeePasswordChange({ onDone }: { onDone: () => void }) {
  const change = useServerFn(changeEmployeePassword);
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [failure, setFailure] = useState("");
  return <div className="surface-dark flex min-h-screen items-center justify-center bg-background p-5"><form className="w-full max-w-md space-y-5 rounded-lg border border-border bg-card p-6" onSubmit={async (event) => {
    event.preventDefault(); const fd = new FormData(event.currentTarget);
    setFailure("");
    const parsed = passwordChangeSchema.safeParse({ currentPassword: String(fd.get("current")), password: String(fd.get("password")) });
    const nextErrors: Record<string, string[]> = {};
    if (!parsed.success) for (const issue of parsed.error.issues) {
      const field = issue.path[0] === "currentPassword" ? "current" : "password";
      nextErrors[field] = [...(nextErrors[field] ?? []), issue.message];
    }
    if (fd.get("password") !== fd.get("confirm")) nextErrors.confirm = ["The new passwords do not match."];
    setErrors(nextErrors);
    if (!parsed.success || Object.keys(nextErrors).length) return;
    setBusy(true);
    try { await change({ data: parsed.data }); toast.success("Your password has been updated."); onDone(); }
    catch (error) {
      const message = error instanceof Error ? error.message : "";
      setFailure(message && !message.trim().startsWith("[") && !message.trim().startsWith("{") ? message : "Could not update your password. Check the requirements and try again.");
    }
    finally { setBusy(false); }
  }}><p className="eyebrow">Employee access</p><h1 className="font-display text-2xl font-bold">Set your new password</h1>
    {[{ name: "current", label: "Temporary / current password" }, { name: "password", label: "New password" }, { name: "confirm", label: "Confirm new password" }].map((field) => <div key={field.name}><Label htmlFor={field.name}>{field.label}</Label><Input id={field.name} name={field.name} type="password" autoComplete={field.name === "current" ? "current-password" : "new-password"} className="mt-2" maxLength={72} aria-invalid={Boolean(errors[field.name]?.length)} aria-describedby={errors[field.name]?.length ? `${field.name}-error` : field.name === "password" ? "password-requirements" : undefined} onChange={() => { setErrors((previous) => ({ ...previous, [field.name]: [] })); setFailure(""); }} required />{field.name === "password" && <p id="password-requirements" className="mt-2 text-xs text-muted-foreground">12–72 characters, including uppercase and lowercase letters and a number.</p>}{Boolean(errors[field.name]?.length) && <ul id={`${field.name}-error`} role="alert" className="mt-2 space-y-1 text-sm text-destructive">{errors[field.name]?.map((message) => <li key={message}>{message}</li>)}</ul>}</div>)}
    {failure && <p role="alert" className="text-sm text-destructive">{failure}</p>}
    <Button type="submit" disabled={busy} className="w-full">{busy && <Loader2 className="animate-spin" />}Update password</Button><Button type="button" variant="ghost" onClick={() => void signOut()} className="w-full">Sign out</Button>
  </form></div>;
}