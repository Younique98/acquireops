import type { Metadata } from "next";
import { PropertyForm } from "@/components/PropertyForm";

export const metadata: Metadata = {
  title: "Add a property",
  description:
    "Enter purchase price, rent, expenses, and financing terms for a candidate property to get cap rate, cash-on-cash return, and DSCR.",
};

export default function NewPropertyPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary mb-6">
        Add a property
      </h1>
      <PropertyForm />
    </main>
  );
}
