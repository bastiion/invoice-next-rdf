export interface Invoice {
  buyer: Buyer;
  currency: string;
  subject?: string;
  description: string;
  greeting: string;
  invoiceRef: string;
  place: string;
  seller: Seller;
  tradeItems: TradeItem[];
  discounts?: Discount[];
  sconto?: Sconto[];
}

export interface Buyer {
  address: string;
  name: string;
}

export interface TaxInfo {
  ustid: string;
}

export interface Seller {
  address: string;
  bank: Bank;
  email: string;
  name: string;
  taxInfo: TaxInfo | null;
}

export interface Bank {
  bic: string;
  iban: string;
  name: string;
}

export type TaxIdentifier = 'vat';

export interface Tax {
  id: TaxIdentifier;
  abbreviation: string;
  name: string;
  rate: number;
}

export interface CalculatedTax {
  id: TaxIdentifier;
  abbreviation: string;
  name: string;
  rate: string;
  total: string;
  totalNumber: number;
}

interface TradeItem_taxes {
  vat: Tax | null;
}

export interface TradeItem {
  optional?: boolean;
  amount: number;
  title?: string;
  description: string;
  netPricePerItem: number;
  unit: string;
  taxes: TradeItem_taxes;
}

export interface Discount {
  title?: string;
  description: string;
  rate: number;
}

export interface Sconto {
  days: number;
  rate: number;
}

export interface CalculatedDiscount extends Discount {
  taxPriceNumber: number;
  taxPrice: string;
  netPrice: string;
  netPriceNumber: number;
}

export interface CalculatedSconto extends Sconto {
  price: string;
  priceNumber: number;
}

interface CalculatedTradeItem_taxes {
  vat?: CalculatedTax;
}

export interface CalculatedTradeItem {
  optional?: boolean;
  amount: string;
  title?: string;
  description: string;
  grossPrice: string;
  netPrice: string;
  netPriceNumber: number;
  netPricePerItem: string;
  taxes: CalculatedTradeItem_taxes;
  unit: string;
}

interface CalculatedTotal {
  grossGrandTotal: string;
  netGrandTotal: string;
}

export interface CalculatedInvoice {
  buyer: Buyer;
  currency: string;
  subject?: string;
  description: string;
  greeting: string;
  invoiceRef: string;
  place: string;
  seller: Seller;
  taxes: CalculatedTax[];
  total: CalculatedTotal;
  totalOfOptionals?: CalculatedTotal;
  tradeItems: CalculatedTradeItem[];
  discounts?: CalculatedDiscount[];
  sconto?: CalculatedSconto[];
}
