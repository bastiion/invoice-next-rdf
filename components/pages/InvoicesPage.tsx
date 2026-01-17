'use client';

import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Typography
} from '@mui/joy';
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
import {useTranslations} from 'next-intl';
import Layout from '../layout/Layout';
import {useInvoiceFilesQuery} from '../generated/graphql';
import {useRouter} from '../../i18n/navigation';

export default function InvoicesPage() {
  const t = useTranslations('InvoicesPage');
  const {push} = useRouter();
  const {data} = useInvoiceFilesQuery();

  return (
    <Layout.Main>
      <h1>{t('headline')}</h1>
      <List sx={{gap: 1}}>
        {data?.invoiceFiles?.map((invoiceFile) => {
          return (
            invoiceFile && (
              <ListItem key={invoiceFile.fileName}>
                <ListItemButton
                  onClick={() =>
                    push(`/invoice/?fileName=${invoiceFile.fileName}`)
                  }
                >
                  <ListItemDecorator>
                    <InsertDriveFileOutlined />
                  </ListItemDecorator>
                  <ListItemContent>
                    <Typography level="title-sm">
                      {invoiceFile.invoice.subject}
                    </Typography>
                    <Typography level="body-xs" textColor="text.tertiary">
                      {invoiceFile.invoice.buyer.name +
                        ' ' +
                        invoiceFile.invoice.invoiceRef}
                    </Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            )
          );
        })}
      </List>
    </Layout.Main>
  );
}
