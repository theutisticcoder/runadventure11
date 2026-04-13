import { j as jsxRuntimeExports, al as Slot, a as cn, am as cva } from "./index-DOfuG9j6.js";
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
const GENRE_COLORS = {
  Fantasy: "text-amber-400",
  SciFi: "text-cyan-400",
  Horror: "text-red-500",
  Mystery: "text-purple-400",
  Romance: "text-rose-400"
};
const GENRE_BG_COLORS = {
  Fantasy: "bg-amber-400/10 border-amber-400/30",
  SciFi: "bg-cyan-400/10 border-cyan-400/30",
  Horror: "bg-red-500/10 border-red-500/30",
  Mystery: "bg-purple-400/10 border-purple-400/30",
  Romance: "bg-rose-400/10 border-rose-400/30"
};
const GENRE_GLOW = {
  Fantasy: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
  SciFi: "shadow-[0_0_20px_rgba(34,211,238,0.3)]",
  Horror: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  Mystery: "shadow-[0_0_20px_rgba(167,139,250,0.3)]",
  Romance: "shadow-[0_0_20px_rgba(251,113,133,0.3)]"
};
const GENRE_BUTTON_COLORS = {
  Fantasy: "bg-amber-400 hover:bg-amber-300 text-black",
  SciFi: "bg-cyan-400 hover:bg-cyan-300 text-black",
  Horror: "bg-red-600 hover:bg-red-500 text-white",
  Mystery: "bg-purple-500 hover:bg-purple-400 text-white",
  Romance: "bg-rose-500 hover:bg-rose-400 text-white"
};
export {
  Badge as B,
  GENRE_BUTTON_COLORS as G,
  GENRE_COLORS as a,
  GENRE_BG_COLORS as b,
  GENRE_GLOW as c
};
