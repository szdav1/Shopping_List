import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined'
import RestoreOutlined from '@mui/icons-material/RestoreOutlined'
import ShareOutlined from '@mui/icons-material/ShareOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import { ApiError, type AuthSession } from './auth'
import {
  addItem,
  archiveList,
  createList,
  getActiveLists,
  getArchivedLists,
  getList,
  getShares,
  removeItem,
  renameList,
  restoreList,
  revokeShare,
  setShare,
  type ListPermission,
  type ListShare,
  type SharePermission,
  type ShoppingItem,
  type ShoppingList,
} from './listsApi'
import { WorkspaceHeader } from './components/WorkspaceHeader'
import { ListSidebar, type ListView } from './components/ListSidebar'
import { ItemPanel } from './components/ItemPanel'
import './Workspace.css'

type DialogMode = 'create' | 'rename' | null

interface WorkspaceProps {
  session: AuthSession
  logoutError: string
  onLogout: () => void
  onSessionExpired: () => void
}

interface PendingShare {
  username: string
  permission: SharePermission
}

const permissionLabels: Record<ListPermission, string> = {
  OWNER: 'Tulajdonos',
  EDITOR: 'Szerkesztő',
  VIEWER: 'Olvasó',
}

const sharePermissionLabels: Record<SharePermission, string> = {
  editor: 'Szerkesztő',
  viewer: 'Olvasó',
}

function displayDate(value: string | null): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric' }).format(new Date(value))
}

function Workspace({ session, logoutError, onLogout, onSessionExpired }: WorkspaceProps) {
  const [view, setView] = useState<ListView>('active')
  const [activeLists, setActiveLists] = useState<ShoppingList[]>([])
  const [archivedLists, setArchivedLists] = useState<ShoppingList[]>([])
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null)
  const [itemsByList, setItemsByList] = useState<Record<number, ShoppingItem[]>>({})
  const [shares, setShares] = useState<ListShare[]>([])
  const [loadingLists, setLoadingLists] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [shareError, setShareError] = useState('')
  const [shareUsername, setShareUsername] = useState('')
  const [sharePermission, setSharePermission] = useState<SharePermission>('editor')
  const [pendingShare, setPendingShare] = useState<PendingShare | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('1')
  const [itemUnit, setItemUnit] = useState('')

  const handleApiError = useCallback((requestError: unknown) => {
    if (requestError instanceof ApiError && requestError.status === 401) {
      onSessionExpired()
      return
    }
    setError(requestError instanceof Error ? requestError.message : 'A művelet nem sikerült.')
  }, [onSessionExpired])

  const refreshLists = useCallback(async (nextView: ListView, preferredId?: number) => {
    setLoadingLists(true)
    setError('')
    setSelectedList(null)
    try {
      const lists = nextView === 'active'
        ? await getActiveLists(session.accessToken)
        : await getArchivedLists(session.accessToken)
      if (nextView === 'active') setActiveLists(lists)
      else setArchivedLists(lists)

      const nextSelection = lists.find((list) => list.id === preferredId) ?? lists[0] ?? null
      if (!nextSelection) return

      setSelectedList(nextSelection)
      if (nextView === 'active') {
        setLoadingDetails(true)
        const detail = await getList(session.accessToken, nextSelection.id)
        setSelectedList(detail)
      }
    } catch (requestError) {
      handleApiError(requestError)
    } finally {
      setLoadingLists(false)
      setLoadingDetails(false)
    }
  }, [handleApiError, session.accessToken])

  useEffect(() => {
    void refreshLists('active')
  }, [refreshLists])

  const currentLists = view === 'active' ? activeLists : archivedLists
  const selectedItems = selectedList ? itemsByList[selectedList.id] ?? [] : []
  const isOwner = selectedList?.permission === 'OWNER'
  const isArchived = view === 'archive' || selectedList?.deleted === true

  const selectList = async (list: ShoppingList) => {
    setSelectedList(list)
    setError('')
    if (view === 'archive') return

    setLoadingDetails(true)
    try {
      const detail = await getList(session.accessToken, list.id)
      setSelectedList((current) => current?.id === list.id ? detail : current)
    } catch (requestError) {
      handleApiError(requestError)
    } finally {
      setLoadingDetails(false)
    }
  }

  const openListDialog = (mode: Exclude<DialogMode, null>) => {
    setDialogError('')
    setDialogTitle(mode === 'rename' ? selectedList?.title ?? '' : '')
    setDialogMode(mode)
  }

  const submitListDialog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = dialogTitle.trim()
    if (!title) return

    setWorking(true)
    setDialogError('')
    try {
      if (dialogMode === 'create') {
        const created = await createList(session.accessToken, title)
        setActiveLists((current) => [created, ...current])
        setSelectedList(created)
        setItemsByList((current) => ({ ...current, [created.id]: [] }))
        setView('active')
        setNotice('A lista létrejött.')
      } else if (dialogMode === 'rename' && selectedList) {
        const updated = await renameList(session.accessToken, selectedList.id, title)
        setActiveLists((current) => current.map((list) => list.id === updated.id ? updated : list))
        setSelectedList(updated)
        setNotice('A lista neve frissült.')
      }
      setDialogMode(null)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        onSessionExpired()
      } else {
        setDialogError(requestError instanceof Error ? requestError.message : 'A lista mentése nem sikerült.')
      }
    } finally {
      setWorking(false)
    }
  }

  const confirmArchive = async () => {
    if (!selectedList) return
    setWorking(true)
    try {
      await archiveList(session.accessToken, selectedList.id)
      setArchiveDialogOpen(false)
      setItemsByList((current) => {
        const next = { ...current }
        delete next[selectedList.id]
        return next
      })
      setNotice('A lista az archívumba került.')
      await refreshLists('active')
    } catch (requestError) {
      handleApiError(requestError)
    } finally {
      setWorking(false)
    }
  }

  const handleRestore = async () => {
    if (!selectedList) return
    setWorking(true)
    try {
      const restored = await restoreList(session.accessToken, selectedList.id)
      setArchivedLists((current) => current.filter((list) => list.id !== restored.id))
      setActiveLists((current) => [restored, ...current])
      setSelectedList(restored)
      setView('active')
      setNotice('A lista visszaállt az aktív listák közé.')
    } catch (requestError) {
      handleApiError(requestError)
    } finally {
      setWorking(false)
    }
  }

  const submitItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedList) return
    setWorking(true)
    setError('')
    try {
      const item = await addItem(session.accessToken, selectedList.id, {
        name: itemName.trim(),
        quantity: Number(itemQuantity),
        unit: itemUnit.trim(),
      })
      setItemsByList((current) => ({
        ...current,
        [selectedList.id]: [item, ...(current[selectedList.id] ?? [])],
      }))
      setItemName('')
      setItemQuantity('1')
      setItemUnit('')
      setNotice('A tétel felkerült a listára.')
    } catch (requestError) {
      handleApiError(requestError)
    } finally {
      setWorking(false)
    }
  }

  const handleRemoveItem = async (item: ShoppingItem) => {
    if (!selectedList) return
    setWorking(true)
    try {
      await removeItem(session.accessToken, selectedList.id, item.id)
      setItemsByList((current) => ({
        ...current,
        [selectedList.id]: (current[selectedList.id] ?? []).filter((entry) => entry.id !== item.id),
      }))
      setNotice('A tétel törölve.')
    } catch (requestError) {
      handleApiError(requestError)
    } finally {
      setWorking(false)
    }
  }

  const openShareDialog = async () => {
    if (!selectedList) return
    setShareDialogOpen(true)
    setShareLoading(true)
    setShareError('')
    setShares([])
    setShareUsername('')
    setSharePermission('editor')
    setPendingShare(null)
    try {
      const currentShares = await getShares(session.accessToken, selectedList.id)
      setShares(currentShares)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) onSessionExpired()
      else setShareError(requestError instanceof Error ? requestError.message : 'A megosztások nem tölthetők be.')
    } finally {
      setShareLoading(false)
    }
  }

  const prepareShare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const targetUsername = shareUsername.trim()
    if (!targetUsername) return
    if (targetUsername === session.user.username) {
      setShareError('Saját felhasználónevével nem oszthatja meg a listát!')
      return
    }
    setShareError('')
    setPendingShare({ username: targetUsername, permission: sharePermission })
  }

  const confirmShare = async () => {
    if (!selectedList || !pendingShare) return
    setShareLoading(true)
    setShareError('')
    try {
      const updatedShare = await setShare(
        session.accessToken,
        selectedList.id,
        pendingShare.username,
        pendingShare.permission,
      )
      setShares((current) => [updatedShare, ...current.filter((share) => share.username !== updatedShare.username)])
      setShareUsername('')
      setPendingShare(null)
      setNotice(`A lista megosztva: ${updatedShare.username}.`)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) onSessionExpired()
      else setShareError(requestError instanceof Error ? requestError.message : 'A megosztás nem sikerült.')
    } finally {
      setShareLoading(false)
    }
  }

  const handleRevokeShare = async (username: string) => {
    if (!selectedList) return
    setShareLoading(true)
    setShareError('')
    try {
      await revokeShare(session.accessToken, selectedList.id, username)
      setShares((current) => current.filter((share) => share.username !== username))
      setNotice(`A hozzáférés visszavonva: ${username}.`)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) onSessionExpired()
      else setShareError(requestError instanceof Error ? requestError.message : 'A hozzáférés visszavonása nem sikerült.')
    } finally {
      setShareLoading(false)
    }
  }

  const changeView = (nextView: ListView) => {
    setView(nextView)
    setNotice('')
    void refreshLists(nextView)
  }

  return (
    <Box className="workspace-page">
      <WorkspaceHeader session={session} onLogout={onLogout} />

      <Box className="workspace-layout">
        <ListSidebar
          view={view}
          lists={currentLists}
          selectedList={selectedList}
          loading={loadingLists}
          onViewChange={changeView}
          onSelectList={(list) => void selectList(list)}
          onCreateList={() => openListDialog('create')}
        />

        <Box component="section" className="list-content" aria-live="polite">
          {(error || logoutError) && (
            <Alert severity="error" className="workspace-alert" onClose={() => setError('')}>
              {error || logoutError}
            </Alert>
          )}
          {notice && (
            <Alert severity="success" className="workspace-alert" onClose={() => setNotice('')}>
              {notice}
            </Alert>
          )}

          {loadingDetails ? (
            <Box className="details-loading" role="status">
              <CircularProgress />
              <Typography>Lista betöltése...</Typography>
            </Box>
          ) : selectedList ? (
            <>
              <Box className="list-detail-header">
                <Box className="list-title-area">
                  <Typography className="detail-eyebrow">
                    {isArchived ? 'ARCHÍV LISTA' : view === 'active' ? 'BEVÁSÁRLÓLISTA' : 'ARCHÍV LISTA'}
                  </Typography>
                  <Typography component="h2" className="list-detail-title">{selectedList.title}</Typography>
                  <Stack className="list-meta" direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography>{selectedList.ownerUsername}</Typography>
                    <span className="meta-separator" />
                    <Typography>{permissionLabels[selectedList.permission]}</Typography>
                    {isArchived && selectedList.deletedAt && (
                      <>
                        <span className="meta-separator" />
                        <Typography>{displayDate(selectedList.deletedAt)} óta archiválva</Typography>
                      </>
                    )}
                  </Stack>
                </Box>
                <Stack className="list-toolbar" direction="row" spacing={1}>
                  {view === 'archive' && isOwner && (
                    <Button
                      variant="outlined"
                      startIcon={<RestoreOutlined />}
                      onClick={() => void handleRestore()}
                      disabled={working}
                    >
                      Visszaállítás
                    </Button>
                  )}
                  {view === 'active' && isOwner && (
                    <>
                      <Tooltip title="Megosztások kezelése">
                        <IconButton aria-label="Megosztások kezelése" onClick={() => void openShareDialog()}>
                          <ShareOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Lista átnevezése">
                        <IconButton aria-label="Lista átnevezése" onClick={() => openListDialog('rename')}>
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Archiválás">
                        <IconButton aria-label="Lista archiválása" onClick={() => setArchiveDialogOpen(true)}>
                          <ArchiveOutlined />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </Box>

              <ItemPanel
                items={selectedItems}
                permission={selectedList.permission}
                archived={isArchived}
                working={working}
                itemName={itemName}
                itemQuantity={itemQuantity}
                itemUnit={itemUnit}
                onItemNameChange={setItemName}
                onItemQuantityChange={setItemQuantity}
                onItemUnitChange={setItemUnit}
                onSubmitItem={submitItem}
                onRemoveItem={(item) => void handleRemoveItem(item)}
              />
            </>
          ) : (
            <Box className="workspace-empty">
              <Box className="workspace-empty-icon"><Inventory2Outlined /></Box>
              <Typography component="h2">{view === 'active' ? 'Kezdj egy új listával' : 'Nincs archivált lista'}</Typography>
              <Typography>
                {view === 'active'
                  ? 'Hozz létre egy listát a bevásárlás megtervezéséhez.'
                  : 'Az archivált listák itt jelennek meg.'}
              </Typography>
              {view === 'active' && (
                <Button variant="contained" startIcon={<AddRounded />} onClick={() => openListDialog('create')}>
                  Új lista
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={dialogMode !== null} onClose={() => !working && setDialogMode(null)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={submitListDialog}>
          <DialogTitle>{dialogMode === 'rename' ? 'Lista átnevezése' : 'Új lista'}</DialogTitle>
          <DialogContent>
            {dialogError && <Alert severity="error" className="dialog-alert">{dialogError}</Alert>}
            <TextField
              autoFocus
              margin="dense"
              label="Lista neve"
              value={dialogTitle}
              onChange={(event) => setDialogTitle(event.target.value)}
              required
              fullWidth
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogMode(null)} disabled={working}>Mégse</Button>
            <Button type="submit" variant="contained" disabled={working || !dialogTitle.trim()}>
              {working ? <CircularProgress size={19} color="inherit" /> : 'Mentés'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={archiveDialogOpen} onClose={() => !working && setArchiveDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Lista archiválása</DialogTitle>
        <DialogContent>
          <Typography>
            A(z) „{selectedList?.title}” lista 30 napig visszaállítható marad. Archiválod?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveDialogOpen(false)} disabled={working}>Mégse</Button>
          <Button color="error" variant="contained" onClick={() => void confirmArchive()} disabled={working}>
            {working ? <CircularProgress size={19} color="inherit" /> : 'Archiválás'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={shareDialogOpen}
        onClose={() => !shareLoading && setShareDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Megosztások kezelése</DialogTitle>
        <DialogContent dividers>
          {shareError && <Alert severity="error" className="dialog-alert">{shareError}</Alert>}
          {shareLoading && shares.length === 0 ? (
            <Box className="share-loading"><CircularProgress size={22} /></Box>
          ) : (
            <>
              <Typography className="share-section-title">Hozzáféréssel rendelkezők</Typography>
              {shares.length > 0 ? (
                <List dense className="share-list" disablePadding>
                  {shares.map((share) => (
                    <Box component="li" className="share-row" key={share.username}>
                      <ManageAccountsOutlined />
                      <Box className="share-row-text">
                        <Typography>{share.username}</Typography>
                        <Typography>{sharePermissionLabels[share.permission]}</Typography>
                      </Box>
                      <Tooltip title="Hozzáférés visszavonása">
                        <IconButton
                          aria-label={`${share.username} hozzáférésének visszavonása`}
                          onClick={() => void handleRevokeShare(share.username)}
                          disabled={shareLoading}
                        >
                          <DeleteOutlineRounded />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography className="share-empty">Ezt a listát még nem osztottad meg senkivel.</Typography>
              )}

              <Divider className="share-divider" />

              {pendingShare ? (
                <Box className="share-confirmation">
                  <Typography className="share-section-title">Megosztás megerősítése</Typography>
                  <Typography>
                    A lista megosztása ezzel a felhasználónévvel: <strong>{pendingShare.username}</strong>
                  </Typography>
                  <Typography className="share-confirm-permission">
                    Jogosultság: {sharePermissionLabels[pendingShare.permission]}
                  </Typography>
                </Box>
              ) : (
                <Box component="form" className="share-form" onSubmit={prepareShare}>
                  <Typography className="share-section-title">Új megosztás</Typography>
                  <TextField
                    label="Felhasználónév"
                    value={shareUsername}
                    onChange={(event) => setShareUsername(event.target.value)}
                    autoComplete="off"
                    required
                    fullWidth
                    slotProps={{ htmlInput: { minLength: 3, maxLength: 30, pattern: '[A-Za-z0-9_]+' } }}
                  />
                  <FormControl fullWidth>
                    <InputLabel id="share-permission-label">Jogosultság</InputLabel>
                    <Select
                      labelId="share-permission-label"
                      label="Jogosultság"
                      value={sharePermission}
                      onChange={(event) => setSharePermission(event.target.value as SharePermission)}
                    >
                      <MenuItem value="editor">Szerkesztő</MenuItem>
                      <MenuItem value="viewer">Olvasó</MenuItem>
                    </Select>
                  </FormControl>
                  <Button type="submit" variant="outlined" disabled={!shareUsername.trim()}>
                    Tovább
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingShare(null)} disabled={!pendingShare || shareLoading}>Vissza</Button>
          <Button onClick={() => setShareDialogOpen(false)} disabled={shareLoading}>Bezárás</Button>
          {pendingShare && (
            <Button variant="contained" onClick={() => void confirmShare()} disabled={shareLoading}>
              {shareLoading ? <CircularProgress size={19} color="inherit" /> : 'Megerősítés'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Workspace