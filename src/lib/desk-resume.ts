import { candidateSchema, type DeskCandidateInput } from "./desk";
import { validateResumeFile } from "./resume-profile";

export function profileFromText(raw: string): DeskCandidateInput {
  const text = raw.replace(/\u0000/g, "").slice(0,60000);
  const lines = text.split(/\n/).map(s=>s.trim()).filter(Boolean);
  const email=text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]??"";
  const phone=text.match(/(?:\+91[\s-]?)?[6-9](?:[\s-]?\d){9}\b/)?.[0]??"";
  const name=lines.slice(0,5).find(s=>/^[A-Za-z][A-Za-z .'-]{3,79}$/.test(s) && !/resume|curriculum|vitae|profile|contact|engineer|developer|summary/i.test(s))??"";
  const lineFor=(pattern:RegExp)=>lines.filter(s=>pattern.test(s)).slice(0,8).join("\n");
  const branches=["Chemical","Computer","Mechanical","Civil","Electrical","Electronics","Industrial","Fire","Safety"].filter(branch=>new RegExp(`\\b${branch}\\b`,"i").test(text));
  const experience=text.match(/(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:work\s+|professional\s+|total\s+)?experience/i)?.[1];
  const section=(label:string)=>{
    const match=text.match(new RegExp(`(?:^|\\n)${label}\\s*:?\\s*\\n([\\s\\S]{0,3000}?)(?=\\n(?:EDUCATION|EXPERIENCE|WORK EXPERIENCE|PROJECTS|CERTIFICATIONS|SKILLS|PERSONAL DETAILS)\\s*:?\\s*(?:\\n|$)|$)`,"i"));
    return match?.[1]?.trim()??"";
  };
  return candidateSchema.parse({full_name:name,phone,email,education:lineFor(/b\.?tech|b\.?e\.?\b|bachelor|master|diploma|graduat|engineering|b\.?sc|m\.?sc|m\.?tech/i).slice(0,2000),specialization:branches.map(b=>`${b} Engineering`).join(", "),college:lineFor(/university|college|institute/i).slice(0,300),skills:(section("(?:TECHNICAL )?SKILLS")||lineFor(/skills\s*:/i)).slice(0,3000),experience_years:experience?Math.min(60,Number(experience)):null,designation:lineFor(/(?:designation|current role|job title)\s*:/i).slice(0,300),company:lineFor(/(?:company|employer)\s*:/i).slice(0,300),location:lineFor(/(?:current location|address|location)\s*:/i).slice(0,300),preferred_location:lineFor(/preferred (?:job )?location\s*:/i).slice(0,300),summary:section("(?:PROFESSIONAL )?SUMMARY").slice(0,5000),keywords:branches.join(", "),extracted_text:text,processing_status:"Needs review"});
}
export async function resumeHash(file:File) {
  const hash=await crypto.subtle.digest("SHA-256",await file.arrayBuffer());
  return Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,"0")).join("");
}
export async function readDeskResume(file:File, status:(s:string)=>void):Promise<DeskCandidateInput> {
  const extension=validateResumeFile(file);
  if(extension==="doc") return candidateSchema.parse({processing_status:"Manual entry"});
  let text="";
  if(extension==="docx") {
    const mammoth=await import("mammoth/mammoth.browser.js");
    text=(await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;
  } else {
    const pdfjs=await import("pdfjs-dist");
    const {default:workerUrl}=await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
    const doc=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;
    try {
      for(let pageNumber=1;pageNumber<=Math.min(doc.numPages,30);pageNumber++) {
        status(`Reading page ${pageNumber} of ${doc.numPages}…`);
        const page=await doc.getPage(pageNumber);
        const content=await page.getTextContent();
        let pageText=content.items.map(item=>"str" in item?item.str+(item.hasEOL?"\n":" "):"").join("");
        if(pageText.trim().length<30) {
          status(`Reading scanned page ${pageNumber}…`);
          const viewport=page.getViewport({scale:1.5});
          const canvas=document.createElement("canvas"); canvas.width=viewport.width; canvas.height=viewport.height;
          await page.render({canvas,viewport}).promise;
          const {createWorker}=await import("tesseract.js");
          const worker=await createWorker("eng");
          try {pageText=(await worker.recognize(canvas)).data.text;} finally {await worker.terminate();}
        }
        text+=pageText+"\n"; if(text.length>60000) break;
      }
    } finally {await doc.destroy();}
  }
  return profileFromText(text);
}