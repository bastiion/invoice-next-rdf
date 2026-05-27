import type {InvoiceInput} from '../generated/graphql';

export const DEFAULT_VAT_TAX = {
  id: 'vat',
  name: 'Mehrwertsteuer',
  abbreviation: 'MwSt.',
} as const;

type VatLike = {
  id?: string | null;
  name?: string | null;
  abbreviation?: string | null;
  rate?: number | null;
};

type TradeItemLike = {
  taxes?: {
    vat?: VatLike | null;
  } | null;
};

type InvoiceLike = {
  tradeItems?: TradeItemLike[] | null;
};

/** Strip GraphQL `__typename` keys so mutation variables stay valid. */
export function stripTypenames<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripTypenames(item)) as T;
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key === '__typename') continue;
      result[key] = stripTypenames(val);
    }
    return result as T;
  }
  return value;
}

/** Ensure each trade item VAT object has `id: "vat"` (and sensible defaults). */
export function normalizeInvoiceTaxes<T extends InvoiceLike>(invoice: T): T {
  if (!invoice?.tradeItems?.length) {
    return invoice;
  }

  return {
    ...invoice,
    tradeItems: invoice.tradeItems.map((item) => {
      const vat = item.taxes?.vat;
      if (!vat) {
        return item;
      }
      return {
        ...item,
        taxes: {
          ...item.taxes,
          vat: {
            ...DEFAULT_VAT_TAX,
            ...vat,
            id: vat.id || DEFAULT_VAT_TAX.id,
          },
        },
      };
    }),
  };
}

/** Prepare invoice data for GraphQL save/update mutations. */
export function toInvoiceInput(invoice: InvoiceLike): InvoiceInput {
  return normalizeInvoiceTaxes(stripTypenames(invoice)) as InvoiceInput;
}
