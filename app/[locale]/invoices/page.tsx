import {getTranslations} from 'next-intl/server';
import InvoicesPage from '../../../components/pages/InvoicesPage';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'InvoicesPage'});
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

export default function Page() {
  return <InvoicesPage />;
}
