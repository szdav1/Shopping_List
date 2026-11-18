import { Box, Paper, Typography } from '@mui/material'
import CheckRounded from '@mui/icons-material/CheckRounded'
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined'

export function AuthStoryPanel() {
  return (
    <Box component="section" className="story-panel" aria-label="Kosár">
      <Box className="brand-lockup">
        <ShoppingBasketOutlined aria-hidden="true" />
        <span>kosár</span>
      </Box>

      <Box className="story-copy">
        <Typography className="story-eyebrow">BEVÁSÁRLÓLISTA, EGYÜTT</Typography>
        <Typography component="h1" className="story-title">
          Kevesebb fejben tartani. Több együtt megoldani.
        </Typography>
        <Typography className="story-description">
          A közös bevásárlás itt kezdődik.
        </Typography>
      </Box>

      <Paper className="list-preview" elevation={0} aria-hidden="true">
        <Box className="preview-heading">
          <Box>
            <span className="preview-kicker">A MAI TERV</span>
            <Typography component="h2">Heti bevásárlás</Typography>
          </Box>
          <span className="preview-count">03</span>
        </Box>
        <Box className="preview-row preview-row-done">
          <span className="preview-check"><CheckRounded /></span>
          <span>Szezonális alma</span>
        </Box>
        <Box className="preview-row">
          <span className="preview-check" />
          <span>Kovászos kenyér</span>
        </Box>
        <Box className="preview-row">
          <span className="preview-check" />
          <span>Friss zöldfűszerek</span>
        </Box>
        <Box className="preview-footer">
          <span className="preview-dot" />
          Közös lista
        </Box>
      </Paper>

      <Typography className="story-footer">Jó dolgok, egy helyen.</Typography>
    </Box>
  )
}
