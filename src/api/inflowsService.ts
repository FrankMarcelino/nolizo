import { createSupabaseAdminClient } from "../lib/supabaseAdmin";

export type InflowStatus = "confirmada" | "projetada";

export interface CreateInflowInput {
  familyId: string;
  memberId?: string;
  amount: number;
  categoryId: string;
  source: string;
  inflowDate: string;
  status?: InflowStatus;
  recurrence?: string;
  notes?: string;
}

export interface InflowResponseItem {
  id: string;
  familyId: string;
  memberId: string | null;
  amount: number;
  categoryId: string;
  source: string;
  inflowDate: string;
  status: InflowStatus;
  recurrence: string | null;
  notes: string | null;
}

export async function createInflow(
  input: CreateInflowInput
): Promise<InflowResponseItem> {
  if (input.amount <= 0) throw new Error("Valor deve ser maior que zero.");
  if (!input.source.trim()) throw new Error("Origem e obrigatoria.");

  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("inflows")
    .insert({
      family_id: input.familyId,
      member_id: input.memberId ?? null,
      amount: input.amount,
      category_id: input.categoryId,
      source: input.source,
      inflow_date: input.inflowDate,
      status: input.status ?? "confirmada",
      recurrence: input.recurrence ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Supabase error: ${error.message}`);

  return mapRow(data);
}

export async function listInflows(params: {
  familyId: string;
  fromDate?: string;
  toDate?: string;
}): Promise<InflowResponseItem[]> {
  const client = createSupabaseAdminClient();
  let query = client
    .from("inflows")
    .select("*")
    .eq("family_id", params.familyId)
    .order("inflow_date", { ascending: false });

  if (params.fromDate) query = query.gte("inflow_date", params.fromDate);
  if (params.toDate) query = query.lte("inflow_date", params.toDate);

  const { data, error } = await query;
  if (error) throw new Error(`Supabase error: ${error.message}`);

  return (data ?? []).map(mapRow);
}

function mapRow(row: Record<string, unknown>): InflowResponseItem {
  return {
    id: row.id as string,
    familyId: row.family_id as string,
    memberId: (row.member_id as string) ?? null,
    amount: Number(row.amount),
    categoryId: row.category_id as string,
    source: row.source as string,
    inflowDate: row.inflow_date as string,
    status: row.status as InflowStatus,
    recurrence: (row.recurrence as string) ?? null,
    notes: (row.notes as string) ?? null,
  };
}
