import {JsonSchema} from "@jsonforms/core"
import {materialCells, materialRenderers} from "@jsonforms/material-renderers"
import {JsonForms} from "@jsonforms/react"
import {useCallback, useEffect, useMemo, useState} from "react";
import {useTranslations} from 'next-intl';
import schemaWithRefs from './invoice.json'
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton} from "@mui/material";
import {ThemeProvider} from "@mui/system";
import {createTheme} from "@mui/material/styles";
import {InvoiceInput} from "../generated/graphql";
import {invoiceUISchema} from "./invoiceUISchema";
import {normalizeInvoiceTaxes, toInvoiceInput} from "../util/normalize-invoice-taxes";
import {Close} from "@mui/icons-material";
import NiceModal, {useModal} from "@ebay/nice-modal-react";

const theme = createTheme()

const defaultRenderers = [
  ...materialRenderers
]

// Global Set to track untranslated strings
const untranslatedStrings: Map<string, string> = new Map();


const createTranslator = (locale: string, t: ReturnType<typeof useTranslations>) =>
  (key: string, defaultMessage?: string) => {
    try {
      const translated = t(key);
      return translated;
    } catch (error) {
      const fallback = defaultMessage ?? key;
      untranslatedStrings.set(key, fallback);
      console.log(`Locale: ${locale}, Key: ${key}, Default Message: ${defaultMessage}`);
      return fallback;
    }
  };


interface InvoiceFormProps {
  initialInvoice?: InvoiceInput;
}

const clearNullOrEmpty = (input: any): any => {
  if (Array.isArray(input)) {
    // Recursively clean each element in the array
    const cleaned = input
      .map(clearNullOrEmpty)
      .filter((item) => item !== undefined && item !== null);
    return cleaned.length > 0 ? cleaned : undefined;
  } else if (input !== null && typeof input === 'object') {
    // Recursively clean object fields
    const entries = Object.entries(input)
      .map(([key, value]) => [key, clearNullOrEmpty(value)])
      .filter(([_, value]) => value !== undefined && value !== null);
    if (entries.length === 0) return undefined;
    return Object.fromEntries(entries);
  }
  // Return value only if not undefined and not null
  return input !== undefined && input !== null ? input : undefined;
};


const InvoiceForm = NiceModal.create<InvoiceFormProps>(({ initialInvoice }) => {
  const modal = useModal();
  const t = useTranslations('JsonForms');
  const [data, setData] = useState<any>(
    initialInvoice ? normalizeInvoiceTaxes(initialInvoice) : {}
  );
  const [locale, setLocale] = useState<'de' | 'en'>('de');
  const translation = useMemo(() => createTranslator(locale, t), [locale, t]);

  const handleClose = useCallback(() => {
    modal.resolve(null);
    modal.hide();
  }, [modal]);

  useEffect(() => {
    if (initialInvoice) {
      setData(normalizeInvoiceTaxes(initialInvoice));
    }
  }, [initialInvoice]);

  const handleSave = useCallback(() => {
    modal.resolve(toInvoiceInput(data));
    modal.hide();
  }, [data, modal]);

  const schema = useMemo<JsonSchema>(() => ({
    ...schemaWithRefs?.definitions?.Invoice,
    // @ts-ignore
    definitions: schemaWithRefs?.definitions as Record<string, JsonSchema>
  }), [schemaWithRefs])

  const handleDataChange = useCallback(({data}) => setData(data), [setData])
  
  const uischema = useMemo(() => invoiceUISchema(schema), [schema])
  
  return <ThemeProvider theme={theme}>
    <Dialog open={modal.visible} onClose={handleClose} maxWidth={'lg'} fullWidth>
      <DialogTitle>{initialInvoice ? 'Edit Invoice' : 'Create Invoice'}
        <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Edit or create an invoice using the following form.
        </DialogContentText>
        <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={defaultRenderers}
            cells={materialCells}
            onChange={handleDataChange}
            i18n={{locale: locale, translate: translation}}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  </ThemeProvider>
});

export default InvoiceForm
