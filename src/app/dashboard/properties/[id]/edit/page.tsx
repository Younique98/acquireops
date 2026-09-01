import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { Property } from "@/lib/types";
import { PropertyForm } from "@/components/PropertyForm";
import { getCurrentUser } from "@/lib/session";

async function getProperty(userId: number, id: string): Promise<Property | null> {
  const numericId = parseInt(id, 10);
  if (!Number.isInteger(numericId)) return null;
  const result = await pool.query<Property>(
    "SELECT * FROM properties WHERE id = $1 AND user_id = $2",
    [numericId, userId],
  );
  return result.rows[0] ?? null;
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;
  const property = await getProperty(user.id, id);
  if (!property) notFound();

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-primary mb-6">
        Edit {property.address}
      </h1>
      <PropertyForm property={property} />
    </main>
  );
}
