import { authenticate, dbError, fail, pick, readJson } from "@/lib/api";

export async function POST(request) {
  const { supabase, error } = await authenticate();
  if (error) return error;

  const body = await readJson(request);
  if (!body) return fail(400, "Invalid JSON body");

  const { value, error: invalid } = pick(body, {
    required: ["column_id", "title", "position"],
    optional: ["description"],
  });
  if (invalid) return invalid;

  const { data, error: queryError } = await supabase
    .from("cards")
    .insert({ description: "", ...value })
    .select()
    .single();

  if (queryError) return dbError("cards.POST", queryError);
  return Response.json(data);
}

export async function PATCH(request) {
  const { supabase, error } = await authenticate();
  if (error) return error;

  const body = await readJson(request);
  if (!body) return fail(400, "Invalid JSON body");

  const { value: identity, error: invalidId } = pick(body, { required: ["id"] });
  if (invalidId) return invalidId;

  const { value: updates, error: invalid } = pick(body, {
    optional: ["title", "description", "position", "column_id"],
  });
  if (invalid) return invalid;

  if (Object.keys(updates).length === 0) {
    return fail(400, "No updatable fields provided");
  }

  updates.updated_at = new Date().toISOString();

  const { data, error: queryError } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", identity.id)
    .select()
    .single();

  if (queryError) return dbError("cards.PATCH", queryError);
  return Response.json(data);
}

export async function DELETE(request) {
  const { supabase, error } = await authenticate();
  if (error) return error;

  const body = await readJson(request);
  if (!body) return fail(400, "Invalid JSON body");

  const { value, error: invalid } = pick(body, { required: ["id"] });
  if (invalid) return invalid;

  const { error: queryError } = await supabase
    .from("cards")
    .delete()
    .eq("id", value.id);

  if (queryError) return dbError("cards.DELETE", queryError);
  return Response.json({ success: true });
}
