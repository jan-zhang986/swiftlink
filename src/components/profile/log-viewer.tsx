import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseEmpty } from '@/components/base'

import {
  compactActionBtnSx,
  compactDialogTitleSx,
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
        paper: {
          sx: {
            ...compactEditorPaperSx,
            width: 480,
          },
        },
      }}
    >
      <DialogTitle sx={compactDialogTitleSx}>
        {t('profiles.modals.logViewer.title')}
      </DialogTitle>

      <DialogContent
        sx={{
          px: 2,
          pb: 0.75,
          height: 'min(40vh, 280px)',
          overflowX: 'hidden',
          userSelect: 'text',
        }}
      >
        {logInfo.map(([level, log]) => (
          <Fragment key={`${level}-${log}`}>
            <Typography color="text.secondary" component="div">
              <Chip
                label={level}
                size="small"
                variant="outlined"
                color={
                  level === 'error' || level === 'exception'
                    ? 'error'
                    : 'default'
                }
                sx={{ mr: 1 }}
              />
              {log}
            </Typography>
            <Divider sx={{ my: 0.5 }} />
          </Fragment>
        ))}

        {logInfo.length === 0 && <BaseEmpty />}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5, pt: 0.75 }}>
        <Button onClick={onClose} variant="outlined" sx={compactActionBtnSx}>
          {t('shared.actions.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
