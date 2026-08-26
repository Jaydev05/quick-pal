import { Link } from "@tanstack/react-router";
import logo from "@/assets/jaydev-logo.png.asset.json";
import { COMPANY } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Logo({ className, height = 40 }: { className?: string; height?: number }) {
  return (
    <Link to="/" className={cn("inline-flex items-center", className)} aria-label={COMPANY.name}>
      <img
        src={logo.url}
        alt={`${COMPANY.name} logo`}
        style={{ height }}
        className="w-auto"
        width={900}
        height={452}


      />
    </Link>
  );
}
