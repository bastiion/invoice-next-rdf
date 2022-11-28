import {JsonSchema} from "@jsonforms/core"
import {materialCells, materialRenderers} from "@jsonforms/material-renderers"
import {JsonForms} from "@jsonforms/react"
import {useCallback, useEffect, useState} from "react";
import schemaWithRefs from './invoice.json'
import JsonRefs from 'json-refs';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton} from "@mui/material";
import {ThemeProvider} from "@mui/system";
import {createTheme} from "@mui/material/styles";
import {useRouter} from "next/router";
import {InvoiceInput, useAddInvoiceMutation, useInvoiceQuery} from "../generated/graphql";
import {invoiceUISchema} from "./invoiceUISchema";
import {Close} from "@mui/icons-material";

const theme = createTheme()

export const resolveInvoiceSchema = async () =>
    await JsonRefs.resolveRefs(schemaWithRefs).then(res => {
      return res.resolved;
    })

const defaultRenderers = [
  ...materialRenderers]
const InvoiceForm = () => {
  const { query, push, back } = useRouter()
  const cloneInvoiceRef = query.cloneInvoiceRef as string
  const enabled = Boolean(cloneInvoiceRef)
  const { data: initialData } = useInvoiceQuery({ invoiceRef: cloneInvoiceRef }, { enabled })
  const [data, setData] = useState<any>(initialData?.invoice)
  const [open, setOpen] = useState(false);
  const [resolvedSchema, setResolvedSchema] = useState<JsonSchema | undefined>()
  const { pathname } = useRouter()
  const { mutateAsync: saveAsync } = useAddInvoiceMutation()
  const [initialDataSet, setInitialDataSet] = useState(false);

  const handleClose = useCallback(() => back(), [back] )
  const handleSave = useCallback(async () => {
    const newInvoice = await saveAsync({ invoice: data as InvoiceInput})
    newInvoice?.addInvoice?.invoiceRef && push('/invoice?' + (new URLSearchParams([['invoiceRef', newInvoice.addInvoice.invoiceRef]])))
  }, [data, saveAsync, push] )

  useEffect(() => {
    setInitialDataSet(false)
  }, [open]);

  useEffect(() => {
    if(!initialDataSet ) {
      if(!cloneInvoiceRef) {
        setInitialDataSet(true)
        setData({})
      } else if(initialData) {
        setInitialDataSet(true)
        setData(initialData?.invoice)
      }
    }
  }, [initialData, cloneInvoiceRef, initialDataSet, setData, setInitialDataSet]);

  useEffect(() => {
    (pathname === '/invoiceCreate') ? setOpen(true) : setOpen(false)
  }, [pathname, setOpen]);

  useEffect(() => {
    resolveInvoiceSchema().then(res => {
      setResolvedSchema(res);
    })
  }, []);

  const schema = resolvedSchema?.definitions?.Invoice as JsonSchema
  const uischema = invoiceUISchema(schema)
  console.log(uischema)
  return <ThemeProvider theme={theme}>
    <Dialog open={open} onClose={handleClose} maxWidth={'lg'} fullWidth>
      <DialogTitle>Create Invoice
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
          Create an invoice using the following form or alternatively by cloning an existing invoice
        </DialogContentText>
        <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={defaultRenderers}
            cells={materialCells}
            onChange={initialDataSet ? ({data}) => setData(data) : () => {}}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  </ThemeProvider>
}

export default InvoiceForm
