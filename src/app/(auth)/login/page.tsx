import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/itinerary");

  return (
    <div className="card p-7 sm:p-9">
      <h2 className="font-display text-2xl text-ink">Welcome back</h2>
      <p className="mt-1.5 text-sm text-muted">Pick up right where the group left off.</p>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-muted">
        Got an invite code?{" "}
        <Link href="/register" className="font-medium text-clay underline-offset-4 hover:underline">
          Join the trip
        </Link>
      </p>
    </div>
  );
}
