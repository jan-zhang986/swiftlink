import { CloseRounded } from '@mui/icons-material'
import { Box, DialogTitle, IconButton } from '@mui/material'
import type { ReactNode } from 'react'

import { compactDialogTitleSx } from './compact-editor-dialog'

interface CompactDialogTitleProps {
  children: ReactNode
  extra?: ReactNode
  onClose?: () => void
}

export const CompactDialogTitle = ({
  children,
  extra,
  onClose,
}: CompactDialogTitleProps) => (
  <DialogTitle
    sx={{
      ...compactDialogTitleSx,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    }}
  >
    <Box
      component="span"
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
    {extra}
    {onClose ? (
      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          color: 'text.secondary',
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        <CloseRounded fontSize="small" />
      </IconButton>
    ) : null}
  </DialogTitle>
)
