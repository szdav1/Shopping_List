import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import PlaylistAddRounded from '@mui/icons-material/PlaylistAddRounded'
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined'
import type { ShoppingList } from '../listsApi'

export type ListView = 'active' | 'archive'

interface ListSidebarProps {
  view: ListView
  lists: ShoppingList[]
  selectedList: ShoppingList | null
  loading: boolean
  onViewChange: (view: ListView) => void
  onSelectList: (list: ShoppingList) => void
  onCreateList: () => void
}

function displayDate(value: string | null): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric' }).format(new Date(value))
}

export function ListSidebar(props: ListSidebarProps) {
  return (
    <Paper component="aside" className="list-sidebar" elevation={0}>
      <Box className="sidebar-topline">
        <Typography component="h1">Listáim</Typography>
        <Tooltip title="Új lista">
          <IconButton aria-label="Új lista" onClick={props.onCreateList}>
            <AddRounded />
          </IconButton>
        </Tooltip>
      </Box>

      <Box className="list-view-switch" role="tablist" aria-label="Lista nézet">
        <Button
          role="tab"
          aria-selected={props.view === 'active'}
          className={props.view === 'active' ? 'view-tab selected' : 'view-tab'}
          onClick={() => props.onViewChange('active')}
          startIcon={<ShoppingCartOutlined />}
        >
          Aktív
        </Button>
        <Button
          role="tab"
          aria-selected={props.view === 'archive'}
          className={props.view === 'archive' ? 'view-tab selected' : 'view-tab'}
          onClick={() => props.onViewChange('archive')}
          startIcon={<ArchiveOutlined />}
        >
          Archívum
        </Button>
      </Box>
      <Divider />

      {props.loading ? (
        <Box className="sidebar-loading" role="status">
          <CircularProgress size={22} />
        </Box>
      ) : props.lists.length > 0 ? (
        <List className="shopping-list-nav" disablePadding>
          {props.lists.map((list) => (
            <ListItemButton
              key={list.id}
              selected={props.selectedList?.id === list.id}
              onClick={() => props.onSelectList(list)}
              className="shopping-list-nav-item"
            >
              <ListItemIcon><Inventory2Outlined /></ListItemIcon>
              <ListItemText
                className="sidebar-list-text"
                primary={list.title}
                secondary={props.view === 'active' ? list.ownerUsername : displayDate(list.deletedAt)}
              />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Box className="sidebar-empty">
          <Typography>{props.view === 'active' ? 'Még nincs aktív listád.' : 'Az archívum üres.'}</Typography>
        </Box>
      )}

      {props.view === 'active' && (
        <Button
          className="sidebar-create-button"
          variant="outlined"
          startIcon={<PlaylistAddRounded />}
          onClick={props.onCreateList}
        >
          Új lista
        </Button>
      )}
    </Paper>
  )
}
