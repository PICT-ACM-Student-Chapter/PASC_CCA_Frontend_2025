import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSecretLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminSecret: string }>;
}) {
  const { adminSecret } = await params;
  const rawSecret = process.env.ADMIN_SECRET_ROUTE;
  const expectedSecret = rawSecret?.trim().replace(/^["']|["']$/g, "");

  if (!expectedSecret || adminSecret.trim() !== expectedSecret) {
    notFound();
  }

  return <>{children}</>;
}

