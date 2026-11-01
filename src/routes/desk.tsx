import {createFileRoute, redirect} from "@tanstack/react-router";
import {deskAccess} from "@/lib/desk.functions";
import {DeskWorkspace} from "@/components/desk/DeskWorkspace";

export const Route=createFileRoute("/desk")({
  ssr:false,
  staticData:{sitemap:"exclude-subtree"},
  beforeLoad:async ()=>{
    try {await deskAccess();}
    catch {throw redirect({to:"/auth",search:{redirect:"/desk"}});}
  },
  head:()=>({meta:[
    {title:"Daily Desk | Jaydev Associates"},
    {name:"description",content:"Private super-admin daily operations, candidate calls and resume management."},
    {property:"og:title",content:"Daily Desk | Jaydev Associates"},
    {property:"og:description",content:"Jaydev Associates private daily operations workspace."},
    {property:"og:type",content:"website"},{name:"twitter:card",content:"summary"},{name:"robots",content:"noindex, nofollow"},
  ]}),
  component:DeskWorkspace,
});