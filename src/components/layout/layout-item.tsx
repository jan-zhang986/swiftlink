import {
  alpha,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useMatch, useNavigate, useResolvedPath } from 'react-router'

import type { SortableItemRenderProps } from '@/components/base/sortable-item'
import { useVerge } from '@/hooks/use-verge'

interface Props {
  to: string
  children: string
  icon: ReactNode[]
  sortable?: SortableItemRenderProps
}
export const LayoutItem = (props: Props) => {
  const { to, children, icon, sortable } = props
  const { verge } = useVerge()
  const { menu_icon } = verge ?? {}
  const navCollapsed = verge?.collapse_navbar ?? false
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end: true })
  const navigate = useNavigate()

  const effectiveMenuIcon =
    navCollapsed && menu_icon === 'disable' ? 'monochrome' : menu_icon

  return (
    <ListItem
      ref={sortable?.ref}
      style={sortable?.style}
      sx={{ py: 0.5, maxWidth: 250, mx: 'auto', padding: '4px 0px' }}
    >
      <ListItemButton
        ref={sortable?.handleRef}
        selected={!!match}
        disableRipple
        sx={[
          {
            borderRadius: 2,
            margin: 0,
            paddingLeft: 1,
            paddingRight: 1,
            cursor: 'pointer',
            bgcolor: 'transparent',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2px',
            '& .MuiListItemText-primary': {
              color: 'rgba(255, 255, 255, 0.86)',
              fontWeight: 500,
            },
            '& .nav-item-icon': {
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.95)',
              bgcolor: 'transparent',
            },
          },
          ({ palette: { primary } }) => ({
            '&:hover': {
              bgcolor: 'transparent',
              '& .nav-item-icon': {
                bgcolor: alpha('#ffffff', 0.16),
              },
            },
            '&.Mui-selected': {
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'transparent' },
              '& .nav-item-icon': {
                bgcolor: '#ffffff',
                color: primary.main,
              },
              '& .MuiListItemText-primary': {
                color: '#ffffff',
                fontWeight: 600,
              },
            },
          }),
        ]}
        title={children}
        aria-label={children}
        onClick={() => navigate(to)}
      >
        {(effectiveMenuIcon === 'monochrome' || !effectiveMenuIcon) && (
          <ListItemIcon className="nav-item-icon" sx={{ cursor: 'inherit' }}>
            {icon[0]}
          </ListItemIcon>
        )}
        {effectiveMenuIcon === 'colorful' && (
          <ListItemIcon className="nav-item-icon" sx={{ cursor: 'inherit' }}>
            {icon[1]}
          </ListItemIcon>
        )}
        <ListItemText
          sx={{
            display: 'block',
            textAlign: 'center',
            margin: 0,
            minWidth: 0,
            flex: 'none',
          }}
          primary={children}
        />
      </ListItemButton>
    </ListItem>
  )
}
