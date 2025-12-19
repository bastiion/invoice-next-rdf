import type { NextPage } from 'next'
import Head from 'next/head'
import {useInvoiceFilesQuery} from "../components/generated/graphql";
import {List} from "semantic-ui-react";
import {useRouter} from "next/router";
import Layout from "../components/layout/Layout";
import React from "react";


const Invoices: NextPage = () => {
  const { push } = useRouter()
  const { data } = useInvoiceFilesQuery()
  return (
      <>
        <Head>
          <title>All Invoices</title>
          <meta name="description" content="Invoice and order management" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Layout.Main>
          <h1>Invoices</h1>
          <List divided relaxed>
            {data?.invoiceFiles?.map(invoiceFile => {
              return invoiceFile && (
                  <List.Item key={invoiceFile.fileName}>
                    <List.Icon name='file' size='large' verticalAlign='middle' />
                    <List.Content>
                      <List.Header as='a' onClick={() =>  push(`/invoice/?fileName=${invoiceFile.fileName}`)}>{invoiceFile.invoice.subject}</List.Header>
                      <List.Description as='a'>{invoiceFile.invoice.buyer.name + ' ' + invoiceFile.invoice.invoiceRef}</List.Description>
                    </List.Content>
                  </List.Item>
              )
            })}
          </List>
        </Layout.Main>
      </>
  )
}

export default Invoices
