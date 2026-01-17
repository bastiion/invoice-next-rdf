'use client';

import {useTranslations} from 'next-intl';
import Layout from '../layout/Layout';

export default function InvoiceCreatePage() {
  const t = useTranslations('InvoiceCreatePage');

  return (
    <Layout.Main>
      <p>{t('info')}</p>
    </Layout.Main>
  );
}
