import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import ListDivider from '@mui/joy/ListDivider';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import { useAuthenticationFlow } from './useAuthenticationFlow';

/**
 * Get user initials from user name
 */
function getUserInitials(name?: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Get display name from user object
 */
function getDisplayName(user: any): string {
  if (user?.profile?.name) return user.profile.name;
  if (user?.profile?.preferred_username) return user.profile.preferred_username;
  if (user?.profile?.email) return user.profile.email;
  return 'User';
}

/**
 * Profile dropdown component
 * Shows login button when not authenticated
 * Shows user avatar and menu when authenticated
 * Hidden when authentication is disabled
 */
export default function ProfileDropdown() {
  const {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    accountManagementUrl,
  } = useAuthenticationFlow();

  // Check if auth is enabled (if both isAuthenticated and isLoading are false and there's no user, auth might be disabled)
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';
  
  // Don't render anything if auth is disabled
  if (!authEnabled) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton variant="soft" size="sm" disabled>
          <PersonIcon />
        </IconButton>
      </Box>
    );
  }

  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <Button
        variant="outlined"
        color="primary"
        size="sm"
        startDecorator={<LoginIcon />}
        onClick={login}
      >
        Login
      </Button>
    );
  }

  // Get user information
  const displayName = getDisplayName(user);
  const userEmail = user?.profile?.email || '';
  const initials = getUserInitials(displayName);

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{
          root: {
            variant: 'plain',
            color: 'neutral',
          },
        }}
      >
        <Avatar
          size="sm"
          sx={{
            bgcolor: 'primary.500',
            color: 'white',
          }}
        >
          {initials}
        </Avatar>
      </MenuButton>
      <Menu
        placement="bottom-end"
        size="sm"
        sx={{
          minWidth: 200,
          '--List-padding': '0.5rem',
          '--ListItem-radius': '0.5rem',
        }}
      >
        {/* User info header */}
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Box>
            <Typography level="body-sm" fontWeight="lg">
              {displayName}
            </Typography>
            {userEmail && (
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                {userEmail}
              </Typography>
            )}
          </Box>
        </MenuItem>

        <ListDivider />

        {/* Account management link (if available) */}
        {accountManagementUrl && (
          <>
            <MenuItem
              component="a"
              href={accountManagementUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ManageAccountsIcon fontSize="small" sx={{ mr: 1 }} />
              Manage Account
            </MenuItem>
            <ListDivider />
          </>
        )}

        {/* Logout */}
        <MenuItem onClick={logout} color="danger">
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}


