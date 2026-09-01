import { NextResponse } from "next/server";
import { getPortfolioStats } from "@/lib/portfolioStats";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getPortfolioStats(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error(
      `[DB_ERROR]: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return NextResponse.json(
      { error: "Something went wrong computing portfolio stats." },
      { status: 500 },
    );
  }
}
