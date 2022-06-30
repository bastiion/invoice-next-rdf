import {Icon, Image, Menu, Segment, Sidebar} from "semantic-ui-react";
import styles from "../../styles/Home.module.css";
import theme from '../theme/theme'
import React, {useState} from "react";
import {useRouter} from "next/router";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  CssVarsProvider,
  List,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemContent,
  Sheet,
  TextField, ThemeProvider,
  Typography,
} from "@mui/joy"
import type { Theme } from "@mui/joy/styles"
import {GlobalStyles} from "@mui/system";
import Layout from "./Layout";
import Navigation from "./Navigation";
import AspectRatio from "@mui/joy/AspectRatio";
import CardCover from "@mui/joy/CardCover";
import CardOverflow from "@mui/joy/CardOverflow";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import { Close, EditOutlined, FindInPageRounded, FolderOpen, GridViewRounded, SearchRounded } from "@mui/icons-material";
import IconButton from "@mui/joy/IconButton";
interface Props {
  children: JSX.Element[] | JSX.Element
}
export const SidebarVisible = ({children}: Props) => {
  const router = useRouter()
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
                <Menu />
              </IconButton>
              <IconButton
                  size="sm"
                  variant="solid"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                <FindInPageRounded />
              </IconButton>
              <Typography fontWeight={700}>Graviola - Business Ontology</Typography>
            </Box>
            <TextField
                size="sm"
                placeholder="Search anything..."
                startDecorator={<SearchRounded color="primary" />}
                endDecorator={
                  <IconButton variant="outlined" size="sm">
                    <Typography fontWeight="lg" fontSize="sm" textColor="text.tertiary">
                      /
                    </Typography>
                  </IconButton>
                }
                sx={{
                  flexBasis: '500px',
                  display: {
                    xs: 'none',
                    sm: 'flex',
                  },
                }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
              <IconButton
                  size="sm"
                  variant="outlined"
                  color="primary"
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              >
                <SearchRounded />
              </IconButton>
              <Menu
                  id="app-selector"
                  control={
                    <IconButton
                        size="sm"
                        variant="outlined"
                        color="primary"
                        aria-label="Apps"
                    >
                      <GridViewRounded />
                    </IconButton>
                  }
                  menus={[
                    { label: 'Email', component: 'a', href: '/joy-ui/templates/email/' },
                    { label: 'Team', component: 'a', href: '/joy-ui/templates/team/' },
                    { label: 'Files', active: true },
                  ]}
              />
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
