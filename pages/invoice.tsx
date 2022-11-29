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
import {Button, Icon, Label, Segment, Table} from "semantic-ui-react";
import invoices from "./invoices";
import React, {useCallback, useEffect, useState} from "react";
import {Avatar, AvatarGroup, Box, ListDivider, Sheet, Typography} from "@mui/joy";
import IconButton from "@mui/joy/IconButton";
import {Close, EditOutlined, HorizontalSplit} from "@mui/icons-material";
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

const staticServerURL = 'http://localhost:8001/'

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
  const handleRenderPdf = useCallback(
      async () => {
        selectedTemplateId && await renderAsync({ invoiceRef, template: selectedTemplateId})
      }, [invoiceRef, renderAsync, selectedTemplateId])

  const onEditComplete = useCallback(
      (tradeItems: TradeItem[]) => {
        setHasChanged(true)
        // @ts-ignore
        setEditableInvoice((prevState: InvoiceType | undefined) => {
          return prevState && {...prevState, tradeItems} })
      }, [setEditableInvoice, setHasChanged],
  );


  const pdfLink = pdfData?.pdfOfInvoice?.length && `${staticServerURL}${pdfData?.pdfOfInvoice}` || undefined
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
                level={'body1'}
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
          {pdfLink && <a href={pdfLink} target='_blank' rel="noreferrer">
            <Icon name='file pdf outline' size='huge'></Icon>
          </a>
          }
            <Button onClick={handleRenderPdf} disabled={!selectedTemplateId}>render</Button>
            <TemplateSelect templateId={selectedTemplateId} onChange={setSelectedTemplateId} />
            <Button onClick={handleRemove} color='red'>remove invoice</Button>
            {hasChanged && <Button onClick={handleSave} color='green'>save changes</Button>}

            {data.invoice.tradeItems && <TradeItemDataGrid tradeItems={data.invoice.tradeItems} onTradeItemsChange={onEditComplete} />}

          </Layout.Main>}
        <Sheet
            sx={{
              display: { xs: 'none', sm: 'initial' },
              borderLeft: '1px solid',
              borderColor: 'neutral.outlinedBorder',
              bgcolor: 'background.componentBg',
            }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ flex: 1 }}>{data?.invoice?.subject}</Typography>
            <IconButton variant="outlined"  size="sm">
              <Close />
            </IconButton>
          </Box>
          <ListDivider component="hr" />
          {imageSrc && <AspectRatio ratio={3/8}>
            <Image
                layout='fill'
                alt=""
                src={imageSrc}
            />
          </AspectRatio>}
          <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography level="body2" mr={1}>
              Shared with
            </Typography>
            <AvatarGroup size="sm" sx={{ '--Avatar-size': '24px' }}>
              <Avatar src="/static/images/avatar/1.jpg" />
            </AvatarGroup>
          </Box>
          <ListDivider component="hr" />
          <Box
              sx={{
                gap: 2,
                p: 2,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                '& > *:nth-child(odd)': { color: 'text.secondary' },
              }}
          >
            <Typography level="body2">Type</Typography>
            <Typography level="body2" textColor="text.primary">
              PDF
            </Typography>

            <Typography level="body2">Size</Typography>
            <Typography level="body2" textColor="text.primary">
              3,6 MB (3,258,385 bytes)
            </Typography>

            <Typography level="body2">Owner</Typography>
            <Typography level="body2" textColor="text.primary">
               Winzlieb
            </Typography>

            <Typography level="body2">Modified</Typography>
            <Typography level="body2" textColor="text.primary">
            </Typography>

            <Typography level="body2">Place</Typography>
            <Typography level="body2" textColor="text.primary">
              {data?.invoice?.place}
            </Typography>
          </Box>
          <ListDivider component="hr" />
          <Box
              sx={{
                gap: 2,
                p: 2,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                '& > *:nth-child(odd)': { color: 'text.secondary' },
              }}
          >
            <Typography level="body2">net price</Typography>
            <Typography level="body2" textColor="text.primary">
              {invoiceCalculated?.total.netGrandTotal}
            </Typography>

            <Typography level="body2">total</Typography>
            <Typography level="body2" textColor="text.primary">
              {invoiceCalculated?.total.grossGrandTotal}
            </Typography>

            <Typography level="body2">tax</Typography>
            <Typography level="body2" textColor="text.primary">
              {invoiceCalculated?.taxes.map(({name, total}) =>  `${name}: ${total} ${invoiceCalculated?.currency || 'Taler'}` ).join(',')}
            </Typography>
          </Box>
          <ListDivider component="hr" />
          <Box sx={{ py: 2, px: 1 }}>
            <Button variant="plain" size="medium" endIcon={<EditOutlined />}>
              Add a description
            </Button>
          </Box>
        </Sheet>
      </>
  )
}

export default Invoice
