import { PropertyForm } from "@/components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-primary mb-6">
        Add a property
      </h1>
      <PropertyForm />
    </main>
  );
}
