import '../styles/globals.css'
import 'semantic-ui-css/semantic.min.css'
import type { AppProps } from 'next/app'
import { StyledEngineProvider } from '@mui/material/styles';
import MyQueryClientProvider from "../components/QueryClientProvider";
import {SidebarVisible} from "../components/layout/SidebarVisible";
import { AuthProvider } from "../components/auth/AuthContext";
import NiceModal from '@ebay/nice-modal-react';
import InvoiceForm from "../components/invoice/InvoiceForm";
import { CloneInvoiceDialog } from "../components/invoice/CloneInvoiceDialog";
import { ConfirmationDialog } from "../components/util/ConfirmationDialog";

// Register modals
NiceModal.register('InvoiceForm', InvoiceForm);
NiceModal.register('CloneInvoiceDialog', CloneInvoiceDialog);
NiceModal.register('ConfirmationDialog', ConfirmationDialog);

function MyApp({ Component, pageProps }: AppProps) {
  return <AuthProvider>
    <MyQueryClientProvider>
      <StyledEngineProvider injectFirst>
        <NiceModal.Provider>
          <SidebarVisible>
            <Component {...pageProps} />
          </SidebarVisible>
        </NiceModal.Provider>
      </StyledEngineProvider>
    </MyQueryClientProvider>
  </AuthProvider>
}

export default MyApp
