"use client";

import { logout } from "@/actions/auth";

export function SignOutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-xs font-medium text-muted transition hover:text-clay"
        title="Sign out"
      >
        Sign out
      </button>
    </form>
  );
}
