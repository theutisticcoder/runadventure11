import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, LogIn, LogOut, MapPin, Swords } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  dataOcid: string;
}

const NAV_LINKS: NavLink[] = [
  { to: "/", label: "Home", icon: <Swords size={18} />, dataOcid: "nav-home" },
  {
    to: "/feed",
    label: "Adventures",
    icon: <BookOpen size={18} />,
    dataOcid: "nav-feed",
  },
];

export default function Layout({ children }: LayoutProps) {
  const { login, clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border/60 shadow-md">
        <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
              <Swords size={16} className="text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight hidden sm:block">
              RunQuest
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid={link.dataOcid}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-accent/20 text-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAuth}
            data-ocid="nav-auth-btn"
            className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] border-border/60"
          >
            {isAuthenticated ? (
              <>
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span className="hidden sm:inline">Login</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/60 py-4 mt-auto">
        <div className="max-w-screen-lg mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin size={12} />
            <span>RunQuest Adventure — real streets, epic stories</span>
          </div>
          <span>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
