import { Box, Chip, Dialog, DialogContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { BaseEmpty } from '@/components/base'

import { CompactDialogTitle } from './compact-dialog-title'
import {
  compactDialogBackdropSx,
  compactDialogBodySx,
  compactEditorPaperSx,
} from './compact-editor-dialog'

interface Props {
  open: boolean
  logInfo: [string, string][]
  onClose: () => void
}

export const LogViewer = (props: Props) => {
  const { open, logInfo, onClose } = props
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
            width: 480,
          },
        },
      }}
    >
      <CompactDialogTitle onClose={onClose}>
        {t('profiles.modals.logViewer.title')}
      </CompactDialogTitle>

      <DialogContent
        sx={{
          ...compactDialogBodySx,
          height: 'min(40vh, 280px)',
          overflowX: 'hidden',
          userSelect: 'text',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {logInfo.map(([level, log]) => (
            <Box
              key={`${level}-${log}`}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                px: 1.25,
                py: 1,
                borderRadius: '12px',
                bgcolor: 'action.hover',
              }}
            >
              <Chip
                label={level}
                size="small"
                sx={{
                  height: 22,
                  flexShrink: 0,
                  fontWeight: 650,
                  borderRadius: '8px',
                  bgcolor:
                    level === 'error' || level === 'exception'
                      ? 'error.main'
                      : 'action.selected',
                  color:
                    level === 'error' || level === 'exception'
                      ? '#fff'
                      : 'text.secondary',
                  '& .MuiChip-label': { px: 0.9 },
                }}
              />
              <Typography
                sx={{ fontSize: 13, color: 'text.secondary', pt: 0.15 }}
              >
                {log}
              </Typography>
            </Box>
          ))}
        </Box>

        {logInfo.length === 0 && <BaseEmpty />}
      </DialogContent>
    </Dialog>
  )
}
