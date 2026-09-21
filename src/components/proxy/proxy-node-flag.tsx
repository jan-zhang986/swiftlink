import { Box } from '@mui/material'

import { FLAG_EMOJI_FONT, splitProxyFlag } from '@/utils/proxy-flag'

interface Props {
  name: string
  size?: number
}

export const ProxyNodeFlag = ({ name, size = 28 }: Props) => {
  const { flag, iso } = splitProxyFlag(name)

  return (
    <Box
      title={iso || undefined}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(15, 23, 42, 0.06)'
            : 'rgba(255, 255, 255, 0.08)',
        fontFamily: FLAG_EMOJI_FONT,
        fontSize: size * 0.56,
        lineHeight: 1,
      }}
    >
      {flag || '•'}
    </Box>
  )
}
