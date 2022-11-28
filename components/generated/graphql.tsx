import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from 'react-query';
import { fetcher } from './fetcher';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  JSON: any;
};

export type Bank = {
  __typename?: 'Bank';
  bic: Scalars['String'];
  iban: Scalars['String'];
  name: Scalars['String'];
};

export type BankInput = {
  bic: Scalars['String'];
  iban: Scalars['String'];
  name: Scalars['String'];
};

export type Buyer = {
  __typename?: 'Buyer';
  address: Scalars['String'];
  name: Scalars['String'];
};

export type BuyerInput = {
  address: Scalars['String'];
  name: Scalars['String'];
};

export type CalculatedDiscount = {
  __typename?: 'CalculatedDiscount';
  netPrice: Scalars['String'];
  netPriceNumber: Scalars['Float'];
  taxPrice: Scalars['String'];
  taxPriceNumber: Scalars['Float'];
};

export type CalculatedInvoice = {
  __typename?: 'CalculatedInvoice';
  buyer: Buyer;
  currency: Scalars['String'];
  description: Scalars['String'];
  discounts?: Maybe<Array<CalculatedDiscount>>;
  greeting: Scalars['String'];
  invoiceRef: Scalars['String'];
  place: Scalars['String'];
  sconto?: Maybe<Array<CalculatedSconto>>;
  seller: Seller;
  subject?: Maybe<Scalars['String']>;
  taxes: Array<CalculatedTax>;
  total: CalculatedTotal;
  totalOfOptionals?: Maybe<CalculatedTotal>;
  tradeItems: Array<CalculatedTradeItem>;
};

export type CalculatedSconto = {
  __typename?: 'CalculatedSconto';
  price: Scalars['String'];
  priceNumber: Scalars['Float'];
};

export type CalculatedTax = {
  __typename?: 'CalculatedTax';
  abbreviation: Scalars['String'];
  id: TaxIdentifier;
  name: Scalars['String'];
  rate: Scalars['String'];
  total: Scalars['String'];
  totalNumber: Scalars['Float'];
};

export type CalculatedTaxInput = {
  abbreviation: Scalars['String'];
  id: TaxIdentifier;
  name: Scalars['String'];
  rate: Scalars['String'];
  total: Scalars['String'];
  totalNumber: Scalars['Float'];
};

export type CalculatedTotal = {
  __typename?: 'CalculatedTotal';
  grossGrandTotal: Scalars['String'];
  netGrandTotal: Scalars['String'];
};

export type CalculatedTradeItem = {
  __typename?: 'CalculatedTradeItem';
  amount: Scalars['String'];
  description: Scalars['String'];
  grossPrice: Scalars['String'];
  netPrice: Scalars['String'];
  netPriceNumber: Scalars['Float'];
  netPricePerItem: Scalars['String'];
  optional?: Maybe<Scalars['Boolean']>;
  taxes?: Maybe<CalculatedTradeItem_Taxes>;
  title?: Maybe<Scalars['String']>;
  unit: Scalars['String'];
};

export type CalculatedTradeItem_Taxes = {
  __typename?: 'CalculatedTradeItem_taxes';
  vat?: Maybe<CalculatedTax>;
};

export type Discount = {
  __typename?: 'Discount';
  description: Scalars['String'];
  rate: Scalars['Float'];
  title?: Maybe<Scalars['String']>;
};

export type DiscountInput = {
  description: Scalars['String'];
  rate: Scalars['Float'];
  title?: InputMaybe<Scalars['String']>;
};

export type Invoice = {
  __typename?: 'Invoice';
  buyer: Buyer;
  currency: Scalars['String'];
  description: Scalars['String'];
  discounts?: Maybe<Array<Discount>>;
  greeting: Scalars['String'];
  invoiceRef: Scalars['String'];
  place: Scalars['String'];
  sconto?: Maybe<Array<Sconto>>;
  seller: Seller;
  subject?: Maybe<Scalars['String']>;
  tradeItems: Array<TradeItem>;
};

export type InvoiceInput = {
  buyer: BuyerInput;
  currency: Scalars['String'];
  description: Scalars['String'];
  discounts?: InputMaybe<Array<DiscountInput>>;
  greeting: Scalars['String'];
  invoiceRef: Scalars['String'];
  place: Scalars['String'];
  sconto?: InputMaybe<Array<ScontoInput>>;
  seller: SellerInput;
  subject?: InputMaybe<Scalars['String']>;
  tradeItems: Array<TradeItemInput>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addInvoice?: Maybe<Invoice>;
  removeInvoice?: Maybe<Scalars['Boolean']>;
  renderInvoice?: Maybe<Scalars['Boolean']>;
};


export type MutationAddInvoiceArgs = {
  invoice?: InputMaybe<InvoiceInput>;
};


export type MutationRemoveInvoiceArgs = {
  invoiceRef: Scalars['String'];
};


export type MutationRenderInvoiceArgs = {
  invoiceRef: Scalars['String'];
  template: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  calculatedInvoice?: Maybe<CalculatedInvoice>;
  invoice?: Maybe<Invoice>;
  invoices?: Maybe<Array<Maybe<Invoice>>>;
  invoices2RDF?: Maybe<Scalars['JSON']>;
  pdfOfInvoice?: Maybe<Scalars['String']>;
  templates?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type QueryCalculatedInvoiceArgs = {
  invoiceRef: Scalars['String'];
};


export type QueryInvoiceArgs = {
  invoiceRef: Scalars['String'];
};


export type QueryPdfOfInvoiceArgs = {
  invoiceRef: Scalars['String'];
};

export type Sconto = {
  __typename?: 'Sconto';
  days: Scalars['Float'];
  rate: Scalars['Float'];
};

export type ScontoInput = {
  days: Scalars['Float'];
  rate: Scalars['Float'];
};

export type Seller = {
  __typename?: 'Seller';
  address: Scalars['String'];
  bank: Bank;
  email: Scalars['String'];
  name: Scalars['String'];
  taxInfo?: Maybe<TaxInfo>;
};

export type SellerInput = {
  address: Scalars['String'];
  bank: BankInput;
  email: Scalars['String'];
  name: Scalars['String'];
  taxInfo?: InputMaybe<TaxInfoInput>;
};

export type Tax = {
  __typename?: 'Tax';
  abbreviation: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  rate: Scalars['Float'];
};

export enum TaxIdentifier {
  Vat = 'vat'
}

export type TaxInfo = {
  __typename?: 'TaxInfo';
  ustid: Scalars['String'];
};

export type TaxInfoInput = {
  ustid: Scalars['String'];
};

export type TaxInput = {
  abbreviation: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  rate: Scalars['Float'];
};

export type TradeItem = {
  __typename?: 'TradeItem';
  amount: Scalars['Float'];
  description: Scalars['String'];
  netPricePerItem: Scalars['Float'];
  optional?: Maybe<Scalars['Boolean']>;
  taxes?: Maybe<TradeItem_Taxes>;
  title?: Maybe<Scalars['String']>;
  unit: Scalars['String'];
};

export type TradeItemInput = {
  amount: Scalars['Float'];
  description: Scalars['String'];
  netPricePerItem: Scalars['Float'];
  optional?: InputMaybe<Scalars['Boolean']>;
  taxes?: InputMaybe<TradeItem_TaxesInput>;
  title?: InputMaybe<Scalars['String']>;
  unit: Scalars['String'];
};

export type TradeItem_Taxes = {
  __typename?: 'TradeItem_taxes';
  vat?: Maybe<Tax>;
};

export type TradeItem_TaxesInput = {
  vat?: InputMaybe<TaxInput>;
};

export type AddInvoiceMutationVariables = Exact<{
  invoice?: InputMaybe<InvoiceInput>;
}>;


export type AddInvoiceMutation = { __typename?: 'Mutation', addInvoice?: { __typename?: 'Invoice', invoiceRef: string, subject?: string | null, description: string } | null };

export type InvoiceQueryVariables = Exact<{
  invoiceRef: Scalars['String'];
}>;


export type InvoiceQuery = { __typename?: 'Query', invoice?: { __typename?: 'Invoice', invoiceRef: string, subject?: string | null, description: string, place: string, greeting: string, currency: string, buyer: { __typename?: 'Buyer', name: string, address: string }, seller: { __typename?: 'Seller', name: string, address: string, email: string, bank: { __typename?: 'Bank', name: string, iban: string, bic: string }, taxInfo?: { __typename?: 'TaxInfo', ustid: string } | null }, discounts?: Array<{ __typename?: 'Discount', description: string, title?: string | null, rate: number }> | null, sconto?: Array<{ __typename?: 'Sconto', days: number, rate: number }> | null, tradeItems: Array<{ __typename?: 'TradeItem', title?: string | null, description: string, unit: string, amount: number, optional?: boolean | null, netPricePerItem: number, taxes?: { __typename?: 'TradeItem_taxes', vat?: { __typename?: 'Tax', id: string, rate: number, abbreviation: string, name: string } | null } | null }> } | null };

export type InvoicesQueryVariables = Exact<{ [key: string]: never; }>;


export type InvoicesQuery = { __typename?: 'Query', invoices?: Array<{ __typename?: 'Invoice', invoiceRef: string, subject?: string | null, description: string, place: string, greeting: string, currency: string, buyer: { __typename?: 'Buyer', name: string, address: string }, seller: { __typename?: 'Seller', name: string, address: string, email: string, bank: { __typename?: 'Bank', name: string, iban: string, bic: string }, taxInfo?: { __typename?: 'TaxInfo', ustid: string } | null }, discounts?: Array<{ __typename?: 'Discount', description: string, title?: string | null, rate: number }> | null, sconto?: Array<{ __typename?: 'Sconto', days: number, rate: number }> | null, tradeItems: Array<{ __typename?: 'TradeItem', title?: string | null, description: string, unit: string, amount: number, optional?: boolean | null, netPricePerItem: number, taxes?: { __typename?: 'TradeItem_taxes', vat?: { __typename?: 'Tax', rate: number, abbreviation: string, name: string } | null } | null }> } | null> | null };

export type PdfOfInvoiceQueryVariables = Exact<{
  invoiceRef: Scalars['String'];
}>;


export type PdfOfInvoiceQuery = { __typename?: 'Query', pdfOfInvoice?: string | null };

export type RemoveInvoiceMutationVariables = Exact<{
  invoiceRef: Scalars['String'];
}>;


export type RemoveInvoiceMutation = { __typename?: 'Mutation', removeInvoice?: boolean | null };

export type RenderInvoiceMutationVariables = Exact<{
  invoiceRef: Scalars['String'];
  template: Scalars['String'];
}>;


export type RenderInvoiceMutation = { __typename?: 'Mutation', renderInvoice?: boolean | null };

export type TemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type TemplatesQuery = { __typename?: 'Query', templates?: Array<string | null> | null };


export const AddInvoiceDocument = `
    mutation addInvoice($invoice: InvoiceInput) {
  addInvoice(invoice: $invoice) {
    invoiceRef
    subject
    description
  }
}
    `;
export const useAddInvoiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AddInvoiceMutation, TError, AddInvoiceMutationVariables, TContext>) =>
    useMutation<AddInvoiceMutation, TError, AddInvoiceMutationVariables, TContext>(
      ['addInvoice'],
      (variables?: AddInvoiceMutationVariables) => fetcher<AddInvoiceMutation, AddInvoiceMutationVariables>(AddInvoiceDocument, variables)(),
      options
    );
export const InvoiceDocument = `
    query invoice($invoiceRef: String!) {
  invoice(invoiceRef: $invoiceRef) {
    invoiceRef
    subject
    description
    place
    greeting
    currency
    buyer {
      name
      address
    }
    seller {
      name
      bank {
        name
        iban
        bic
      }
      address
      email
      taxInfo {
        ustid
      }
    }
    discounts {
      description
      title
      rate
    }
    sconto {
      days
      rate
    }
    tradeItems {
      title
      description
      unit
      amount
      optional
      netPricePerItem
      taxes {
        vat {
          id
          rate
          abbreviation
          name
        }
      }
    }
  }
}
    `;
export const useInvoiceQuery = <
      TData = InvoiceQuery,
      TError = unknown
    >(
      variables: InvoiceQueryVariables,
      options?: UseQueryOptions<InvoiceQuery, TError, TData>
    ) =>
    useQuery<InvoiceQuery, TError, TData>(
      ['invoice', variables],
      fetcher<InvoiceQuery, InvoiceQueryVariables>(InvoiceDocument, variables),
      options
    );
export const InvoicesDocument = `
    query invoices {
  invoices {
    invoiceRef
    subject
    description
    place
    greeting
    currency
    buyer {
      name
      address
    }
    seller {
      name
      bank {
        name
        iban
        bic
      }
      address
      email
      taxInfo {
        ustid
      }
    }
    discounts {
      description
      title
      rate
    }
    sconto {
      days
      rate
    }
    tradeItems {
      title
      description
      unit
      amount
      optional
      netPricePerItem
      taxes {
        vat {
          rate
          abbreviation
          name
        }
      }
    }
  }
}
    `;
export const useInvoicesQuery = <
      TData = InvoicesQuery,
      TError = unknown
    >(
      variables?: InvoicesQueryVariables,
      options?: UseQueryOptions<InvoicesQuery, TError, TData>
    ) =>
    useQuery<InvoicesQuery, TError, TData>(
      variables === undefined ? ['invoices'] : ['invoices', variables],
      fetcher<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, variables),
      options
    );
export const PdfOfInvoiceDocument = `
    query pdfOfInvoice($invoiceRef: String!) {
  pdfOfInvoice(invoiceRef: $invoiceRef)
}
    `;
export const usePdfOfInvoiceQuery = <
      TData = PdfOfInvoiceQuery,
      TError = unknown
    >(
      variables: PdfOfInvoiceQueryVariables,
      options?: UseQueryOptions<PdfOfInvoiceQuery, TError, TData>
    ) =>
    useQuery<PdfOfInvoiceQuery, TError, TData>(
      ['pdfOfInvoice', variables],
      fetcher<PdfOfInvoiceQuery, PdfOfInvoiceQueryVariables>(PdfOfInvoiceDocument, variables),
      options
    );
export const RemoveInvoiceDocument = `
    mutation removeInvoice($invoiceRef: String!) {
  removeInvoice(invoiceRef: $invoiceRef)
}
    `;
export const useRemoveInvoiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveInvoiceMutation, TError, RemoveInvoiceMutationVariables, TContext>) =>
    useMutation<RemoveInvoiceMutation, TError, RemoveInvoiceMutationVariables, TContext>(
      ['removeInvoice'],
      (variables?: RemoveInvoiceMutationVariables) => fetcher<RemoveInvoiceMutation, RemoveInvoiceMutationVariables>(RemoveInvoiceDocument, variables)(),
      options
    );
export const RenderInvoiceDocument = `
    mutation renderInvoice($invoiceRef: String!, $template: String!) {
  renderInvoice(invoiceRef: $invoiceRef, template: $template)
}
    `;
export const useRenderInvoiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RenderInvoiceMutation, TError, RenderInvoiceMutationVariables, TContext>) =>
    useMutation<RenderInvoiceMutation, TError, RenderInvoiceMutationVariables, TContext>(
      ['renderInvoice'],
      (variables?: RenderInvoiceMutationVariables) => fetcher<RenderInvoiceMutation, RenderInvoiceMutationVariables>(RenderInvoiceDocument, variables)(),
      options
    );
export const TemplatesDocument = `
    query templates {
  templates
}
    `;
export const useTemplatesQuery = <
      TData = TemplatesQuery,
      TError = unknown
    >(
      variables?: TemplatesQueryVariables,
      options?: UseQueryOptions<TemplatesQuery, TError, TData>
    ) =>
    useQuery<TemplatesQuery, TError, TData>(
      variables === undefined ? ['templates'] : ['templates', variables],
      fetcher<TemplatesQuery, TemplatesQueryVariables>(TemplatesDocument, variables),
      options
    );