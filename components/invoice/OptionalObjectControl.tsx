import {
  ControlProps,
  JsonSchema,
  RankedTester,
  rankWith,
  schemaMatches,
  and,
  isObjectControl,
} from '@jsonforms/core';
import { ResolvedJsonFormsDispatch, withJsonFormsControlProps } from '@jsonforms/react';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useMemo } from 'react';

/**
 * Tester for optional object controls.
 * Checks if the schema is an object that can be undefined (has anyOf with a single object reference).
 */
export const optionalObjectControlTester: RankedTester = rankWith(
  3,
  and(
    (uischema,_schema, context) => {
      if(_schema?.title !== 'TradeItem_taxes') {
        return true;
      }
      console.log("OptionalObjectControl: uischema received:", uischema);
      console.log("OptionalObjectControl: schema received:", _schema);
      console.log("OptionalObjectControl: context received:", context);
      //get schema from uischema.scope and 
      return true;
    },
    schemaMatches((schema) => {
      // Check if schema has anyOf that includes a null type and an object type or $ref
      if (schema.anyOf && Array.isArray(schema.anyOf)) {
        const hasNull = schema.anyOf.some(
          (item) =>
            (item as JsonSchema).type === 'null'
        );
        const hasObjectOrRef = schema.anyOf.some(
          (item) =>
            (item as JsonSchema).type === 'object' ||
            (item as JsonSchema).$ref !== undefined
        );
        return hasNull && hasObjectOrRef;
      }
      return false;
    })
  )
);

interface OptionalObjectControlProps extends ControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  schema: JsonSchema;
  uischema: any;
}

/**
 * Custom renderer for optional object fields.
 * Shows a checkbox to enable/disable the object, and conditionally renders the nested form.
 */
const OptionalObjectControl = ({
  data,
  handleChange,
  path,
  schema,
  uischema,
  label,
}: OptionalObjectControlProps) => {
  // Determine if the object is currently enabled (exists and is not undefined/null)
  // An empty object {} is considered enabled (checked)
  const isEnabled = useMemo(() => {
    return data !== undefined && data !== null && typeof data === 'object';
  }, [data]);

  // Get the label from UI schema options or use the default label
  const checkboxLabel = useMemo(() => {
    return (uischema?.options?.label as string) || label || 'Enable';
  }, [uischema?.options?.label, label]);

  // Get the actual object schema from anyOf
  // Note: The schema resolution will be handled by ResolvedJsonFormsDispatch
  const objectSchema = useMemo(() => {
    if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length === 1) {
      return schema.anyOf[0] as JsonSchema;
    }
    return schema;
  }, [schema]);

  // Handle checkbox change
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      // Initialize with empty object
      handleChange(path, {});
    } else {
      // Set to undefined
      handleChange(path, undefined);
    }
  };

  // Create a nested UI schema for the object
  const nestedUISchema = useMemo(() => {
    if (!uischema) return undefined;
    
    // If there's a detail option, use it; otherwise create a simple layout
    if (uischema.options?.detail) {
      return uischema.options.detail;
    }
    
    // Create a simple VerticalLayout for the nested object
    // The scopes are relative to the current path, so we use #/properties/...
    // JSON Forms will resolve them relative to the path provided to ResolvedJsonFormsDispatch
    const properties = (objectSchema as JsonSchema).properties || {};
    return {
      type: 'VerticalLayout',
      elements: Object.keys(properties).map((key) => ({
        type: 'Control',
        scope: `#/properties/${key}`,
      })),
    };
  }, [uischema, objectSchema]);

  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={isEnabled}
            onChange={handleCheckboxChange}
          />
        }
        label={<Typography variant="body1">{checkboxLabel}</Typography>}
      />
      {isEnabled && nestedUISchema && (
        <Box sx={{ ml: 3, mt: 1 }}>
          <ResolvedJsonFormsDispatch
            schema={objectSchema}
            uischema={nestedUISchema}
            path={path}
            enabled={true}
          />
        </Box>
      )}
    </Box>
  );
};

export default withJsonFormsControlProps(OptionalObjectControl);

