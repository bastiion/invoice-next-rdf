'use client';

import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useRouter } from '../../i18n/navigation';
import { useInvoiceFilesQuery, InvoiceFilesQuery } from '../generated/graphql';
import { filterUndefOrNull } from '../util/notEmpty';
import dayjs from 'dayjs';

interface TogglerProps {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}

function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: TogglerProps) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: 'grid',
            transition: '0.2s ease',
            '& > *': {
              overflow: 'hidden',
            },
          },
          open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
        ]}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

type InvoiceFile = NonNullable<InvoiceFilesQuery['invoiceFiles']>[number];

type GroupedInvoices = {
  [entityName: string]: {
    [year: string]: InvoiceFile[];
  };
};

interface InvoiceNavigationTreeProps {
  groupedBy?: 'buyer' | 'seller';
}

export const InvoiceNavigationTree = ({ groupedBy = 'buyer' }: InvoiceNavigationTreeProps) => {
  const { push } = useRouter();
  const { data } = useInvoiceFilesQuery();

  const groupedInvoices = React.useMemo<GroupedInvoices>(() => {
    const grouped: GroupedInvoices = {};

    filterUndefOrNull(data?.invoiceFiles).forEach((invoiceFile) => {
      // Get the name based on groupedBy prop
      const entityName = groupedBy === 'seller' 
        ? invoiceFile.invoice.seller.name 
        : invoiceFile.invoice.buyer.name;
      
      if (!entityName) return;

      // Derive year from invoice.date or createdAt (fallback)
      const dateStr = invoiceFile.invoice.date || invoiceFile.createdAt;
      const year = dayjs(dateStr).year().toString();

      if (!grouped[entityName]) {
        grouped[entityName] = {};
      }
      if (!grouped[entityName][year]) {
        grouped[entityName][year] = [];
      }
      grouped[entityName][year].push(invoiceFile);
    });

    // Sort years within each entity (newest to earliest)
    Object.keys(grouped).forEach((entityName) => {
      const years = Object.keys(grouped[entityName]);
      years.sort((a, b) => parseInt(b) - parseInt(a));
    });

    return grouped;
  }, [data?.invoiceFiles, groupedBy]);

  const entityNames = Object.keys(groupedInvoices).sort();

  return (
    <List
      size="sm"
      sx={{
        gap: 0.5,
        '--List-nestedInsetStart': '30px',
        '--ListItem-radius': (theme) => theme.vars.radius.sm,
      }}
    >
      {entityNames.map((entityName) => {
        const years = Object.keys(groupedInvoices[entityName]).sort(
          (a, b) => parseInt(b) - parseInt(a)
        );

        return (
          <ListItem nested key={entityName}>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <ListItemContent>
                    <Typography level="title-sm">{entityName}</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open
                        ? { transform: 'rotate(180deg)' }
                        : { transform: 'none' },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                {years.map((year) => {
                  const invoices = groupedInvoices[entityName][year];

                  return (
                    <ListItem nested key={`${entityName}-${year}`}>
                      <Toggler
                        renderToggle={({ open, setOpen }) => (
                          <ListItemButton onClick={() => setOpen(!open)}>
                            <ListItemContent>
                              <Typography level="title-sm">{year}</Typography>
                            </ListItemContent>
                            <KeyboardArrowDownIcon
                              sx={[
                                open
                                  ? { transform: 'rotate(180deg)' }
                                  : { transform: 'none' },
                              ]}
                            />
                          </ListItemButton>
                        )}
                      >
                        <List sx={{ gap: 0.5 }}>
                          {invoices
                            .filter((invoiceFile): invoiceFile is NonNullable<typeof invoiceFile> => 
                              invoiceFile !== null && invoiceFile !== undefined
                            )
                            .map((invoiceFile) => {
                              const isOffer = invoiceFile.invoice.isOffer;
                              const Icon = isOffer ? RequestQuoteIcon : ReceiptIcon;
                              const displayText = invoiceFile.invoice.subject || invoiceFile.fileName;

                              return (
                                <ListItem key={invoiceFile.fileName} sx={{ mt: 0.5 }}>
                                  <ListItemButton
                                    onClick={() =>
                                      push(`/invoice/?fileName=${invoiceFile.fileName}`)
                                    }
                                  >
                                    <ListItemDecorator>
                                      <Icon fontSize="small" />
                                    </ListItemDecorator>
                                    <ListItemContent
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      <Typography level="body-sm">
                                        {displayText}
                                      </Typography>
                                    </ListItemContent>
                                  </ListItemButton>
                                </ListItem>
                              );
                            })}
                        </List>
                      </Toggler>
                    </ListItem>
                  );
                })}
              </List>
            </Toggler>
          </ListItem>
        );
      })}
    </List>
  );
};

