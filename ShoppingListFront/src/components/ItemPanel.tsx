import { type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded'
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined'
import type { ListPermission, ShoppingItem } from '../listsApi'

interface ItemPanelProps {
  items: ShoppingItem[]
  permission: ListPermission
  archived: boolean
  working: boolean
  itemName: string
  itemQuantity: string
  itemUnit: string
  onItemNameChange: (value: string) => void
  onItemQuantityChange: (value: string) => void
  onItemUnitChange: (value: string) => void
  onSubmitItem: (event: FormEvent<HTMLFormElement>) => void
  onRemoveItem: (item: ShoppingItem) => void
}

export function ItemPanel(props: ItemPanelProps) {
  const canEditItems = props.permission === 'OWNER' || props.permission === 'EDITOR'

  return (
    <Paper className="items-panel" elevation={0}>
      <Box className="items-panel-heading">
        <Box>
          <Typography component="h3">Tételek</Typography>
          <Typography className="items-count">
            {props.items.length > 0 ? `${props.items.length} ebben a munkamenetben` : 'Nincs betöltött tétel'}
          </Typography>
        </Box>
        <MoreHorizRounded className="items-heading-icon" />
      </Box>

      {props.archived && (
        <Alert severity="info" className="items-notice">
          Az archivált lista csak megtekinthető. Visszaállítás után újra szerkeszthető.
        </Alert>
      )}
      {!props.archived && props.permission === 'VIEWER' && (
        <Alert severity="info" className="items-notice">
          Önnek csak megtekintési joga van ehhez a listához!
        </Alert>
      )}

      {!props.archived && canEditItems && (
        <Box component="form" className="add-item-form" onSubmit={props.onSubmitItem}>
          <TextField
            label="Tétel neve"
            value={props.itemName}
            onChange={(event) => props.onItemNameChange(event.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />
          <TextField
            label="Mennyiség"
            type="number"
            value={props.itemQuantity}
            onChange={(event) => props.onItemQuantityChange(event.target.value)}
            required
            slotProps={{ htmlInput: { min: 0.01, max: 99999999.99, step: 0.01 } }}
          />
          <TextField
            label="Egység"
            value={props.itemUnit}
            onChange={(event) => props.onItemUnitChange(event.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          <Button type="submit" variant="contained" startIcon={<AddRounded />} disabled={props.working}>
            Hozzáadás
          </Button>
        </Box>
      )}

      <Divider />

      {props.items.length > 0 ? (
        <List className="item-list" disablePadding>
          {props.items.map((item) => (
            <Box component="li" className="item-row" key={item.id}>
              <Box className="item-row-icon"><CheckCircleOutlineRounded /></Box>
              <Box className="item-row-main">
                <Typography className="item-name">{item.name}</Typography>
                <Typography className="item-detail">
                  {new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 2 }).format(item.quantity)} {item.unit}
                  <span> · </span>{item.createdBy}
                </Typography>
              </Box>
              {canEditItems && !props.archived && (
                <Tooltip title="Tétel törlése">
                  <IconButton
                    aria-label={`${item.name} törlése`}
                    onClick={() => props.onRemoveItem(item)}
                    disabled={props.working}
                  >
                    <DeleteOutlineRounded />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </List>
      ) : (
        <Box className="items-empty">
          <Box className="items-empty-icon"><ShoppingBasketOutlined /></Box>
          <Typography component="h4">Még nincsenek megjeleníthető tételek</Typography>
          <Typography>
            Az API jelenleg nem biztosít tétellista-végpontot, ezért a korábban felvitt tételek nem tölthetők be.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
