"use client";

import {
  Code2,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Trophy,
  User,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/snippets", label: "Snippets", icon: Code2 },
  { href: "/leaderboard", label: "Classement", icon: Trophy },
  { href: "/profile", label: "Profil", icon: User },
] as const;

type AppShellProps = {
  children: ReactNode;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAuthenticated = Boolean(session?.user);
  const shouldShowPrivateNav = isAuthenticated && !isAuthPage;

  const navItems = session?.user?.isModerator
    ? [...NAV_ITEMS, { href: "/moderation", label: "Modération", icon: Shield }]
    : [...NAV_ITEMS];

  function handleSignOut() {
    void signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link
            className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={isAuthenticated ? "/dashboard" : "/"}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition group-hover:opacity-90">
              <Code2 aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">
                CodeMentor
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                Peer code review
              </span>
            </span>
          </Link>

          {/* Nav desktop + actions */}
          {shouldShowPrivateNav ? (
            <div className="flex items-center gap-1">
              <nav
                aria-label="Navigation principale"
                className="hidden items-center gap-1 lg:flex"
              >
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                      href={item.href}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <ThemeToggle />

              <button
                className="hidden h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-secondary-foreground transition hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:inline-flex"
                type="button"
                onClick={handleSignOut}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Déconnexion
              </button>

              {/* Bouton menu mobile */}
              <button
                aria-expanded={mobileNavOpen}
                aria-label={
                  mobileNavOpen
                    ? "Fermer le menu de navigation"
                    : "Ouvrir le menu de navigation"
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
              >
                {mobileNavOpen ? (
                  <X aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Menu aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <nav aria-label="Navigation publique" className="flex gap-2">
                <Link className="btn-secondary" href="/login">
                  Connexion
                </Link>
                <Link className="btn-primary" href="/register">
                  Inscription
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* Nav mobile dépliable */}
        {shouldShowPrivateNav && mobileNavOpen ? (
          <nav
            aria-label="Navigation mobile"
            className="border-t border-border bg-background lg:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              <button
                className="mt-1 inline-flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  handleSignOut();
                }}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </nav>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-background/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>CodeMentor</span>
          <span>Reviews bienveillantes, progression mesurable.</span>
        </div>
      </footer>
    </div>
  );
}
