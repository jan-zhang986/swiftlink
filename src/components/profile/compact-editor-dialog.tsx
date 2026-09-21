import { UnfoldMoreRounded } from '@mui/icons-material'

export const compactEditorPaperSx = {
  width: 640,
  maxWidth: 'calc(100vw - 48px)',
  borderRadius: '16px',
  overflow: 'hidden',
} as const

export const compactDialogTitleSx = {
  px: 2,
  pt: 1.5,
  pb: 1,
  fontSize: 16,
  fontWeight: 650,
} as const

export const compactEditorContentSx = {
  display: 'flex',
  px: 2,
  pb: 0.75,
  height: 'min(52vh, 460px)',
} as const

export const compactActionBtnSx = {
  borderRadius: '12px',
  textTransform: 'none' as const,
  fontWeight: 600,
}

export const compactActionContainedSx = {
  ...compactActionBtnSx,
  boxShadow: 'none',
}

export const compactFieldInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    minHeight: 36,
    fontSize: 13,
    bgcolor: 'action.hover',
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    py: '6px',
    fontSize: 13,
  },
} as const

export const compactSelectSlotProps = {
  paper: {
    sx: {
      mt: 0.75,
      borderRadius: '14px',
      boxShadow: '0 10px 28px rgba(15, 23, 42, 0.12)',
      overflow: 'hidden',
    },
  },
  listbox: {
    sx: {
      py: 0.5,
      maxHeight: 240,
      '& .MuiAutocomplete-option': {
        minHeight: 34,
        mx: 0.5,
        my: 0.15,
        px: 1.15,
        borderRadius: '8px',
        fontSize: 13,
        lineHeight: 1.35,
      },
    },
  },
} as const

export const compactSelectPopupIcon = (
  <UnfoldMoreRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
)
