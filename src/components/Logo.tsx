import Link from "next/link";

// Swap this to a real logo asset when it's ready, e.g.:
//   import logoImage from "@/assets/logo.png";
//   const LOGO_IMAGE: StaticImageData | null = logoImage;
const LOGO_IMAGE: string | null = null;

const SIZES = {
  sm: { box: "h-7 w-7", text: "text-[15px]", initials: "text-xs" },
  lg: { box: "h-10 w-10", text: "text-xl", initials: "text-sm" },
} as const;

interface LogoProps {
  href?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Single source of truth for the UbuntuNow brand mark — swap LOGO_IMAGE above once the real asset lands. */
export function Logo({ href = "/", size = "sm", className = "" }: LogoProps) {
  const s = SIZES[size];
  return (
    <Link href={href} className={`flex items-center gap-2.5 group shrink-0 ${className}`}>
      <div className={`${s.box} rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 overflow-hidden shrink-0`}>
        {LOGO_IMAGE ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={LOGO_IMAGE} alt="UbuntuNow" className="h-full w-full object-contain" />
        ) : (
          <span className={`text-primary-foreground font-black ${s.initials}`}>UN</span>
        )}
      </div>
      <span className={`font-bold ${s.text} text-foreground tracking-tight`}>
        Ubuntu<span className="text-accent">Now</span>
      </span>
    </Link>
  );
}
