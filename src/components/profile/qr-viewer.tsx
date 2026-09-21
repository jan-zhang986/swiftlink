import { Box, Dialog, DialogContent } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

import { CompactDialogTitle } from './compact-dialog-title'
import {
  compactDialogBackdropSx,
  compactDialogBodySx,
  compactEditorPaperSx,
} from './compact-editor-dialog'

interface Props {
  open: boolean
  value: string
  title?: string
  onClose: () => void
}

export const QrViewer = (props: Props) => {
  const { open, value, title, onClose } = props
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: compactDialogBackdropSx },
        paper: {
          sx: {
            ...compactEditorPaperSx,
            width: 360,
          },
        },
      }}
    >
      <CompactDialogTitle onClose={onClose}>
        {title ?? t('profiles.modals.qrViewer.title')}
      </CompactDialogTitle>
      <DialogContent sx={{ ...compactDialogBodySx, pt: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 2,
            bgcolor: '#fff',
            borderRadius: '16px',
          }}
        >
          <QRCodeSVG value={value} size={220} level="M" />
        </Box>
      </DialogContent>
    </Dialog>
  )
}
