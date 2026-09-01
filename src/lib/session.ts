import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  // @ts-expect-error - id is our own addition to the session shape
  const { id, email, name } = session.user;
  if (!id || !email || !name) return null;
  return { id: Number(id), email, name };
}
