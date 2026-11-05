import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { readDeskResume } from "@/lib/desk-resume";

export type CrmDocument = { file: File; text: string };
export function decodeCrmDocument(value: { base64: string; name: string; text: string }): CrmDocument {
  const bytes = Uint8Array.from(atob(value.base64), c => c.charCodeAt(0));
  const type = value.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
  return { file: new File([bytes], value.name, { type }), text: value.text };
}
export function CrmDocumentPreview({ document, loading, error, onClose }: { document: CrmDocument | null; loading: boolean; error: string; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  useEffect(() => {
    if (!document) { setUrl(""); setText(""); return; }
    const next = URL.createObjectURL(document.file);
    let active = true;
    setUrl(next); setText(document.text);
    if (document.file.name.toLowerCase().endsWith(".docx")) {
      void readDeskResume(document.file, () => {}).then(result => { if (active) setText(result.extracted_text); }).catch(() => {});
    }
    return () => { active = false; URL.revokeObjectURL(next); };
  }, [document]);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="max-h-[94dvh] max-w-5xl overflow-y-auto"><DialogHeader><DialogTitle className="break-all pr-6">{document?.file.name || "Document preview"}</DialogTitle><DialogDescription>Private candidate document</DialogDescription></DialogHeader>
    {loading ? <div role="status" className="flex h-56 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" />Loading document…</div> : error ? <p role="alert" className="text-destructive">{error}</p> : document && url && <>
      <div className="flex justify-end"><Button asChild variant="outline" size="sm"><a href={url} download={document.file.name}><Download />Download</a></Button></div>
      {document.file.name.toLowerCase().endsWith(".pdf") ? <iframe title="Candidate document preview" src={url} className="h-[65dvh] w-full rounded-md border border-border bg-secondary" /> : <pre className="max-h-[65dvh] overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-border p-4 font-sans text-sm">{text || "Preview is unavailable for this file format. Download the original document."}</pre>}
    </>}
  </DialogContent></Dialog>;
}