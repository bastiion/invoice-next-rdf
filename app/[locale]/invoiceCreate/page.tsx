import {getTranslations} from 'next-intl/server';
import InvoiceCreatePage from '../../../components/pages/InvoiceCreatePage';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'InvoiceCreatePage'});
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

export default function Page() {
  return <InvoiceCreatePage />;
}
