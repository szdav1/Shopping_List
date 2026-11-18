import { useState, type FormEvent } from 'react'
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

interface RegistrationFormProps {
  username: string
  password: string
  isSubmitting: boolean
  message: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onSwitchToLogin: () => void
}

export function RegistrationForm(props: RegistrationFormProps) {
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationMessage('')

    if (!/^[A-Za-z0-9_]{3,30}$/.test(props.username.trim())) {
      setValidationMessage('A felhasználónév 3–30 karakter hosszú lehet, és csak betűket, számokat vagy aluljel karaktert tartalmazhat.')
      return
    }
    if (props.password.length < 8) {
      setValidationMessage('A jelszó legalább 8 karakter hosszú legyen.')
      return
    }
    if (props.password !== confirmation) {
      setValidationMessage('A két jelszó nem egyezik.')
      return
    }

    props.onSubmit(event)
  }

  return (
    <>
      <Box className="form-heading">
        <Typography className="form-eyebrow">ÚJ FIÓK</Typography>
        <Typography component="h2" className="form-title">Regisztráció</Typography>
        <Typography className="form-description">Hozz létre egy fiókot a közös listáidhoz.</Typography>
      </Box>

      {(props.message || validationMessage) && (
        <Alert className="form-alert" severity="error" role="alert">
          {validationMessage || props.message}
        </Alert>
      )}

      <Box component="form" className="login-form" onSubmit={handleSubmit}>
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
          type={showPassword ? 'text' : 'password'}
          value={props.password}
          onChange={(event) => props.onPasswordChange(event.target.value)}
          autoComplete="new-password"
          required
          fullWidth
          slotProps={{
            htmlInput: {},
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                    onClick={() => setShowPassword((visible) => !visible)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Jelszó újra"
          name="passwordConfirmation"
          type={showPassword ? 'text' : 'password'}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="new-password"
          required
          fullWidth
          slotProps={{ htmlInput: {} }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={props.isSubmitting}
          endIcon={props.isSubmitting ? <CircularProgress size={17} color="inherit" /> : <ArrowForwardRounded />}
          fullWidth
        >
          {props.isSubmitting ? 'Regisztráció...' : 'Fiók létrehozása'}
        </Button>
      </Box>

      <Box className="auth-switch-row">
        <Typography>Már van fiókja?</Typography>
        <Button type="button" onClick={props.onSwitchToLogin}>Bejelentkezés</Button>
      </Box>
    </>
  )
}
