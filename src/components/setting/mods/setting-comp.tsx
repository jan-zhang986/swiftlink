import { ChevronRightRounded } from '@mui/icons-material'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import React, { ReactNode, useState } from 'react'

import isAsyncFunction from '@/utils/is-async-function'

interface ItemProps {
  label: ReactNode
  extra?: ReactNode
  children?: ReactNode
  secondary?: ReactNode
  onClick?: () => void | Promise<any>
}

const rowSx = {
  minHeight: 48,
  py: 0.75,
  px: 2,
  gap: 2,
  alignItems: 'center',
} as const

const labelSx = {
  m: 0,
  minWidth: 0,
  flex: '1 1 auto',
  '& .MuiListItemText-primary': {
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .MuiListItemText-secondary': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
} as const

const controlSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flex: '0 1 auto',
  minWidth: 0,
  maxWidth: '52%',
  gap: 0.75,
  '& .MuiInputBase-root': {
    minWidth: 120,
    maxWidth: 180,
  },
  '& .MuiSelect-select': {
    py: '8px',
  },
  '& .MuiInput-root': {
    width: '100%',
    maxWidth: 180,
  },
  '& .MuiTypography-root': {
    py: 0,
    pr: 0,
    fontSize: 13,
    color: 'text.secondary',
  },
} as const

export const SettingItem: React.FC<ItemProps> = ({
  label,
  extra,
  children,
  secondary,
  onClick,
}) => {
  const clickable = !!onClick

  const primary = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        minWidth: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Box>
      {extra ? extra : null}
    </Box>
  )

  const [isLoading, setIsLoading] = useState(false)
  const handleClick = () => {
    if (onClick) {
      if (isAsyncFunction(onClick)) {
        setIsLoading(true)
        onClick()!.finally(() => setIsLoading(false))
      } else {
        onClick()
      }
    }
  }

  return clickable ? (
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick} disabled={isLoading} sx={rowSx}>
        <ListItemText primary={primary} secondary={secondary} sx={labelSx} />
        {isLoading ? (
          <CircularProgress color="inherit" size={18} />
        ) : (
          <ChevronRightRounded sx={{ color: 'text.secondary', fontSize: 22 }} />
        )}
      </ListItemButton>
    </ListItem>
  ) : (
    <ListItem sx={rowSx} disableGutters>
      <ListItemText primary={primary} secondary={secondary} sx={labelSx} />
      {children ? <Box sx={controlSx}>{children}</Box> : null}
    </ListItem>
  )
}

export const SettingList: React.FC<{
  title: string
  children: ReactNode
}> = ({ title, children }) => (
  <List sx={{ py: 0.5, px: 0.5 }}>
    <ListSubheader
      sx={{
        background: 'transparent',
        fontSize: 15,
        fontWeight: 590,
        letterSpacing: '-0.02em',
        lineHeight: 1.3,
        px: 2,
        py: 1.5,
        color: 'text.primary',
      }}
      disableSticky
    >
      {title}
    </ListSubheader>

    {children}
  </List>
)
