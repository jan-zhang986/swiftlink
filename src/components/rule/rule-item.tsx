import { Box, Typography, alpha, useTheme } from '@mui/material'
import { Rule } from 'tauri-plugin-mihomo-api'

interface Props {
  value: Rule & { lineNo: number }
}

const TYPE_COLOR: Record<string, string> = {
  MATCH: 'text.secondary',
  DIRECT: 'success.main',
  REJECT: 'error.main',
  'REJECT-DROP': 'error.main',
}

const RuleItem = (props: Props) => {
  const { value } = props
  const theme = useTheme()
  const ruleType =
    typeof value.type === 'string' ? value.type : value.type.Unknown
  const policyColor =
    TYPE_COLOR[value.proxy] ??
    (value.proxy === 'DIRECT' ? 'text.primary' : 'primary.main')

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 2,
        py: 0.7,
        minHeight: 40,
      }}
    >
      <Typography
        sx={{
          width: 28,
          flexShrink: 0,
          fontSize: 12,
          color: 'text.disabled',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value.lineNo}
      </Typography>
      <Box
        sx={{
          flexShrink: 0,
          px: 0.85,
          py: 0.2,
          borderRadius: '6px',
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: 'primary.main',
          fontSize: 11,
          fontWeight: 650,
          lineHeight: 1.4,
        }}
      >
        {ruleType}
      </Box>
      <Typography
        noWrap
        title={value.payload || '-'}
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          fontWeight: 510,
          userSelect: 'text',
        }}
      >
        {value.payload || '-'}
      </Typography>
      <Box
        sx={{
          flexShrink: 0,
          maxWidth: '36%',
          px: 1,
          py: 0.25,
          borderRadius: '999px',
          bgcolor: alpha(theme.palette.text.primary, 0.05),
          color: policyColor,
          fontSize: 12,
          fontWeight: 650,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={value.proxy}
      >
        {value.proxy}
      </Box>
    </Box>
  )
}

export default RuleItem
