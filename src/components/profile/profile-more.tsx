import {
  CodeRounded,
  DataObjectRounded,
  FeaturedPlayListRounded,
} from '@mui/icons-material'
import {
  Box,
  Badge,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useLockFn } from 'ahooks'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EditorViewer } from '@/components/profile/editor-viewer'
import { useEditorDocument } from '@/hooks/use-editor-document'
import { viewProfile, readProfileFile, saveProfileFile } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'

import { LogViewer } from './log-viewer'

interface Props {
  logInfo?: [string, string][]
  id: 'Merge' | 'Script'
  onSave?: (prev?: string, curr?: string) => void
}

const EMPTY_LOG_INFO: [string, string][] = []

// Default global extend script content (mirrors `ITEM_SCRIPT` in
// src-tauri/src/utils/tmpl.rs).
const DEFAULT_SCRIPT = `// Define main function (script entry)

function main(config, profileName) {
  return config;
}
`

// profile enhanced item
export const ProfileMore = (props: Props) => {
  const { id, logInfo, onSave } = props

  const entries = logInfo ?? EMPTY_LOG_INFO
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const [fileOpen, setFileOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)

  const loadDocument = useCallback(() => readProfileFile(id), [id])
  const document = useEditorDocument({
    open: fileOpen,
    load: loadDocument,
  })

  const onEditFile = () => {
    setAnchorEl(null)
    setFileOpen(true)
  }

  const onOpenFile = useLockFn(async () => {
    setAnchorEl(null)
    try {
      await viewProfile(id)
    } catch (err) {
      showNotice.error(err)
    }
  })

  const hasError = entries.some(([level]) => level === 'exception')

  const globalTitles: Record<Props['id'], string> = {
    Merge: 'profiles.components.more.global.merge',
    Script: 'profiles.components.more.global.script',
  }

  const chipLabels: Record<Props['id'], string> = {
    Merge: 'profiles.components.more.chips.merge',
    Script: 'profiles.components.more.chips.script',
  }

  const itemMenu = [
    { label: 'profiles.components.menu.editFile', handler: onEditFile },
    { label: 'profiles.components.menu.openFile', handler: onOpenFile },
  ]

  const handleSave = useLockFn(async () => {
    const currentValue = document.value
    if (!(await saveProfileFile(id, currentValue))) {
      await document.reload()
      return
    }
    onSave?.(document.savedValue, currentValue)
    document.markSaved(currentValue)
  })

  const handleResetToDefault = useCallback(() => {
    document.setValue(DEFAULT_SCRIPT)
  }, [document])

  const Icon = id === 'Merge' ? DataObjectRounded : CodeRounded

  return (
    <>
      <Box
        onClick={onEditFile}
        onContextMenu={(event) => {
          const { clientX, clientY } = event
          setPosition({ top: clientY, left: clientX })
          setAnchorEl(event.currentTarget as HTMLElement)
          event.preventDefault()
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
          px: 1.5,
          py: 1.1,
          borderRadius: '14px',
          bgcolor: 'action.hover',
          cursor: 'pointer',
          transition: 'background-color 160ms ease',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            bgcolor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(25, 118, 210, 0.1)'
                : 'rgba(144, 202, 249, 0.16)',
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            noWrap
            title={t(globalTitles[id])}
            sx={{
              fontSize: 13,
              fontWeight: 650,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
            }}
          >
            {t(globalTitles[id])}
          </Typography>
          <Chip
            label={t(chipLabels[id])}
            size="small"
            sx={{
              mt: 0.35,
              height: 18,
              fontSize: 10,
              fontWeight: 600,
              borderRadius: '6px',
              bgcolor: 'background.paper',
            }}
          />
        </Box>
        {id === 'Script' &&
          (hasError ? (
            <Badge color="error" variant="dot" overlap="circular">
              <IconButton
                size="small"
                color="error"
                title={t('profiles.modals.logViewer.title')}
                onClick={(event) => {
                  event.stopPropagation()
                  setLogOpen(true)
                }}
              >
                <FeaturedPlayListRounded fontSize="inherit" />
              </IconButton>
            </Badge>
          ) : (
            <IconButton
              size="small"
              color="inherit"
              title={t('profiles.modals.logViewer.title')}
              onClick={(event) => {
                event.stopPropagation()
                setLogOpen(true)
              }}
            >
              <FeaturedPlayListRounded fontSize="inherit" />
            </IconButton>
          ))}
      </Box>

      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorPosition={position}
        anchorReference="anchorPosition"
        transitionDuration={225}
        slotProps={{ list: { sx: { py: 0.5 } } }}
        onContextMenu={(e) => {
          setAnchorEl(null)
          e.preventDefault()
        }}
      >
        {itemMenu.map((item) => (
          <MenuItem
            key={item.label}
            onClick={item.handler}
            sx={{ minWidth: 120 }}
            dense
          >
            {t(item.label)}
          </MenuItem>
        ))}
      </Menu>
      {fileOpen && (
        <EditorViewer
          open={true}
          title={t(globalTitles[id])}
          value={document.value}
          language={id === 'Merge' ? 'yaml' : 'javascript'}
          path={`profile-more:${id}.${id === 'Merge' ? 'yaml' : 'js'}`}
          loading={document.loading}
          dirty={document.dirty}
          onChange={document.setValue}
          onSave={handleSave}
          onResetToDefault={id === 'Script' ? handleResetToDefault : undefined}
          onClose={() => setFileOpen(false)}
        />
      )}
      {logOpen && (
        <LogViewer
          open={logOpen}
          logInfo={entries}
          onClose={() => setLogOpen(false)}
        />
      )}
    </>
  )
}
