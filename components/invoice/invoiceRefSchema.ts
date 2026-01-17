import get from 'lodash.get';
import { Invoice } from '../generated/graphql';

export type MappedString = {
  path: string;
  default: string;
  title: string;
};

export type FunctionMappedString = {
  title: string;
  callback: (oldInvoice?: Invoice) => string;
};

export type IdBuilderBlock = MappedString | FunctionMappedString | string;

export type IdBuilderSchema = {
  title: string;
  concatenate: IdBuilderBlock[];
};

/**
 * Builds an invoiceRef string from a schema and optional old invoice data
 */
export function buildInvoiceRef(schema: IdBuilderSchema, oldInvoice?: Invoice): string {
  return schema.concatenate
    .map((block) => {
      if (typeof block === 'string') {
        return block;
      } else if ('callback' in block) {
        // FunctionMappedString
        return block.callback(oldInvoice);
      } else {
        // MappedString
        const value = oldInvoice ? get(oldInvoice, block.path) : undefined;
        return value != null ? String(value) : block.default;
      }
    })
    .join('');
}

/**
 * Generates a human-readable description of a schema
 */
export function describeSchema(schema: IdBuilderSchema): string {
  const parts: string[] = [schema.title];
  
  schema.concatenate.forEach((block, index) => {
    if (typeof block === 'string') {
      parts.push(`  ${index + 1}. Literal: "${block}"`);
    } else if ('callback' in block) {
      parts.push(`  ${index + 1}. ${block.title}`);
    } else {
      parts.push(`  ${index + 1}. ${block.title} (path: ${block.path}, default: "${block.default}")`);
    }
  });
  
  return parts.join('\n');
}

