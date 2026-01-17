'use client';

import {useTranslations} from 'next-intl';
import Layout from '../layout/Layout';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <Layout.Main>
      <h1>{t('headline')}</h1>
      <p>{t('intro')}</p>
    </Layout.Main>
  );
}
