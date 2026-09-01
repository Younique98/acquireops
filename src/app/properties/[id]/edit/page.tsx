import type { Metadata } from "next";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { Property } from "@/lib/types";
import { PropertyForm } from "@/components/PropertyForm";

async function getProperty(id: string): Promise<Property | null> {
  const numericId = parseInt(id, 10);
  if (!Number.isInteger(numericId)) return null;
  const result = await pool.query<Property>("SELECT * FROM properties WHERE id = $1", [
    numericId,
  ]);
  return result.rows[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: "Property not found" };
  return { title: `Edit ${property.address}` };
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary mb-6">
        Edit {property.address}
      </h1>
      <PropertyForm property={property} />
    </main>
  );
}
