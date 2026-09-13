import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

import { useAuthContext } from 'src/auth/hooks';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export function AccountPopover({ data = [], sx, ...other }) {
  const pathname = usePathname();

  const { open, anchorEl, onClose, onOpen } = usePopover();

  const { user } = useAuthContext();

  const renderMenuActions = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{ paper: { sx: { p: 0, width: 260 } }, arrow: { offset: 20 } }}
    >
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Tooltip title="Name" placement="left">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Iconify
              icon="solar:user-bold-duotone"
              width={18}
              sx={{ color: 'text.disabled', flexShrink: 0 }}
            />
            <Typography variant="subtitle2" noWrap>
              {user?.displayName ?? user?.email}
            </Typography>
          </Box>
        </Tooltip>

        <Tooltip title="Email" placement="left">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              minWidth: 0,
              mt: 1.25,
            }}
          >
            <Iconify
              icon="solar:letter-bold-duotone"
              width={18}
              sx={{ color: 'text.disabled', flexShrink: 0 }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <MenuList sx={{ p: 1, my: 1, '& li': { p: 0 } }}>
        {data.map((option) => {
          const isUnderDashboardOrComponents =
            pathname.startsWith(paths.dashboard.root) || pathname.startsWith(paths.components);
          const rootLabel = isUnderDashboardOrComponents ? 'Home' : 'Dashboard';
          const rootHref = isUnderDashboardOrComponents ? paths.dashboard.overview : paths.home;

          return (
            <MenuItem key={option.label}>
              <Link
                component={RouterLink}
                href={option.label === 'Home' ? rootHref : option.href}
                color="inherit"
                underline="none"
                onClick={onClose}
                sx={{
                  px: 1,
                  py: 0.75,
                  width: 1,
                  display: 'flex',
                  typography: 'body2',
                  alignItems: 'center',
                  color: 'text.secondary',
                  '& svg': { width: 24, height: 24 },
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {option.icon}

                <Box component="span" sx={{ ml: 2 }}>
                  {option.label === 'Home' ? rootLabel : option.label}
                </Box>

                {option.info && (
                  <Label color="error" sx={{ ml: 1 }}>
                    {option.info}
                  </Label>
                )}
              </Link>
            </MenuItem>
          );
        })}
      </MenuList>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 1 }}>
        <SignOutButton
          size="medium"
          variant="text"
          onClose={onClose}
          sx={{ display: 'block', textAlign: 'left' }}
        />
      </Box>
    </CustomPopover>
  );

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={user?.photoURL}
        displayName={user?.displayName}
        sx={sx}
        {...other}
      />

      {renderMenuActions()}
    </>
  );
}
