import { authenticate, dbError, fail, pick, readJson } from "@/lib/api";

export async function POST(request) {
  const { supabase, error } = await authenticate();
  if (error) return error;

  const body = await readJson(request);
  if (!body) return fail(400, "Invalid JSON body");

  const { value, error: invalid } = pick(body, {
    required: ["board_id", "title", "position"],
  });
  if (invalid) return invalid;

  const { data, error: queryError } = await supabase
    .from("columns")
    .insert(value)
    .select()
    .single();

  if (queryError) return dbError("columns.POST", queryError);
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
    optional: ["title", "position"],
  });
  if (invalid) return invalid;

  if (Object.keys(updates).length === 0) {
    return fail(400, "No updatable fields provided");
  }

  const { data, error: queryError } = await supabase
    .from("columns")
    .update(updates)
    .eq("id", identity.id)
    .select()
    .single();

  if (queryError) return dbError("columns.PATCH", queryError);
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
    .from("columns")
    .delete()
    .eq("id", value.id);

  if (queryError) return dbError("columns.DELETE", queryError);
  return Response.json({ success: true });
}
