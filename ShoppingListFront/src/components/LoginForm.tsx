import { type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import LockOutlined from '@mui/icons-material/LockOutlined'
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

interface LoginFormProps {
  username: string
  password: string
  showPassword: boolean
  isSubmitting: boolean
  message: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onShowPasswordChange: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function LoginForm(props: LoginFormProps) {
  return (
    <>
      <Box className="form-heading">
        <Typography className="form-eyebrow">ÜDV ÚJRA</Typography>
        <Typography component="h2" className="form-title">Bejelentkezés</Typography>
        <Typography className="form-description">Add meg az adataidat a folytatáshoz.</Typography>
      </Box>

      {props.message && (
        <Alert className="form-alert" severity="error" role="alert">
          {props.message}
        </Alert>
      )}

      <Box component="form" className="login-form" onSubmit={props.onSubmit}>
        <TextField
          label="Felhasználónév"
          name="username"
          value={props.username}
          onChange={(event) => props.onUsernameChange(event.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          required
          fullWidth
          slotProps={{
            htmlInput: { maxLength: 30 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineRounded fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Jelszó"
          name="password"
          type={props.showPassword ? 'text' : 'password'}
          value={props.password}
          onChange={(event) => props.onPasswordChange(event.target.value)}
          autoComplete="current-password"
          required
          fullWidth
          slotProps={{
            htmlInput: { minLength: 8 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={props.showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                    onClick={props.onShowPasswordChange}
                    edge="end"
                  >
                    {props.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={props.isSubmitting}
          endIcon={props.isSubmitting ? <CircularProgress size={17} color="inherit" /> : <ArrowForwardRounded />}
          fullWidth
        >
          {props.isSubmitting ? 'Bejelentkezés...' : 'Belépés'}
        </Button>
      </Box>

      <Typography className="form-note">
        A folytatással biztonságos munkamenetet indítasz.
      </Typography>
    </>
  )
}
