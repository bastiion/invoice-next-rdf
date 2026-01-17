import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';

// Icons import
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {createTheme} from "@mui/system";
import {InvoiceNavigationTree} from "../invoice/InvoiceNavigationTree";
import {useRouter} from "next/router";
import {AddBoxRounded} from "@mui/icons-material";
import NiceModal from '@ebay/nice-modal-react';
import { useAddInvoiceMutation, useInvoiceFilesQuery } from '../generated/graphql';

const theme = createTheme()

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

export default function Navigation() {
  const { push } = useRouter()
  const { mutateAsync: addInvoiceAsync } = useAddInvoiceMutation()
  const { refetch: refetchInvoiceFiles } = useInvoiceFilesQuery()

  const handleCreateInvoice = React.useCallback(async () => {
    const newInvoice = await NiceModal.show('InvoiceForm', {});
    if (newInvoice) {
      try {
        const result = await addInvoiceAsync({ invoice: newInvoice });
        if (result?.addInvoice?.invoiceRef) {
          // Refetch invoiceFiles to get the newly created invoice file
          const { data: updatedData } = await refetchInvoiceFiles();
          const invoiceRef = result.addInvoice.invoiceRef;
          const matchingInvoiceFile = updatedData?.invoiceFiles?.find(
            (invoiceFile) => invoiceFile?.invoice.invoiceRef === invoiceRef
          );
          if (matchingInvoiceFile?.fileName) {
            push('/invoice?' + new URLSearchParams([['fileName', matchingInvoiceFile.fileName]]).toString());
          }
        }
      } catch (error) {
        console.error('Error creating invoice:', error);
      }
    }
  }, [addInvoiceAsync, refetchInvoiceFiles, push]);
  return (
      <List size="sm" sx={{ '--List-item-radius': '8px' }}>
        <ListItem nested sx={{ p: 0 }}>
          <Toggler
            defaultExpanded
            renderToggle={({ open, setOpen }) => (
              <Box
                sx={{
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onClick={() => setOpen(!open)}
              >
                <Typography
                  id="nav-list-browse-buyer"
                  textColor="neutral.500"
                  fontWeight={700}
                  sx={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '.1rem',
                  }}
                >
                  Invoices by Buyer
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="sm"
                    variant="plain"
                    sx={{ '--IconButton-size': '24px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateInvoice();
                    }}
                  >
                    <AddBoxRounded fontSize="small" color="primary" />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="primary"
                    sx={{ '--IconButton-size': '24px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(!open);
                    }}
                  >
                    <KeyboardArrowDownIcon
                      fontSize="small"
                      color="primary"
                      sx={[
                        open
                          ? { transform: 'rotate(180deg)' }
                          : { transform: 'none' },
                      ]}
                    />
                  </IconButton>
                </Box>
              </Box>
            )}
          >
            <InvoiceNavigationTree groupedBy="buyer" />
          </Toggler>
        </ListItem>

        <ListItem nested sx={{ p: 0 }}>
          <Toggler
            defaultExpanded
            renderToggle={({ open, setOpen }) => (
              <Box
                sx={{
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onClick={() => setOpen(!open)}
              >
                <Typography
                  id="nav-list-browse-seller"
                  textColor="neutral.500"
                  fontWeight={700}
                  sx={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '.1rem',
                  }}
                >
                  Invoices by Seller
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="sm"
                    variant="plain"
                    sx={{ '--IconButton-size': '24px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateInvoice();
                    }}
                  >
                    <AddBoxRounded fontSize="small" color="primary" />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="primary"
                    sx={{ '--IconButton-size': '24px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(!open);
                    }}
                  >
                    <KeyboardArrowDownIcon
                      fontSize="small"
                      color="primary"
                      sx={[
                        open
                          ? { transform: 'rotate(180deg)' }
                          : { transform: 'none' },
                      ]}
                    />
                  </IconButton>
                </Box>
              </Box>
            )}
          >
            <InvoiceNavigationTree groupedBy="seller" />
          </Toggler>
        </ListItem>
        <ListItem nested>
          <Box
              sx={{
                mt: 2,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
          >
            <Typography
                id="nav-list-tags"
                textColor="neutral.500"
                fontWeight={700}
                sx={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '.1rem',
                }}
            >
              Tags
            </Typography>
            <IconButton
                size="sm"
                variant="plain"
                color="primary"
                sx={{ '--IconButton-size': '24px' }}
            >
              <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
            </IconButton>
          </Box>
          <List
              aria-labelledby="nav-list-tags"
              size="sm"
              sx={{
                '--List-decorator-width': '32px',
                '& .JoyListItemButton-root': { p: '8px' },
              }}
          >
            <ListItem>
              <ListItemButton>
                <ListItemDecorator>
                  <Box
                      sx={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '99px',
                        bgcolor: 'primary.300',
                      }}
                  />
                </ListItemDecorator>
                <ListItemContent>Personal</ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>
                <ListItemDecorator>
                  <Box
                      sx={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '99px',
                        bgcolor: 'danger.400',
                      }}
                  />
                </ListItemDecorator>
                <ListItemContent>Work</ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>
                <ListItemDecorator>
                  <Box
                      sx={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '99px',
                        bgcolor: 'warning.500',
                      }}
                  />
                </ListItemDecorator>
                <ListItemContent>Offer</ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>
                <ListItemDecorator>
                  <Box
                      sx={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '99px',
                        bgcolor: 'success.400',
                      }}
                  />
                </ListItemDecorator>
                <ListItemContent>Drafts</ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        </ListItem>
      </List>
  );
}
