import { members } from "@/content/members";
import { getLiveStatusBulk } from "@/lib/live-status";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const statusMap = await getLiveStatusBulk(members);
  const data: Record<string, unknown> = {};
  statusMap.forEach((value, key) => {
    data[key] = value;
  });
  return new Response(JSON.stringify({ statuses: data, fetchedAt: Date.now() }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
