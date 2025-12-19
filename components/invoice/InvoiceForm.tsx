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
import {InvoiceInput, useAddInvoiceMutation, useInvoiceQuery, useInvoiceFilesQuery} from "../generated/graphql";
import {invoiceUISchema} from "./invoiceUISchema";
import {Close} from "@mui/icons-material";
import {useQueryClient} from "react-query";

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
  const queryClient = useQueryClient()
  const { mutateAsync: saveAsync } = useAddInvoiceMutation({
    onSuccess: () => {
      // Invalidate invoiceFiles to refetch the updated list
      queryClient.invalidateQueries(['invoiceFiles'])
    }
  })
  const { data: invoiceFilesData, refetch: refetchInvoiceFiles } = useInvoiceFilesQuery()
  const [initialDataSet, setInitialDataSet] = useState(false);
  const [pendingInvoiceRef, setPendingInvoiceRef] = useState<string | null>(null);

  const handleClose = useCallback(() => back(), [back] )
  const handleSave = useCallback(async () => {
    const newInvoice = await saveAsync({ invoice: data as InvoiceInput})
    if (newInvoice?.addInvoice?.invoiceRef) {
      // Refetch invoiceFiles to get the newly created invoice file
      const { data: updatedData } = await refetchInvoiceFiles()
      const invoiceRef = newInvoice.addInvoice.invoiceRef
      const matchingInvoiceFile = updatedData?.invoiceFiles?.find(
        invoiceFile => invoiceFile?.invoice.invoiceRef === invoiceRef
      )
      if (matchingInvoiceFile?.fileName) {
        push('/invoice?' + (new URLSearchParams([['fileName', matchingInvoiceFile.fileName]])))
      } else {
        // Fallback: set pending and wait for data to update
        setPendingInvoiceRef(newInvoice.addInvoice.invoiceRef)
      }
    }
  }, [data, saveAsync, push, refetchInvoiceFiles] )

  // Watch for when the invoice appears in the list after save
  useEffect(() => {
    if (pendingInvoiceRef && invoiceFilesData?.invoiceFiles) {
      const matchingInvoiceFile = invoiceFilesData.invoiceFiles.find(
        invoiceFile => invoiceFile?.invoice.invoiceRef === pendingInvoiceRef
      )
      if (matchingInvoiceFile?.fileName) {
        setPendingInvoiceRef(null)
        push('/invoice?' + (new URLSearchParams([['fileName', matchingInvoiceFile.fileName]])))
      }
    }
  }, [pendingInvoiceRef, invoiceFilesData, push])

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
