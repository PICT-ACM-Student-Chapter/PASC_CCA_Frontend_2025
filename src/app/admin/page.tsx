import { notFound } from "next/navigation";

/**
 * The /admin route is intentionally a 404.
 * Admin access is only available through the private secret route
 * defined in NEXT_PUBLIC_ADMIN_SECRET_ROUTE.
 */
export default function AdminDirectAccess() {
  notFound();
}
