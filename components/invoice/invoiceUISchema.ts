import {Scopable, UISchemaElement, VerticalLayout} from '@jsonforms/core'

import {jsonSchema2UISchemaElements, overrideScopes} from '../util/schema'
type ScopeFn = (s: string) => string
import {JsonSchema} from "@jsonforms/core";

const vatTaxDetail: UISchemaElement = {
  type: 'VerticalLayout',
  elements: [
    {type: 'Control', scope: '#/properties/id'},
    {type: 'Control', scope: '#/properties/abbreviation'},
    {type: 'Control', scope: '#/properties/name'},
    {type: 'Control', scope: '#/properties/rate'},
  ],
};

const tradeItemTaxesDetail: UISchemaElement = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/vat',
      options: {detail: vatTaxDetail},
    },
  ],
};

export type UISchemaOverrides = (scopeFn: ScopeFn, schema: JsonSchema) => (UISchemaElement & Scopable)[]
export const applicationUIOverrides: UISchemaOverrides = (scopeFn, schema) => [
  { type: 'Control',
    scope: scopeFn('tradeItems'),
    options: {
      elementLabelProp: 'title',
      showSortButtons: true,
      detail: {
        type: 'VerticalLayout',
        elements: overrideScopes([
          {
            type: 'Control',
            scope: '#/properties/taxes',
            options: {detail: tradeItemTaxesDetail},
          },
        ], jsonSchema2UISchemaElements((schema as any)?.definitions?.TradeItem))
      }
    }
  },{
    type: 'Control',
    scope: scopeFn('description'),
    options: {
      multi: true
    }
  },
  {
    type: 'Control',
    scope: scopeFn('seller'),
    options: {
      detail: {
        type: 'Group',
        elements: overrideScopes([{
          type: 'Control',
          scope: scopeFn('address'),
          options: {
            multi: true
          }
        }], jsonSchema2UISchemaElements((schema as any)?.definitions?.Seller))
      }
    }
  },
  {
    type: 'Control',
    scope: scopeFn('buyer'),
    options: {
      detail: {
        type: 'Group',
        elements: overrideScopes([{
          type: 'Control',
          scope: scopeFn('address'),
          options: {
            multi: true
          }
        }], jsonSchema2UISchemaElements((schema as any)?.definitions?.Buyer))
      }
    }
  }
]
const scope = (s: string) => `#/properties/${s}`
export const invoiceUISchema: (schema?: JsonSchema) => VerticalLayout = (schema) => {
  // @ts-ignore
  //const schema = (await resolveInvoiceSchema())?.definitions?.Invoice
  return ({
    type: 'VerticalLayout',
    elements: !schema ? [] : overrideScopes(applicationUIOverrides(scope, schema),
        jsonSchema2UISchemaElements(schema))

  });
}
