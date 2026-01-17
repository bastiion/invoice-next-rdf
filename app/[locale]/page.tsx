import {getTranslations} from 'next-intl/server';
import HomePage from '../../components/pages/HomePage';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'HomePage'});
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

export default function Page() {
  return <HomePage />;
}
