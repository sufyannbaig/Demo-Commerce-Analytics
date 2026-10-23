import { CircleX, FlaskConical, GalleryHorizontalEnd, Image as ImageIcon, Play, Trophy } from "lucide-react";
import type { AngleId, Creative } from "@/data/seed";
import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/metrics";
import { cn } from "@/lib/utils";

// Muted placeholder backgrounds per angle (stand-ins for real ad thumbnails)
const THUMB: Record<AngleId, string> = {
  "ugc-pain": "from-rose-200 to-orange-100",
  "before-after": "from-sky-200 to-indigo-100",
  founder: "from-amber-200 to-yellow-50",
  offer: "from-emerald-200 to-teal-50",
  comparison: "from-violet-200 to-fuchsia-50",
};

export function Thumb({ c, className }: { c: Creative; className?: string }) {
  const Icon = c.format === "Video" ? Play : c.format === "Static" ? ImageIcon : GalleryHorizontalEnd;
  return (
    <div
      className={cn("relative grid h-12 w-[38px] shrink-0 place-items-center overflow-hidden rounded-md bg-gradient-to-br ring-1 ring-black/5", THUMB[c.angle], className)}
      aria-hidden
    >
      <Icon className="size-3.5 text-slate-700/70" fill={c.format === "Video" ? "currentColor" : "none"} />
      <span className="absolute bottom-0.5 left-0.5 rounded bg-white/75 px-0.5 text-[8px] font-semibold text-slate-700">{c.strategist}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  if (status === "Winner")
    return (
      <Badge variant="winner">
        <Trophy className="size-3" /> Winner
      </Badge>
    );
  if (status === "Testing")
    return (
      <Badge variant="testing">
        <FlaskConical className="size-3" /> Testing
      </Badge>
    );
  return (
    <Badge variant="loser">
      <CircleX className="size-3" /> Loser
    </Badge>
  );
}

export function Avatar({ code, className }: { code: string; className?: string }) {
  return (
    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary", className)}>{code}</span>
  );
}
