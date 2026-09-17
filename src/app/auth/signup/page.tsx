import { notFound } from "next/navigation";

// Registration is closed — this route is not publicly available.
// New users can only be registered directly through the database by an admin.
export default function SignupPage() {
  notFound();
}
