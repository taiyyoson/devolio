import { authenticate, dbError } from "@/lib/api";

export async function GET() {
  const { supabase, error } = await authenticate();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("boards")
    .select("*, columns(*, cards(*))")
    .order("created_at")
    .order("position", { referencedTable: "columns" })
    .order("position", { referencedTable: "columns.cards" });

  if (queryError) return dbError("boards.GET", queryError);
  return Response.json(data);
}
