import {
  DeleteForeverRounded,
  UndoRounded,
  VerticalAlignBottomRounded,
  VerticalAlignTopRounded,
} from '@mui/icons-material'
import { Box, IconButton, ListItem, alpha } from '@mui/material'

interface Props {
  type: 'prepend' | 'original' | 'delete' | 'append'
  ruleRaw: string
  onDelete: () => void
  onPrepend?: () => void
  onAppend?: () => void
}

export const RuleItem = (props: Props) => {
  const { type, ruleRaw, onDelete, onPrepend, onAppend } = props
  const isSortable = type === 'prepend' || type === 'append'
  const rule = ruleRaw.replace(',no-resolve', '')

  const ruleType = rule.match(/^[^,]+/)?.[0] ?? ''
  const proxyPolicy = rule.match(/[^,]+$/)?.[0] ?? ''
  const ruleContent = rule.slice(ruleType.length + 1, -proxyPolicy.length - 1)

  return (
    <ListItem
      dense
      disableGutters
      sx={(theme) => {
        const tone =
          type === 'delete'
            ? theme.palette.error.main
            : type === 'prepend' || type === 'append'
              ? theme.palette.success.main
              : theme.palette.text.primary
        return {
          position: 'relative',
          gap: 1,
          px: 1.25,
          py: 0.75,
          minHeight: 44,
          borderRadius: '12px',
          bgcolor:
            type === 'original'
              ? alpha(theme.palette.text.primary, 0.04)
              : alpha(tone, 0.1),
        }
      }}
    >
      <Box
        data-sortable-handle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
          flex: 1,
          cursor: isSortable ? 'grab' : 'default',
        }}
      >
        <Box
          sx={(theme) => ({
            flexShrink: 0,
            px: 0.75,
            py: 0.15,
            borderRadius: '6px',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontSize: 11,
            fontWeight: 650,
            lineHeight: 1.45,
          })}
        >
          {ruleType}
        </Box>
        <Box
          title={ruleContent || '-'}
          sx={{
            minWidth: 0,
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: type === 'delete' ? 'line-through' : 'none',
            opacity: type === 'delete' ? 0.55 : 1,
          }}
        >
          {ruleContent || '-'}
        </Box>
        <Box
          title={proxyPolicy}
          sx={(theme) => ({
            flexShrink: 0,
            maxWidth: '34%',
            px: 0.85,
            py: 0.15,
            borderRadius: '999px',
            bgcolor: alpha(theme.palette.text.primary, 0.06),
            fontSize: 11,
            fontWeight: 650,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
        >
          {proxyPolicy}
        </Box>
      </Box>
      {type === 'prepend' && (
        <IconButton size="small" onClick={onAppend}>
          <VerticalAlignBottomRounded fontSize="small" />
        </IconButton>
      )}
      {type === 'append' && (
        <IconButton size="small" onClick={onPrepend}>
          <VerticalAlignTopRounded fontSize="small" />
        </IconButton>
      )}
      <IconButton size="small" onClick={onDelete}>
        {type === 'delete' ? (
          <UndoRounded fontSize="small" />
        ) : (
          <DeleteForeverRounded fontSize="small" />
        )}
      </IconButton>
    </ListItem>
  )
}
