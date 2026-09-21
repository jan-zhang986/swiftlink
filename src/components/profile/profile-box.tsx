import { alpha, Box, styled } from '@mui/material'

export const ProfileBox = styled(Box)(
  ({ theme, 'aria-selected': selected }) => {
    const { mode, primary, text } = theme.palette
    const isSelected = !!selected
    const isLight = mode === 'light'

    return {
      position: 'relative',
      display: 'block',
      cursor: 'pointer',
      textAlign: 'left',
      padding: '16px 18px 14px',
      boxSizing: 'border-box',
      backgroundColor: isSelected
        ? alpha(primary.main, isLight ? 0.1 : 0.2)
        : isLight
          ? '#ffffff'
          : '#282A36',
      borderRadius: '18px',
      outline: isSelected
        ? `2px solid ${primary.main}`
        : '2px solid transparent',
      outlineOffset: -2,
      color: isLight ? text.secondary : alpha(text.secondary, 0.7),
      transition: 'background-color 160ms ease, outline-color 160ms ease',
      '& h2': {
        color: isSelected ? primary.main : text.primary,
      },
    }
  },
)
