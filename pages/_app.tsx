import '../styles/globals.css'
import 'semantic-ui-css/semantic.min.css'
import type { AppProps } from 'next/app'
import { StyledEngineProvider } from '@mui/material/styles';
import MyQueryClientProvider from "../components/QueryClientProvider";
import {SidebarVisible} from "../components/layout/SidebarVisible";
import InvoiceForm from "../components/invoice/InvoiceForm";


function MyApp({ Component, pageProps }: AppProps) {
  return <MyQueryClientProvider>
    <StyledEngineProvider injectFirst>
      <InvoiceForm />
      <SidebarVisible>
        <Component {...pageProps} />
      </SidebarVisible>
    </StyledEngineProvider>
  </MyQueryClientProvider>
}

export default MyApp
