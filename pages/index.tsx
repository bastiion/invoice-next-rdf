import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {SidebarVisible} from "../components/layout/SidebarVisible";


const Home: NextPage = () => {
  return (
      <>
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Invoice and order management" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
          <main style={{minHeight: '100vh'}}>Test</main>
      </>
  )
}

export default Home
