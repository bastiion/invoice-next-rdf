'use client';

import * as React from 'react';
import {StyledEngineProvider} from '@mui/material/styles';
import NiceModal from '@ebay/nice-modal-react';
import MyQueryClientProvider from '../../components/QueryClientProvider';
import {SidebarVisible} from '../../components/layout/SidebarVisible';
import {AuthProvider} from '../../components/auth/AuthContext';
import InvoiceForm from '../../components/invoice/InvoiceForm';
import {CloneInvoiceDialog} from '../../components/invoice/CloneInvoiceDialog';
import {ConfirmationDialog} from '../../components/util/ConfirmationDialog';

// Register modals once on the client
NiceModal.register('InvoiceForm', InvoiceForm);
NiceModal.register('CloneInvoiceDialog', CloneInvoiceDialog);
NiceModal.register('ConfirmationDialog', ConfirmationDialog);

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <MyQueryClientProvider>
        <StyledEngineProvider injectFirst>
          <NiceModal.Provider>
            <SidebarVisible>{children}</SidebarVisible>
          </NiceModal.Provider>
        </StyledEngineProvider>
      </MyQueryClientProvider>
    </AuthProvider>
  );
}
