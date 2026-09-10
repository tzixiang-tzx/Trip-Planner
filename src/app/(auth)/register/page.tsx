import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/itinerary");

  return (
    <div className="card p-7 sm:p-9">
      <h2 className="font-display text-2xl text-ink">Come along</h2>
      <p className="mt-1.5 text-sm text-muted">
        Join a trip with an invite code, or start one of your own.
      </p>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-clay underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
