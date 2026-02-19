export type CategoryType = "entrada" | "saida";

export type ResponsibilitySplitMode = "igual" | "percentual" | "valorFixo";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isCustom: boolean;
  isFavorite: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  active: boolean;
}

export interface ResponsibilityShare {
  memberId: string;
  percentage?: number;
  fixedAmount?: number;
}

export interface ExpenseDraft {
  amount: number;
  categoryId: string;
  responsibleMemberIds: string[];
  splitMode: ResponsibilitySplitMode;
  shares: ResponsibilityShare[];
}

export interface ValidationIssue {
  code:
    | "amount.invalid"
    | "category.required"
    | "responsible.required"
    | "responsible.duplicate"
    | "split.percentual.invalidTotal"
    | "split.valorFixo.invalidTotal"
    | "split.valorFixo.invalidNegative"
    | "split.percentual.invalidNegative"
    | "split.share.missing";
  message: string;
}

const CURRENCY_EPSILON = 0.01;

export const DEFAULT_INCOME_CATEGORY_IDS = [
  "salary",
  "pro_labore",
  "freelance",
  "commission_bonus",
  "benefits",
  "rent_income",
  "investment_income",
  "reimbursement",
  "casual_sale",
  "gift_donation_received",
  "other_income"
] as const;

export const DEFAULT_EXPENSE_CATEGORY_IDS = [
  "housing",
  "utilities",
  "groceries",
  "dining_out",
  "transport",
  "health",
  "education",
  "debts_loans",
  "credit_card",
  "taxes_fees",
  "insurance",
  "leisure",
  "subscriptions",
  "personal_care",
  "clothing",
  "children_family",
  "pets",
  "home_maintenance",
  "travel",
  "donations",
  "investments_contribution",
  "other_expense"
] as const;

export function buildEqualShares(
  totalAmount: number,
  memberIds: string[]
): ResponsibilityShare[] {
  if (!memberIds.length || totalAmount <= 0) {
    return [];
  }

  const equalValue = Number((totalAmount / memberIds.length).toFixed(2));
  const shares = memberIds.map((memberId) => ({
    memberId,
    fixedAmount: equalValue
  }));

  // Ajuste do ultimo item para fechar centavos.
  const sum = shares.reduce((acc, share) => acc + (share.fixedAmount ?? 0), 0);
  const delta = Number((totalAmount - sum).toFixed(2));
  const lastShare = shares[shares.length - 1];
  lastShare.fixedAmount = Number(((lastShare.fixedAmount ?? 0) + delta).toFixed(2));

  return shares;
}

export function validateExpenseDraft(draft: ExpenseDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!Number.isFinite(draft.amount) || draft.amount <= 0) {
    issues.push({
      code: "amount.invalid",
      message: "Valor da despesa deve ser maior que zero."
    });
  }

  if (!draft.categoryId.trim()) {
    issues.push({
      code: "category.required",
      message: "Categoria da despesa e obrigatoria."
    });
  }

  if (!draft.responsibleMemberIds.length) {
    issues.push({
      code: "responsible.required",
      message: "Defina ao menos um responsavel."
    });
  }

  const uniqueMembers = new Set(draft.responsibleMemberIds);
  if (uniqueMembers.size !== draft.responsibleMemberIds.length) {
    issues.push({
      code: "responsible.duplicate",
      message: "Nao e permitido repetir responsaveis."
    });
  }

  if (draft.responsibleMemberIds.length === 1) {
    return issues;
  }

  if (draft.shares.length !== draft.responsibleMemberIds.length) {
    issues.push({
      code: "split.share.missing",
      message: "Todos os responsaveis precisam de rateio."
    });
    return issues;
  }

  if (draft.splitMode === "percentual") {
    const hasNegative = draft.shares.some((share) => (share.percentage ?? 0) < 0);
    if (hasNegative) {
      issues.push({
        code: "split.percentual.invalidNegative",
        message: "Percentual nao pode ser negativo."
      });
    }

    const totalPercentage = draft.shares.reduce(
      (acc, share) => acc + (share.percentage ?? 0),
      0
    );

    if (Math.abs(totalPercentage - 100) > CURRENCY_EPSILON) {
      issues.push({
        code: "split.percentual.invalidTotal",
        message: "No modo percentual, a soma deve ser 100%."
      });
    }
  }

  if (draft.splitMode === "valorFixo") {
    const hasNegative = draft.shares.some((share) => (share.fixedAmount ?? 0) < 0);
    if (hasNegative) {
      issues.push({
        code: "split.valorFixo.invalidNegative",
        message: "Valor do rateio nao pode ser negativo."
      });
    }

    const fixedTotal = draft.shares.reduce(
      (acc, share) => acc + (share.fixedAmount ?? 0),
      0
    );

    if (Math.abs(fixedTotal - draft.amount) > CURRENCY_EPSILON) {
      issues.push({
        code: "split.valorFixo.invalidTotal",
        message: "No modo valor fixo, a soma do rateio deve fechar o valor total."
      });
    }
  }

  return issues;
}
