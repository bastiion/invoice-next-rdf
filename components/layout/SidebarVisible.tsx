'use client';

import theme from '../theme/theme'
import React, {useState} from "react";
import {
  Box,
  CssVarsProvider,
  Menu,
  MenuButton,
  MenuItem,
  Dropdown,
  Typography,
} from "@mui/joy"
import type { Theme } from "@mui/joy/styles"
import {GlobalStyles} from "@mui/system";
import Layout from "./Layout";
import Navigation from "./Navigation";
import { FindInPageRounded, GridViewRounded, SearchRounded, Menu as MenuIcon } from "@mui/icons-material";
import IconButton from "@mui/joy/IconButton";
import ProfileDropdown from "../auth/ProfileDropdown";
import InvoiceSearchAutocomplete from "../search/InvoiceSearchAutocomplete";
import {useTranslations} from 'next-intl';
interface Props {
  children: JSX.Element[] | JSX.Element
}
export const SidebarVisible = ({children}: Props) => {
  const t = useTranslations('Sidebar');
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
      <CssVarsProvider theme={theme}>
        <GlobalStyles<Theme>
            styles={(theme) => ({
              body: {
                margin: 0,
                fontFamily: theme.vars.fontFamily.body,
              },
            })}
        />
        {drawerOpen && (
            <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
              <Navigation />
            </Layout.SideDrawer>
        )}
        <Layout.Root
            sx={{
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'minmax(64px, 200px) minmax(450px, 1fr)',
                md: 'minmax(160px, 300px) minmax(600px, 1fr) minmax(300px, 420px)',
              },
              ...(drawerOpen && {
                height: '100vh',
                overflow: 'hidden',
              }),
            }}
        >
          <Layout.Header>
            <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1.5,
                }}
            >
              <IconButton
                  variant="outlined"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                  size="sm"
                  variant="solid"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                <FindInPageRounded />
              </IconButton>
              <Typography fontWeight={700}>{t('productTitle')}</Typography>
            </Box>
            <InvoiceSearchAutocomplete
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'flex',
                  },
                }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
              <IconButton
                  size="sm"
                  variant="outlined"
                  color="primary"
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              >
                <SearchRounded />
              </IconButton>
              <Dropdown>
                <MenuButton
                  size="sm"
                  variant="outlined"
                  color="primary"
                  aria-label={t('appsLabel')}
                >
                  <GridViewRounded />
                </MenuButton>
                <Menu placement="bottom-end">
                  <MenuItem component="a" href="/">
                    {t('menu.dashboard')}
                  </MenuItem>
                </Menu>
              </Dropdown>
              <ProfileDropdown />
            </Box>
          </Layout.Header>
          <Layout.SideNav>
            <Navigation />
          </Layout.SideNav>
          {children}
        </Layout.Root>
      </CssVarsProvider>
  );
}
