import { notFound } from "next/navigation";

export default async function AdminSecretLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminSecret: string }>;
}) {
  const { adminSecret } = await params;
  const expectedSecret = process.env.ADMIN_SECRET_ROUTE;

  if (!expectedSecret || adminSecret !== expectedSecret) {
    notFound();
  }

  return <>{children}</>;
}
