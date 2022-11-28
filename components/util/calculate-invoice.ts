import {
  CalculatedDiscount,
  CalculatedInvoice,
  CalculatedSconto,
  CalculatedTax,
  CalculatedTradeItem,
  Invoice,
  TradeItem,
} from './types/invoice';

const BASE = 100;
const decimalDelim = ',';

const priceToString = (price: number) => {
  const priceString = Math.round(price * BASE).toString();
  if (priceString.length > 2) {
    return [
      priceString.substring(0, priceString.length - 2),
      priceString.substring(priceString.length - 2),
    ].join(decimalDelim);
  }
  return ['0', priceString].join(decimalDelim);
};
const taxRateToString = (taxRate: number) => taxRate.toString();
const amountToString = (amount: number) => amount.toString();

const calculateNetPrice = ({ netPricePerItem, amount }: TradeItem) =>
  amount * netPricePerItem;
const calculateTax = (price: number, taxRate: number) =>
  (taxRate / 100) * price;

const calculateItem: (item: TradeItem) => CalculatedTradeItem = (
  item: TradeItem,
) => {
  const netPrice = calculateNetPrice(item);
  const vat = item.taxes?.vat;
  const vatCalculated: CalculatedTax | undefined = vat
    ? {
        ...vat,
        rate: taxRateToString(vat.rate),
        total: priceToString(calculateTax(netPrice, vat.rate)),
        totalNumber: calculateTax(netPrice, vat.rate),
      }
    : undefined;

  return {
    ...item,
    netPricePerItem: priceToString(item.netPricePerItem),
    netPriceNumber: netPrice,
    amount: amountToString(item.amount),
    netPrice: priceToString(netPrice),
    grossPrice: priceToString(netPrice + (vatCalculated?.totalNumber || 0)),
    taxes: { vat: vatCalculated },
  };
};

const totalTaxes = (items: CalculatedTradeItem[]) => {
  const taxMap: Map<string, CalculatedTax> = new Map();
  for (const item of items) {
    const taxes = item.taxes;
    for (const taxKey of Object.keys(taxes)) {
      // @ts-ignore
      const tax = taxes[taxKey] as CalculatedTax;
      if(!tax) continue
      const taxUnique = tax.id + tax.rate;
      const oldTax = taxMap.get(taxUnique);
      if (oldTax) {
        const totalNumber = oldTax.totalNumber + tax.totalNumber;
        taxMap.set(taxUnique, {
          ...oldTax,
          totalNumber,
          total: priceToString(totalNumber),
        });
      } else {
        taxMap.set(taxUnique, tax);
      }
    }
  }
  return [... Array.from(taxMap.values())];
};

const sum = (a: number, b: number) => a + b;

const calculateInvoice: (invoice: Invoice) => CalculatedInvoice = (
  invoice: Invoice,
) => {
  const { discounts, sconto, ...invoicePart } = invoice;
  const calculatedItems = invoice.tradeItems.map(calculateItem);
  const calculatedTaxesBeforeDiscount = calculatedItems
    .map(({ taxes }) => taxes?.vat?.totalNumber || 0)
    .reduce(sum, 0);
  const netPriceTotalBeforeDiscount = calculatedItems
    .map(({ netPriceNumber }) => netPriceNumber)
    .reduce(sum, 0);
  const calculatedDiscounts: CalculatedDiscount[] = (discounts || []).map(
    (discount) => {
      const netPriceNumber =
        netPriceTotalBeforeDiscount * (discount.rate / 100);
      const taxPriceNumber =
        calculatedTaxesBeforeDiscount * (discount.rate / 100);
      return {
        ...discount,
        netPriceNumber,
        taxPriceNumber,
        netPrice: priceToString(netPriceNumber),
        taxPrice: priceToString(taxPriceNumber),
      };
    },
  );

  const netPriceTotal =
    netPriceTotalBeforeDiscount +
    calculatedDiscounts
      .map(({ netPriceNumber }) => netPriceNumber)
      .reduce(sum, 0);

  const calculatedTaxes =
    calculatedTaxesBeforeDiscount +
    calculatedDiscounts
      .map(({ taxPriceNumber }) => taxPriceNumber)
      .reduce(sum, 0);

  const taxTotalsBeforeDiscount = totalTaxes(calculatedItems);
  const taxes = taxTotalsBeforeDiscount.map((taxTotal) => {
    const totalNumber = discounts?.length
      ? discounts
          .map(
            (d) => taxTotal.totalNumber + taxTotal.totalNumber * (d.rate / 100),
          )
          .reduce(sum, 0)
      : taxTotal.totalNumber;

    return {
      ...taxTotal,
      totalNumber,
      total: priceToString(totalNumber),
    };
  });

  const optionalCalculatedItems = calculatedItems.filter(
    ({ optional }) => optional,
  );

  const calculatedTaxesOfOptionalItems = optionalCalculatedItems
    .map(({ taxes }) => taxes?.vat?.totalNumber || 0)
    .reduce(sum, 0);

  const netPriceTotalOfOptionalItems = optionalCalculatedItems
    .map(({ netPriceNumber }) => netPriceNumber)
    .reduce(sum, 0);

  const grossOptionalTotalNumber =
    netPriceTotalOfOptionalItems + calculatedTaxesOfOptionalItems;
  const grossTotalNumber = netPriceTotal + calculatedTaxes;

  const calculatedSconto: CalculatedSconto[] = (sconto || []).map((sconto) => {
    const priceNumber =
      grossTotalNumber - grossTotalNumber * (sconto.rate / 100);
    return {
      ...sconto,
      priceNumber,
      price: priceToString(priceNumber),
    };
  });

  return {
    ...invoicePart,
    total: {
      grossGrandTotal: priceToString(grossTotalNumber),
      netGrandTotal: priceToString(netPriceTotal),
    },
    ...(netPriceTotalOfOptionalItems > 0
      ? {
          totalOfOptionals: {
            grossGrandTotal: priceToString(grossOptionalTotalNumber),
            netGrandTotal: priceToString(netPriceTotalOfOptionalItems),
          },
        }
      : {}),
    taxes,
    tradeItems: calculatedItems,
    ...(invoice.discounts ? { discounts: calculatedDiscounts } : {}),
    ...(invoice.sconto ? { sconto: calculatedSconto } : {}),
  };
};

export default calculateInvoice;
