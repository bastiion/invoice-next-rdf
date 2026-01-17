import {NextPage} from "next";
import Head from "next/head";
import Layout from "../components/layout/Layout";

const InvoiceCreate: NextPage = () => {
  const title = 'Create Invoice'
  return <>
    <Head>
      <title>{title}</title>
      <meta name="description" content="Invoice and order management" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Layout.Main>
      {/* Invoice creation is now handled via modal - this page is kept for backwards compatibility */}
    </Layout.Main>
  </>
}

export default InvoiceCreate
