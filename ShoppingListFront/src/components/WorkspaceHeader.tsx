import { AppBar, Avatar, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined'
import type { AuthSession } from '../auth'

interface WorkspaceHeaderProps {
  session: AuthSession
  onLogout: () => void
}

export function WorkspaceHeader({ session, onLogout }: WorkspaceHeaderProps) {
  return (
    <AppBar position="static" elevation={0} className="workspace-appbar">
      <Toolbar className="workspace-toolbar">
        <Box className="workspace-brand">
          <ShoppingBasketOutlined aria-hidden="true" />
          <Typography component="span">kosár</Typography>
        </Box>
        <Box className="workspace-account">
          <Avatar className="account-avatar">
            {session.user.username.slice(0, 1).toUpperCase()}
          </Avatar>
          <Typography className="account-name">{session.user.username}</Typography>
          <Tooltip title="Kijelentkezés">
            <IconButton aria-label="Kijelentkezés" onClick={onLogout}>
              <LogoutRounded />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
