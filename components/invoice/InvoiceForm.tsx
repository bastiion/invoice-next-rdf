import {createAjv, JsonSchema} from "@jsonforms/core"
import {materialCells, materialRenderers} from "@jsonforms/material-renderers"
import {JsonForms} from "@jsonforms/react"
import {useCallback, useEffect, useState} from "react";
import schemaWithRefs from './invoice.json'
import JsonRefs from 'json-refs';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {ThemeProvider} from "@mui/system";
import {createTheme} from "@mui/material/styles";
import {useRouter} from "next/router";
import {InvoiceInput, useAddInvoiceMutation, useInvoiceQuery} from "../generated/graphql";

const theme = createTheme()

const refParserOptions = {
  dereference: {
    circular: false
  }
}

const ajv = createAjv({
  allErrors: true,
  verbose: true,
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
  const [initalDataSet, setInitalDataSet] = useState(false);

  const handleClose = useCallback(() => back(), [back] )
  const handleSave = useCallback(async () => {
    const newInvoice = await saveAsync({ invoice: data as InvoiceInput})
    newInvoice?.addInvoice?.invoiceRef && push('/invoice?' + (new URLSearchParams([['invoiceRef', newInvoice.addInvoice.invoiceRef]])))
  }, [data, saveAsync, push] )

  useEffect(() => {
    if(!open) setInitalDataSet(false)
  }, [open]);

  useEffect(() => {
    if(!initalDataSet) {
      setInitalDataSet(true)
      setData(initialData?.invoice || {})
    }
  }, [initialData, initalDataSet, setData, setInitalDataSet]);

  useEffect(() => {
    (pathname === '/invoiceCreate') ? setOpen(true) : setOpen(false)
  }, [pathname, setOpen]);

  useEffect(() => {
    JsonRefs.resolveRefs(schemaWithRefs).then(res => {
      setResolvedSchema(res.resolved);
    })
  }, []);

  return <ThemeProvider theme={theme}>
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create Invoice</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Create an invoice using the following form or alternatively by cloning an existing invoice
        </DialogContentText>
        <JsonForms
            schema={resolvedSchema?.definitions?.Invoice}
            data={data}
            renderers={defaultRenderers}
            cells={materialCells}
            onChange={({data}) => setData(data)}
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
