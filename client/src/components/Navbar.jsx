import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <nav className="flex items-center justify-between px-6 py-3">
        <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
          ClearPath
        </span>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-900 text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-neutral-900 cursor-pointer">
                Sign up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>
    </header>
  );
}