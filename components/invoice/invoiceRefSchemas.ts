import dayjs from 'dayjs';
import { FunctionMappedString, MappedString, IdBuilderSchema } from './invoiceRefSchema';
import { Invoice } from '../generated/graphql';

export const nowDateFunction: FunctionMappedString = {
  title: 'Current date in YYYYMMDD format',
  callback: () => dayjs().format('YYYYMMDD'),
};

export const customerRef: MappedString = {
  title: 'Customer ID (clientRef)',
  path: 'clientRef',
  default: '00',
};

export const defaultSchema: IdBuilderSchema = {
  title: 'Default Schema',
  concatenate: [nowDateFunction, customerRef],
};

export const commonSchema: IdBuilderSchema = {
  title: 'Common Schema',
  concatenate: [nowDateFunction, customerRef],
};

export const availableSchemas: Array<IdBuilderSchema & { id: string; isDefault: boolean }> = [
  { ...defaultSchema, id: 'default', isDefault: true },
  { ...commonSchema, id: 'common', isDefault: false },
];

export const getDefaultSchema = (): IdBuilderSchema => {
  const defaultSchemaEntry = availableSchemas.find((s) => s.isDefault);
  if (defaultSchemaEntry) {
    const { id, isDefault, ...schema } = defaultSchemaEntry;
    return schema;
  }
  return defaultSchema;
};

