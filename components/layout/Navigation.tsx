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
import {createTheme} from "@mui/system";
import {InvoiceList} from "../invoice/InvoiceList";
import {useRouter} from "next/router";
import {AddBoxRounded} from "@mui/icons-material";

const theme = createTheme()

export default function Navigation() {
  const { push } = useRouter()
  return (
      <List size="sm" sx={{ '--List-item-radius': '8px' }}>
        <ListItem nested sx={{ p: 0 }}>
          <Box
              sx={{
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
          >
            <Typography
                id="nav-list-browse"
                textColor="neutral.500"
                fontWeight={700}
                sx={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '.1rem',
                }}
            >
              Invoices
            </Typography>
            <IconButton
                size="sm"
                variant="plain"
                sx={{ '--IconButton-size': '24px' }}
                onClick={() => push('/invoiceCreate')}
            >
              <AddBoxRounded fontSize="small" color="primary" />
            </IconButton>
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
              aria-labelledby="nav-list-browse"
              sx={{
                '& .JoyListItemButton-root': { p: '8px' },
              }}
          >
            <InvoiceList />
          </List>
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
