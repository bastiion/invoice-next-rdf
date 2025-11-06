import type { NextPage } from 'next'
import Head from 'next/head'
import {
  Buyer,
  Seller,
  TradeItem, useAddInvoiceMutation,
  useInvoiceQuery,
  usePdfOfInvoiceQuery, useRemoveInvoiceMutation,
  useRenderInvoiceMutation
} from "../components/generated/graphql";
import {useRouter} from "next/router";
import {Button, Label, Segment, Table} from "semantic-ui-react";
import React, {useCallback, useEffect, useState} from "react";
import {Box, ListDivider, Sheet, Typography, Button as JoyButton, Checkbox} from "@mui/joy";
import IconButton from "@mui/joy/IconButton";
import {Close, PictureAsPdf, Delete, Save, Refresh} from "@mui/icons-material";
import AspectRatio from "@mui/joy/AspectRatio";
import Layout from '../components/layout/Layout';
import {useQueryClient} from "react-query";
import {CalculatedInvoice} from "../components/util/types/invoice";
import calculateInvoice from "../components/util/calculate-invoice";
import type { Invoice as InvoiceType } from '../components/util/types/invoice'
import {Grid} from "@mui/material";
import Image from "next/image";
import {TradeItemDataGrid} from "../components/invoice/TradeItemDataGrid";
import { TemplateSelect } from '../components/invoice/TemplateSelect';
import config from '../components/config';


const SellerSegement = ({seller}: { seller: Seller}) => {
  return <Segment>
    <h2>{seller.name}</h2>
    <p>{seller.address.split('\n').map(t =>  <>{t}<br/></> )}</p>
  </Segment>
}
const BuyerSegment = ({buyer}: { buyer: Buyer}) => {
  return <Segment>
    <h2>{buyer.name}</h2>
    <p>{buyer.address.split('\n').map(t =>  <>{t}<br/></> )}</p>
  </Segment>
}

const TradeitemsTable = ({tradeItems}: {tradeItems: TradeItem[]}) => {
  return <Table celled>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>title</Table.HeaderCell>
        <Table.HeaderCell>description</Table.HeaderCell>
        <Table.HeaderCell>amount</Table.HeaderCell>
        <Table.HeaderCell>unit</Table.HeaderCell>
        <Table.HeaderCell>net price per item</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {tradeItems.map(({title, description, unit, amount, netPricePerItem, optional}) => {
        return <Table.Row key={title + description}>
          <Table.Cell>
            <Label ribbon>{title}</Label>
          </Table.Cell>
          <Table.Cell>{description}</Table.Cell>
          <Table.Cell>{amount}</Table.Cell>
          <Table.Cell>{unit}</Table.Cell>
          <Table.Cell>{netPricePerItem}</Table.Cell>
        </Table.Row>
      })}
    </Table.Body>

  </Table>
}

const Invoice: NextPage = () => {
  const { query, push } = useRouter()
  const invoiceRef = query.invoiceRef as string
  const enabled = Boolean(invoiceRef)
  const { data } = useInvoiceQuery({ invoiceRef }, { enabled })
  const [editableInvoice, setEditableInvoice] = useState<InvoiceType | undefined>();
  const [enableZugferd, setEnableZugferd] = useState(false);
  const { data: pdfData } = usePdfOfInvoiceQuery({ invoiceRef }, { enabled })
  const title = `Rechnung: ${data?.invoice?.subject}`
  const queryClient = useQueryClient()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const { mutateAsync: saveAsync } = useAddInvoiceMutation()
  const { mutateAsync: renderAsync } = useRenderInvoiceMutation({
    onSuccess: () => {
      [ ['invoice', {'invoiceRef': invoiceRef}],
        ['pdfOfInvoice', {'invoiceRef': invoiceRef}]
      ].forEach( qK => queryClient.invalidateQueries(qK))
    }
  })
  const { mutateAsync: removeAsync } = useRemoveInvoiceMutation({
    onSuccess: () => {
      [['invoices' ]].forEach( qK => queryClient.invalidateQueries(qK))
    }
  })
  const [hasChanged, setHasChanged] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);

  const [invoiceCalculated, setInvoiceCalculated] = useState<CalculatedInvoice | undefined>();
  useEffect(() => {
    if(editableInvoice) {
      // @ts-ignore
      setInvoiceCalculated(calculateInvoice(editableInvoice))
    }
  }, [editableInvoice, setInvoiceCalculated])
  useEffect(() => {
    if(data?.invoice) {
      // @ts-ignore
      setEditableInvoice(data?.invoice)
    }
  }, [data, setEditableInvoice])



  const handleSave = useCallback(
      async () => {
        await saveAsync({invoice: editableInvoice})
        setHasChanged(false)
      }, [saveAsync, editableInvoice],)

  const handleRemove = useCallback(
      async () => {
        await removeAsync({ invoiceRef })
        push('/')
      }, [invoiceRef, removeAsync, push])
      
  const handleRemoveClick = useCallback(() => {
    setShowRemoveConfirmation(true)
  }, [])
  
  const handleRemoveConfirm = useCallback(() => {
    handleRemove()
    setShowRemoveConfirmation(false)
  }, [handleRemove])
  
  const handleRemoveCancel = useCallback(() => {
    setShowRemoveConfirmation(false)
  }, [])
  
  const handleRenderPdf = useCallback(
      async () => {
        selectedTemplateId && await renderAsync({ invoiceRef, template: selectedTemplateId, enableZugferd})
      }, [invoiceRef, renderAsync, selectedTemplateId, enableZugferd])

  const onEditComplete = useCallback(
      (tradeItems: TradeItem[]) => {
        setHasChanged(true)
        // @ts-ignore
        setEditableInvoice((prevState: InvoiceType | undefined) => {
          return prevState && {...prevState, tradeItems} })
      }, [setEditableInvoice, setHasChanged],
  );


  const pdfLink = pdfData?.pdfOfInvoice?.length && `${config.staticContentURL}/${pdfData?.pdfOfInvoice}` || undefined
  const imageSrc = pdfLink?.replace('.pdf', '.png')
  return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content="Invoice and order management" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {data?.invoice &&
          <Layout.Main>
            <Box
                sx={{
                  p: 2,
                  pb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
            >
              <Typography
                  level={'h2'}
                  textColor="text.tertiary"
                  textTransform="uppercase"
                  letterSpacing="md"
                  fontWeight="lg"
              >
                {title}
              </Typography>
              <Button
                  onClick={() => push('/invoiceCreate?' + (new URLSearchParams([['cloneInvoiceRef', data?.invoice?.invoiceRef || '']])).toString())}
                  size="medium"
                  variant="plain"
                  sx={{ fontSize: 'xs', px: 1 }}>
                 clone invoice
              </Button>
            </Box>
            <Typography
                level={'body-md'}
                textColor="text.secondary"
            >
              {data.invoice.description.split('\n').map(t => (<>{t}<br /></>))}
            </Typography>

            <Grid container
                  spacing={2}
                  sx={{ pt: 2 }}>
              <Grid item xs={6}>
                <BuyerSegment buyer={data.invoice.buyer} />
              </Grid>
              <Grid item xs={6}>
              <SellerSegement seller={data.invoice.seller} />
              </Grid>
            </Grid>
          <TradeitemsTable tradeItems={data.invoice.tradeItems} />


            <Box sx={{ mt: 2 }}>
                  <Typography level="h3">
                    Technical Table
                  </Typography>
                <Box sx={{ mt: 2 }}>
                  {data.invoice.tradeItems && <TradeItemDataGrid tradeItems={data.invoice.tradeItems} onTradeItemsChange={onEditComplete} />}
                </Box>
            </Box>
          </Layout.Main>}
        <Sheet
            sx={{
              display: { xs: 'none', sm: 'initial' },
              borderLeft: '1px solid',
              borderColor: 'neutral.outlinedBorder',
              bgcolor: 'background.componentBg',
              width: '320px',
              overflow: 'auto'
            }}
        >
          {/* Header */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography level="h4" sx={{ flex: 1, fontWeight: 'lg' }}>
              {data?.invoice?.subject}
            </Typography>
            <IconButton variant="outlined" size="sm">
              <Close />
            </IconButton>
          </Box>

          {/* PDF Preview */}
          {imageSrc && (
            <Box sx={{ p: 2 }}>
              <AspectRatio ratio={3/4} sx={{ borderRadius: 'sm', overflow: 'hidden' }}>
                <Image
                  layout='fill'
                  alt="Invoice PDF Preview"
                  src={imageSrc}
                />
              </AspectRatio>
            </Box>
          )}

          {/* PDF Actions */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pdfLink && (
                <JoyButton
                  component="a"
                  href={pdfLink}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  fullWidth
                >
                  <PictureAsPdf sx={{ mr: 1 }} />
                  View PDF
                </JoyButton>
              )}
              
              <Box>
                <Box sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'md' }}>
                    Template Selection
                  </Typography>
                  <TemplateSelect templateId={selectedTemplateId} onChange={setSelectedTemplateId} />
                </Box>
                <Checkbox
                  label="Enable ZUGFeRD"
                  checked={enableZugferd}
                  onChange={(e) => setEnableZugferd(e.target.checked)}
                />
                <JoyButton
                  onClick={handleRenderPdf}
                  disabled={!selectedTemplateId}
                  variant="soft"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  <Refresh sx={{ mr: 1 }} />
                  Render PDF
                </JoyButton>
              </Box>
            </Box>
          </Box>

          <ListDivider component="hr" />

          {/* Invoice Details */}
          <Box sx={{ p: 2 }}>
            <Typography level="h4" sx={{ mb: 2, fontWeight: 'lg' }}>
              Invoice Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="body-sm" textColor="text.secondary">Place</Typography>
                <Typography level="body-sm">{data?.invoice?.place}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="body-sm" textColor="text.secondary">Owner</Typography>
                <Typography level="body-sm">Winzlieb</Typography>
              </Box>
            </Box>
          </Box>

          <ListDivider component="hr" />

          {/* Financial Summary */}
          <Box sx={{ p: 2 }}>
            <Typography level="h4" sx={{ mb: 2, fontWeight: 'lg' }}>
              Financial Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="body-sm" textColor="text.secondary">Net Price</Typography>
                <Typography level="body-sm" fontWeight="md">
                  {invoiceCalculated?.total.netGrandTotal}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="body-sm" textColor="text.secondary">Total</Typography>
                <Typography level="body-sm" fontWeight="md">
                  {invoiceCalculated?.total.grossGrandTotal}
                </Typography>
              </Box>
              
              <Box>
                <Typography level="body-sm" textColor="text.secondary" sx={{ mb: 0.5 }}>
                  Taxes
                </Typography>
                <Typography level="body-sm">
                  {invoiceCalculated?.taxes.map(({name, total}) => 
                    `${name}: ${total} ${invoiceCalculated?.currency || 'Taler'}`
                  ).join(', ')}
                </Typography>
              </Box>
            </Box>
          </Box>

          <ListDivider component="hr" />

          {/* Actions */}
          <Box sx={{ p: 2 }}>
            <Typography level="h4" sx={{ mb: 2, fontWeight: 'lg' }}>
              Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {hasChanged && (
                <JoyButton
                  onClick={handleSave}
                  color="success"
                  variant="soft"
                  fullWidth
                >
                  <Save sx={{ mr: 1 }} />
                  Save Changes
                </JoyButton>
              )}
              
              <JoyButton
                onClick={handleRemoveClick}
                color="danger"
                variant="outlined"
                fullWidth
              >
                <Delete sx={{ mr: 1 }} />
                Remove Invoice
              </JoyButton>
            </Box>
          </Box>
        </Sheet>
        
      </>
  )
}

export default Invoice
