'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  ListDivider,
  Sheet,
  Typography,
  Button,
  Checkbox,
  Table,
  Skeleton,
} from '@mui/joy';
import IconButton from '@mui/joy/IconButton';
import {
  Close,
  PictureAsPdf,
  Delete,
  Save,
  Refresh,
  InfoOutlined,
} from '@mui/icons-material';
import AspectRatio from '@mui/joy/AspectRatio';
import dayjs from 'dayjs';
import NiceModal from '@ebay/nice-modal-react';
import {useQueryClient} from 'react-query';
import {useTranslations} from 'next-intl';
import {
  Buyer,
  Seller,
  TradeItem,
  useAddInvoiceMutation,
  useInvoiceFileQuery,
  useInvoiceFilesQuery,
  usePdfOfInvoiceQuery,
  useRemoveInvoiceMutation,
  useRenderInvoiceMutation,
  useUpdateInvoiceMutation,
} from '../generated/graphql';
import Layout from '../layout/Layout';
import {CalculatedInvoice} from '../util/types/invoice';
import calculateInvoice from '../util/calculate-invoice';
import type {Invoice as InvoiceType} from '../util/types/invoice';
import {toInvoiceInput} from '../util/normalize-invoice-taxes';
import {TemplateSelect} from '../invoice/TemplateSelect';
import config from '../config';
import {useRouter} from '../../i18n/navigation';
import Ribbon from '../ui/Ribbon';

const SellerSegement = ({seller}: {seller: Seller}) => (
  <Sheet variant="outlined" sx={{p: 2, borderRadius: 'sm'}}>
    <Typography level="h4">{seller.name}</Typography>
    <Typography level="body-sm">
      {seller.address.split('\n').map((t, index) => (
        <React.Fragment key={index}>
          {t}
          <br />
        </React.Fragment>
      ))}
    </Typography>
  </Sheet>
);

const BuyerSegment = ({buyer}: {buyer: Buyer}) => (
  <Sheet variant="outlined" sx={{p: 2, borderRadius: 'sm'}}>
    <Typography level="h4">{buyer.name}</Typography>
    <Typography level="body-sm">
      {buyer.address.split('\n').map((t, index) => (
        <React.Fragment key={index}>
          {t}
          <br />
        </React.Fragment>
      ))}
    </Typography>
  </Sheet>
);

const TradeitemsTable = ({
  tradeItems,
  t,
}: {
  tradeItems: TradeItem[];
  t: ReturnType<typeof useTranslations>;
}) => (
  <Table size="sm" borderAxis="bothBetween" stripe="odd">
    <thead>
      <tr>
        <th>{t('tradeTable.headers.title')}</th>
        <th>{t('tradeTable.headers.description')}</th>
        <th>{t('tradeTable.headers.amount')}</th>
        <th>{t('tradeTable.headers.unit')}</th>
        <th>{t('tradeTable.headers.netPricePerItem')}</th>
      </tr>
    </thead>
    <tbody>
      {tradeItems.map(({title, description, unit, amount, netPricePerItem}) => (
        <tr key={title + description}>
          <td>
            <Box sx={{position: 'relative', minHeight: '2.25rem', pl: '0.75rem', py: 0.5}}>
              <Ribbon>{title}</Ribbon>
            </Box>
          </td>
          <td>{description}</td>
          <td>{amount}</td>
          <td>{unit}</td>
          <td>{netPricePerItem}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

function InvoiceMainSkeleton() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <Skeleton variant="text" level="h2" width="60%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="80%" />
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
        <Skeleton variant="rectangular" height={120} sx={{flex: '1 1 320px', borderRadius: 'sm'}} />
        <Skeleton variant="rectangular" height={120} sx={{flex: '1 1 320px', borderRadius: 'sm'}} />
      </Box>
      <Skeleton variant="rectangular" height={200} sx={{borderRadius: 'sm'}} />
    </Box>
  );
}

type InvoiceSidePanelInvoice = {
  subject?: string | null;
  place?: string | null;
};

type InvoiceSidePanelProps = {
  invoice?: InvoiceSidePanelInvoice;
  title: string;
  imageSrc?: string;
  pdfLink?: string;
  invoiceCalculated?: CalculatedInvoice;
  selectedTemplateId?: string;
  enableZugferd: boolean;
  hasChanged: boolean;
  onMobileClose?: () => void;
  onTemplateChange: (id: string | undefined) => void;
  onZugferdChange: (enabled: boolean) => void;
  onRenderPdf: () => void;
  onSave: () => void;
  onRemove: () => void;
  t: ReturnType<typeof useTranslations>;
};

function InvoiceSidePanel({
  invoice,
  title,
  imageSrc,
  pdfLink,
  invoiceCalculated,
  selectedTemplateId,
  enableZugferd,
  hasChanged,
  onMobileClose,
  onTemplateChange,
  onZugferdChange,
  onRenderPdf,
  onSave,
  onRemove,
  t,
}: InvoiceSidePanelProps) {
  return (
    <>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography level="h4" sx={{flex: 1, fontWeight: 'lg'}}>
          {invoice?.subject ?? title}
        </Typography>
        {onMobileClose && (
          <IconButton
            variant="outlined"
            size="sm"
            aria-label={t('actions.closeDetails')}
            onClick={onMobileClose}
            sx={{display: {md: 'none'}}}
          >
            <Close />
          </IconButton>
        )}
      </Box>

      {imageSrc && (
        <Box sx={{p: 2}}>
          <AspectRatio ratio={3 / 4} sx={{borderRadius: 'sm', overflow: 'hidden'}}>
            <Image fill alt={t('pdfPreviewAlt')} src={imageSrc} />
          </AspectRatio>
        </Box>
      )}

      <Box sx={{p: 2}}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          {pdfLink && (
            <Button
              component="a"
              href={pdfLink}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              fullWidth
            >
              <PictureAsPdf sx={{mr: 1}} />
              {t('actions.viewPdf')}
            </Button>
          )}

          <Box>
            <Box sx={{mb: 2, display: 'flex', flexDirection: 'row', gap: 2}}>
              <Typography level="body-sm" sx={{mb: 1, fontWeight: 'md'}}>
                {t('templateSelection')}
              </Typography>
              <TemplateSelect templateId={selectedTemplateId} onChange={onTemplateChange} />
            </Box>
            <Checkbox
              label={t('enableZugferd')}
              checked={enableZugferd}
              onChange={(e) => onZugferdChange(e.target.checked)}
            />
            <Button
              onClick={onRenderPdf}
              disabled={!selectedTemplateId}
              variant="soft"
              fullWidth
              sx={{mt: 1}}
            >
              <Refresh sx={{mr: 1}} />
              {t('actions.renderPdf')}
            </Button>
          </Box>
        </Box>
      </Box>

      <ListDivider component="hr" />

      <Box sx={{p: 2}}>
        <Typography level="h4" sx={{mb: 2, fontWeight: 'lg'}}>
          {t('details.title')}
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography level="body-sm" textColor="text.secondary">
              {t('details.place')}
            </Typography>
            <Typography level="body-sm">{invoice?.place}</Typography>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography level="body-sm" textColor="text.secondary">
              {t('details.owner')}
            </Typography>
            <Typography level="body-sm">Winzlieb</Typography>
          </Box>
        </Box>
      </Box>

      <ListDivider component="hr" />

      <Box sx={{p: 2}}>
        <Typography level="h4" sx={{mb: 2, fontWeight: 'lg'}}>
          {t('financial.title')}
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography level="body-sm" textColor="text.secondary">
              {t('financial.netPrice')}
            </Typography>
            <Typography level="body-sm" fontWeight="md">
              {invoiceCalculated?.total.netGrandTotal}
            </Typography>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography level="body-sm" textColor="text.secondary">
              {t('financial.total')}
            </Typography>
            <Typography level="body-sm" fontWeight="md">
              {invoiceCalculated?.total.grossGrandTotal}
            </Typography>
          </Box>
          <Box>
            <Typography level="body-sm" textColor="text.secondary" sx={{mb: 0.5}}>
              {t('financial.taxes')}
            </Typography>
            <Typography level="body-sm">
              {invoiceCalculated?.taxes
                .map(
                  ({name, total}) =>
                    `${name}: ${total} ${invoiceCalculated?.currency || 'Taler'}`
                )
                .join(', ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <ListDivider component="hr" />

      <Box sx={{p: 2}}>
        <Typography level="h4" sx={{mb: 2, fontWeight: 'lg'}}>
          {t('actions.title')}
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          {hasChanged && (
            <Button onClick={onSave} color="success" variant="soft" fullWidth>
              <Save sx={{mr: 1}} />
              {t('actions.saveChanges')}
            </Button>
          )}
          <Button onClick={onRemove} color="danger" variant="outlined" fullWidth>
            <Delete sx={{mr: 1}} />
            {t('actions.removeInvoice')}
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default function InvoicePage() {
  const t = useTranslations('InvoicePage');
  const {push} = useRouter();
  const searchParams = useSearchParams();
  const fileName = searchParams?.get('fileName') ?? '';
  const enabled = Boolean(fileName);
  const {data, isLoading} = useInvoiceFileQuery({fileName}, {enabled});
  const invoice = data?.invoiceFile?.invoice;
  const invoiceRef = invoice?.invoiceRef;
  const [editableInvoice, setEditableInvoice] = useState<InvoiceType | undefined>();
  const [enableZugferd, setEnableZugferd] = useState(false);
  const [sidePaneOpen, setSidePaneOpen] = useState(false);
  const {data: pdfData} = usePdfOfInvoiceQuery(
    {invoiceRef: invoiceRef || ''},
    {enabled: Boolean(invoiceRef)}
  );
  const title = invoice
    ? t('invoiceTitle', {subject: invoice.subject ?? ''})
    : t('invoiceTitleFallback');
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const {mutateAsync: saveAsync} = useAddInvoiceMutation();
  const {mutateAsync: updateAsync} = useUpdateInvoiceMutation({
    onSuccess: () => {
      [
        ['invoiceFile', {fileName}],
        ['pdfOfInvoice', {invoiceRef}],
        ['invoiceFiles'],
      ].forEach((qK) => queryClient.invalidateQueries(qK));
    },
  });
  const {mutateAsync: renderAsync} = useRenderInvoiceMutation({
    onSuccess: () => {
      [
        ['invoiceFile', {fileName}],
        ['pdfOfInvoice', {invoiceRef}],
      ].forEach((qK) => queryClient.invalidateQueries(qK));
    },
  });
  const {mutateAsync: removeAsync} = useRemoveInvoiceMutation({
    onSuccess: () => {
      [['invoiceFiles']].forEach((qK) => queryClient.invalidateQueries(qK));
    },
  });
  const [hasChanged, setHasChanged] = useState(false);
  const {refetch: refetchInvoiceFiles} = useInvoiceFilesQuery();

  const [invoiceCalculated, setInvoiceCalculated] = useState<CalculatedInvoice | undefined>();
  useEffect(() => {
    if (editableInvoice) {
      // @ts-ignore
      setInvoiceCalculated(calculateInvoice(editableInvoice));
    }
  }, [editableInvoice, setInvoiceCalculated]);
  useEffect(() => {
    if (invoice) {
      // @ts-ignore
      setEditableInvoice(invoice);
    }
  }, [invoice, setEditableInvoice]);

  useEffect(() => {
    if (!sidePaneOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidePaneOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidePaneOpen]);

  const handleSave = useCallback(async () => {
    if (!editableInvoice) return;
    await saveAsync({invoice: toInvoiceInput(editableInvoice)});
    setHasChanged(false);
  }, [saveAsync, editableInvoice]);

  const handleRemove = useCallback(async () => {
    if (invoiceRef) {
      await removeAsync({invoiceRef});
      push('/');
    }
  }, [invoiceRef, removeAsync, push]);

  const handleRemoveClick = useCallback(async () => {
    const confirmed = await NiceModal.show('ConfirmationDialog', {
      title: t('removeDialog.title'),
      message: t('removeDialog.message'),
      confirmText: t('removeDialog.confirm'),
      cancelText: t('removeDialog.cancel'),
      severity: 'danger',
    });
    if (confirmed) {
      handleRemove();
    }
  }, [handleRemove, t]);

  const handleRenderPdf = useCallback(async () => {
    selectedTemplateId &&
      invoiceRef &&
      (await renderAsync({
        invoiceRef,
        template: selectedTemplateId,
        enableZugferd,
      }));
  }, [invoiceRef, renderAsync, selectedTemplateId, enableZugferd]);

  const handleEditInvoice = useCallback(async () => {
    if (!invoice || !fileName) return;

    const updatedInvoice = await NiceModal.show('InvoiceForm', {initialInvoice: invoice});
    if (updatedInvoice) {
      try {
        await updateAsync({invoice: toInvoiceInput(updatedInvoice), invoiceFileName: fileName});
      } catch (error) {
        console.error('Error updating invoice:', error);
      }
    }
  }, [invoice, fileName, updateAsync]);

  const handleCloneInvoice = useCallback(async () => {
    if (!invoice) return;

    const newInvoiceRef = await NiceModal.show('CloneInvoiceDialog', {oldInvoice: invoice});
    if (newInvoiceRef) {
      const newInvoice = {
        ...invoice,
        invoiceRef: newInvoiceRef,
        date: dayjs().toISOString(),
      };

      try {
        const result = await saveAsync({invoice: toInvoiceInput(newInvoice)});
        if (result?.addInvoice?.invoiceRef) {
          const {data: updatedData} = await refetchInvoiceFiles();
          const createdInvoiceRef = result.addInvoice.invoiceRef;
          const matchingInvoiceFile = updatedData?.invoiceFiles?.find(
            (invoiceFile) => invoiceFile?.invoice.invoiceRef === createdInvoiceRef
          );
          if (matchingInvoiceFile?.fileName) {
            push(
              '/invoice?' +
                new URLSearchParams([['fileName', matchingInvoiceFile.fileName]]).toString()
            );
          }
        }
      } catch (error) {
        console.error('Error cloning invoice:', error);
      }
    }
  }, [invoice, saveAsync, refetchInvoiceFiles, push]);

  const pdfLink =
    (pdfData?.pdfOfInvoice?.length &&
      `${config.staticContentURL}/${pdfData?.pdfOfInvoice}`) ||
    undefined;
  const imageSrc = pdfLink?.replace('.pdf', '.png');
  const showLoading = enabled && isLoading && !invoice;

  return (
    <>
      <Layout.Main>
        {showLoading && <InvoiceMainSkeleton />}
        {!showLoading && !invoice && enabled && (
          <Typography level="body-md" textColor="text.secondary">
            {t('loading')}
          </Typography>
        )}
        {invoice && (
          <>
            <Box
              sx={{
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography
                level="h2"
                textColor="text.tertiary"
                textTransform="uppercase"
                letterSpacing="md"
                fontWeight="lg"
              >
                {title}
              </Typography>
              <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                <Button
                  onClick={() => setSidePaneOpen(true)}
                  size="md"
                  variant="soft"
                  startDecorator={<InfoOutlined />}
                  sx={{display: {md: 'none'}}}
                >
                  {t('openDetails')}
                </Button>
                <Button
                  onClick={handleEditInvoice}
                  size="md"
                  variant="plain"
                  sx={{fontSize: 'xs', px: 1}}
                >
                  {t('actions.editInvoice')}
                </Button>
                <Button
                  onClick={handleCloneInvoice}
                  size="md"
                  variant="plain"
                  sx={{fontSize: 'xs', px: 1}}
                >
                  {t('actions.cloneInvoice')}
                </Button>
              </Box>
            </Box>
            <Typography level="body-md" textColor="text.secondary">
              {invoice.description.split('\n').map((tLine, index) => (
                <React.Fragment key={index}>
                  {tLine}
                  <br />
                </React.Fragment>
              ))}
            </Typography>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2}}>
              <Box sx={{flex: '1 1 320px'}}>
                <BuyerSegment buyer={invoice.buyer} />
              </Box>
              <Box sx={{flex: '1 1 320px'}}>
                <SellerSegement seller={invoice.seller} />
              </Box>
            </Box>
            <TradeitemsTable tradeItems={invoice.tradeItems as TradeItem[]} t={t} />
          </>
        )}
      </Layout.Main>

      <Layout.SidePane
        mobileOpen={sidePaneOpen}
        onMobileClose={() => setSidePaneOpen(false)}
      >
        <InvoiceSidePanel
          invoice={invoice}
          title={title}
          imageSrc={imageSrc}
          pdfLink={pdfLink}
          invoiceCalculated={invoiceCalculated}
          selectedTemplateId={selectedTemplateId}
          enableZugferd={enableZugferd}
          hasChanged={hasChanged}
          onMobileClose={() => setSidePaneOpen(false)}
          onTemplateChange={setSelectedTemplateId}
          onZugferdChange={setEnableZugferd}
          onRenderPdf={handleRenderPdf}
          onSave={handleSave}
          onRemove={handleRemoveClick}
          t={t}
        />
      </Layout.SidePane>
    </>
  );
}
