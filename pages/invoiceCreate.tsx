import {NextPage} from "next";
import {useRouter} from "next/router";
import Head from "next/head";
import Layout from "../components/layout/Layout";
import React from "react";

const InvoiceForm = React.lazy(() => import('../components/invoice/InvoiceForm'))


const InvoiceCreate: NextPage = () => {
  const { query } = useRouter()
  const title = 'create Invoice'
  return <>
    <Head>
      <title>{title}</title>
      <meta name="description" content="Invoice and order management" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Layout.Main>
    </Layout.Main>
  </>

}

export default InvoiceCreate
