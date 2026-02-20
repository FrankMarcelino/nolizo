import {
  buildEqualShares,
  ExpenseDraft,
  ResponsibilityShare,
  validateExpenseDraft
} from "../domain/financeModels";
import { createSupabaseAdminClient } from "../lib/supabaseAdmin";

export type ExpenseStatus = "a_vencer" | "vencida" | "paga";

export type ExpenseKind = "fixa" | "variavel";

export interface CreateExpenseInput {
  familyId: string;
  amount: number;
  categoryId: string;
  description?: string;
  dueDate: string;
  status?: ExpenseStatus;
  expenseType?: ExpenseKind;
  splitMode: "igual" | "percentual" | "valorFixo";
  responsibleMemberIds: string[];
  shares?: ResponsibilityShare[];
}

export interface ExpenseResponseItem {
  id: string;
  familyId: string;
  amount: number;
  categoryId: string;
  description: string | null;
  dueDate: string;
  status: ExpenseStatus;
  splitMode: "igual" | "percentual" | "valorFixo";
  shares: ResponsibilityShare[];
}

function normalizeShares(input: CreateExpenseInput): ResponsibilityShare[] {
  if (input.responsibleMemberIds.length === 1) {
    return [{ memberId: input.responsibleMemberIds[0], fixedAmount: input.amount }];
  }

  if (input.splitMode === "igual") {
    return buildEqualShares(input.amount, input.responsibleMemberIds);
  }

  return input.shares ?? [];
}

function toExpenseDraft(input: CreateExpenseInput, shares: ResponsibilityShare[]): ExpenseDraft {
  return {
    amount: input.amount,
    categoryId: input.categoryId,
    responsibleMemberIds: input.responsibleMemberIds,
    splitMode: input.splitMode,
    shares
  };
}

export async function createExpense(input: CreateExpenseInput): Promise<ExpenseResponseItem> {
  const shares = normalizeShares(input);
  const draft = toExpenseDraft(input, shares);
  const issues = validateExpenseDraft(draft);
  if (issues.length > 0) {
    const error = new Error("Validation failed");
    (error as Error & { details?: unknown }).details = issues;
    throw error;
  }

  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("create_expense_with_shares", {
    p_family_id: input.familyId,
    p_amount: input.amount,
    p_category_id: input.categoryId,
    p_description: input.description ?? null,
    p_due_date: input.dueDate,
    p_status: input.status ?? "a_vencer",
    p_split_mode: input.splitMode,
    p_responsible_member_ids: input.responsibleMemberIds,
    p_shares: shares,
    p_expense_type: input.expenseType ?? "variavel",
  });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return {
    id: data.id,
    familyId: data.family_id,
    amount: Number(data.amount),
    categoryId: data.category_id,
    description: data.description,
    dueDate: data.due_date,
    status: data.status,
    splitMode: data.split_mode,
    shares: data.shares ?? []
  };
}

export async function listExpenses(params: {
  familyId: string;
  fromDate?: string;
  toDate?: string;
}): Promise<ExpenseResponseItem[]> {
  const client = createSupabaseAdminClient();
  let query = client
    .from("expenses")
    .select(
      "id,family_id,amount,category_id,description,due_date,status,split_mode,expense_shares(member_id,percentage,fixed_amount)"
    )
    .eq("family_id", params.familyId)
    .order("due_date", { ascending: true });

  if (params.fromDate) {
    query = query.gte("due_date", params.fromDate);
  }

  if (params.toDate) {
    query = query.lte("due_date", params.toDate);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    familyId: row.family_id,
    amount: Number(row.amount),
    categoryId: row.category_id,
    description: row.description,
    dueDate: row.due_date,
    status: row.status,
    splitMode: row.split_mode,
    shares: (row.expense_shares ?? []).map((share) => ({
      memberId: share.member_id,
      percentage: share.percentage === null ? undefined : Number(share.percentage),
      fixedAmount: share.fixed_amount === null ? undefined : Number(share.fixed_amount)
    }))
  }));
}
