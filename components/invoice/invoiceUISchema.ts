import {Scopable, UISchemaElement, VerticalLayout} from '@jsonforms/core'

import {jsonSchema2UISchemaElements, overrideScopes} from '../util/schema'
type ScopeFn = (s: string) => string
import {JsonSchema} from "@jsonforms/core";

export type UISchemaOverrides = (scopeFn: ScopeFn, schema: JsonSchema) => (UISchemaElement & Scopable)[]
export const applicationUIOverrides: UISchemaOverrides = (scopeFn, schema) => [
  { type: 'ListWithDetail',
    scope: scopeFn('tradeItems'),
    options: {
      elementLabelProp: ['title', 'amount'],
      detail: {
        type: 'VerticalLayout',
        elements: overrideScopes([], jsonSchema2UISchemaElements((schema as any)?.properties?.tradeItems?.items))
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
    type: 'Group',
    label: 'Buyer',
    scope: scopeFn('buyer'),
    elements: overrideScopes([{
      type: 'Control',
      scope: scopeFn('buyer/properties/address'),
      options: {
        multi: true
      }
    }], jsonSchema2UISchemaElements((schema as any)?.properties?.buyer, 'buyer/properties/'))
  },{
    type: 'Group',
    label: 'Seller',
    scope: scopeFn('seller'),
    elements: overrideScopes([{
        type: 'Control',
        scope: scopeFn('seller/properties/address'),
        options: {
          multi: true
        }
    }], jsonSchema2UISchemaElements((schema as any)?.properties?.seller, 'seller/properties/'))
  }
]
const scope = (s: string) => `#/properties/${s}`
export const invoiceUISchema: (schema?: JsonSchema) => VerticalLayout = (schema) => {
  // @ts-ignore
  //const schema = (await resolveInvoiceSchema())?.definitions?.Invoice
  console.log(schema)
  return ({
    type: 'VerticalLayout',
    elements: !schema ? [] : overrideScopes(applicationUIOverrides(scope, schema),
        jsonSchema2UISchemaElements(schema))

  });
}
