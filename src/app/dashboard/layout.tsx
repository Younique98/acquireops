import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Nav />
      {children}
    </>
  );
}
