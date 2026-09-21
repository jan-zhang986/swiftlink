import { UnfoldMoreRounded } from '@mui/icons-material'

export const compactEditorPaperSx = {
  width: 640,
  maxWidth: 'calc(100vw - 48px)',
  borderRadius: '20px',
  overflow: 'hidden',
  border: 'none',
  boxShadow: '0 24px 64px rgba(15, 23, 42, 0.2)',
} as const

export const compactDialogBackdropSx = {
  bgcolor: 'rgba(15, 23, 42, 0.36)',
} as const

export const compactDialogTitleSx = {
  px: 2.5,
  pt: 2,
  pb: 1.25,
  fontSize: 17,
  fontWeight: 650,
  letterSpacing: '-0.03em',
  lineHeight: 1.3,
} as const

export const compactEditorContentSx = {
  display: 'flex',
  px: 2.5,
  pb: 1,
  height: 'min(52vh, 460px)',
} as const

export const compactDialogBodySx = {
  px: 2.5,
  pb: 2.5,
  pt: 0.5,
} as const

export const compactDialogActionsSx = {
  px: 2.5,
  pb: 2,
  pt: 0.5,
  gap: 1,
} as const

export const compactActionBtnSx = {
  borderRadius: '12px',
  textTransform: 'none' as const,
  fontWeight: 600,
  px: 1.75,
}

export const compactActionContainedSx = {
  ...compactActionBtnSx,
  boxShadow: 'none',
}

export const compactModeToggleSx = {
  ...compactActionBtnSx,
  bgcolor: 'action.hover',
  color: 'text.primary',
  boxShadow: 'none',
  '&:hover': { bgcolor: 'action.selected' },
} as const

export const compactFieldInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    minHeight: 38,
    fontSize: 13,
    bgcolor: 'action.hover',
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    py: '7px',
    fontSize: 13,
  },
} as const

export const compactSelectSlotProps = {
  paper: {
    sx: {
      mt: 0.75,
      borderRadius: '16px',
      border: 'none',
      boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
      overflow: 'hidden',
    },
  },
  listbox: {
    sx: {
      py: 0.5,
      maxHeight: 240,
      '& .MuiAutocomplete-option': {
        minHeight: 36,
        mx: 0.5,
        my: 0.15,
        px: 1.15,
        borderRadius: '10px',
        fontSize: 13,
        lineHeight: 1.35,
      },
    },
  },
} as const

export const compactSelectPopupIcon = (
  <UnfoldMoreRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
)
