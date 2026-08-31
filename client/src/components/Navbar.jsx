import Link from "next/link";
import { SignInButton, SignUpButton, SignOutButton, Show } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Navbar — N5-style floating pill, monochrome.
 * Signed out: ghost Sign in + ink Sign up (modals).
 * Signed in: link to a fresh roadmap + red Sign out.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-[200] border-b hairline bg-paper/85 backdrop-blur">
      <nav className="wrap flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ClearPath home">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-ink" aria-hidden="true" />
          <span className="font-display text-lg font-bold tracking-tight">ClearPath</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="btn btn-ghost">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="btn btn-primary">
                Sign up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <Link href="/questionnaire" className="btn btn-ghost hidden sm:inline-flex">
              New roadmap
            </Link>
            <SignOutButton>
              <button type="button" className="btn btn-danger">
                Sign out
              </button>
            </SignOutButton>
          </Show>
        </div>
      </nav>
    </header>
  );
}