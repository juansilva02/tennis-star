import type { ComponentType, SVGProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SocialProviderId = "google" | "facebook" | "apple";

interface SocialProvider {
  id: SocialProviderId;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName?: string;
}

interface SocialLoginButtonsProps {
  disabled?: boolean;
  onProviderClick?: (provider: SocialProviderId) => void;
}

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.01v2.55h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.36l-3.24-2.55c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.92A6 6 0 0 1 6.08 12c0-.67.12-1.32.32-1.92V7.46H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.54l3.34-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.46l3.34 2.62c.79-2.37 3-4.13 5.6-4.13Z"
      />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        fill="white"
        d="M13.45 21v-8h2.68l.4-3.12h-3.08v-2c0-.9.25-1.52 1.55-1.52h1.65V3.58c-.29-.04-1.27-.12-2.42-.12-2.4 0-4.04 1.46-4.04 4.15v2.27H7.48V13h2.71v8h3.26Z"
      />
    </svg>
  );
}

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16.73 12.76c.02 2.17 1.9 2.89 1.92 2.9-.02.06-.3 1.04-.99 2.06-.59.88-1.21 1.76-2.18 1.78-.95.02-1.26-.57-2.35-.57s-1.44.55-2.34.59c-.94.03-1.65-.95-2.25-1.82-1.22-1.77-2.15-5-.9-7.18a3.49 3.49 0 0 1 2.97-1.8c.93-.02 1.8.63 2.36.63.56 0 1.61-.78 2.72-.67.46.02 1.76.19 2.6 1.41-.07.04-1.55.9-1.56 2.67ZM14.96 7.5c.5-.6.83-1.45.74-2.3-.72.03-1.6.48-2.12 1.08-.46.53-.87 1.39-.76 2.21.81.06 1.63-.4 2.14-.99Z"
      />
    </svg>
  );
}

const SOCIAL_PROVIDERS: SocialProvider[] = [
  { id: "google", label: "Google", icon: GoogleIcon },
  {
    id: "facebook",
    label: "Facebook",
    icon: FacebookIcon,
    iconClassName: "size-6",
  },
  { id: "apple", label: "Apple", icon: AppleIcon, iconClassName: "size-6" },
];

export function SocialLoginButtons({
  disabled = true,
  onProviderClick,
}: SocialLoginButtonsProps) {
  return (
    <div className="space-y-2" aria-label="Opciones de inicio de sesión social">
      <div className="grid grid-cols-3 gap-2">
        {SOCIAL_PROVIDERS.map(
          ({ id, label, icon: Icon, iconClassName }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => onProviderClick?.(id)}
            title={disabled ? `${label}, próximamente` : `Continuar con ${label}`}
            aria-label={
              disabled
                ? `Continuar con ${label}, próximamente`
                : `Continuar con ${label}`
            }
            className="h-12 min-h-12 px-2 disabled:opacity-70"
          >
            <Icon className={cn("size-5 shrink-0", iconClassName)} />
          </Button>
          ),
        )}
      </div>
      {disabled && (
        <p className="text-center text-xs text-muted-foreground">
          Inicio social próximamente
        </p>
      )}
    </div>
  );
}

export type { SocialProviderId };
