import {getTranslations} from 'next-intl/server';
import InvoicePage from '../../../components/pages/InvoicePage';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'InvoicePage'});
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

export default function Page() {
  return <InvoicePage />;
}
