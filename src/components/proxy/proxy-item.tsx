import { CheckCircleOutlineRounded } from '@mui/icons-material'
import {
  alpha,
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  type SxProps,
  type Theme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { BaseLoading } from '@/components/base'
import { useProxyDelayState } from '@/hooks/use-proxy-delay-state'
import delayManager from '@/services/delay'
import {
  memberDetails,
  type ProxyGroupView,
  type ResolvedProxyMember,
} from '@/types/proxy-view'
import { splitProxyFlag } from '@/utils/proxy-flag'

import { ProxyNodeFlag } from './proxy-node-flag'

interface Props {
  group: ProxyGroupView
  member: ResolvedProxyMember
  selected: boolean
  showType?: boolean
  sx?: SxProps<Theme>
  onClick?: (member: ResolvedProxyMember) => void
}

const Widget = styled(Box)(() => ({
  padding: '3px 6px',
  fontSize: 14,
  borderRadius: '8px',
}))

const TypeBox = styled('span')(({ theme }) => ({
  display: 'inline-block',
  color: theme.palette.text.secondary,
  backgroundColor: alpha(theme.palette.text.primary, 0.06),
  borderRadius: 8,
  fontSize: 10,
  marginRight: '4px',
  padding: '0 6px',
  lineHeight: 1.6,
}))

export const ProxyItem = (props: Props) => {
  const { t } = useTranslation()
  const { group, member, selected, showType = true, sx, onClick } = props
  const details = memberDetails(member)
  const unresolved = member.kind === 'unresolved'
  const name = member.ref.name
  const { label, iso } = splitProxyFlag(name)
  const type = unresolved ? member.ref.reason : (details?.type ?? '')
  const now = member.kind === 'group' ? member.group.now : undefined

  const { delayValue, isPreset, timeout, onDelay } = useProxyDelayState(
    member,
    group.name,
  )

  return (
    <ListItem sx={sx}>
      <ListItemButton
        dense
        disabled={unresolved}
        selected={!unresolved && selected}
        onClick={unresolved ? undefined : () => onClick?.(member)}
        sx={[
          { borderRadius: '16px', gap: 1, px: 1.25 },
          ({ palette: { mode, primary } }) => {
            const bgcolor = mode === 'light' ? '#ffffff' : '#282A36'
            const showDelay = delayValue > 0

            return {
              '&:hover .the-check': { display: !showDelay ? 'block' : 'none' },
              '&:hover .the-delay': { display: showDelay ? 'block' : 'none' },
              '&:hover .the-icon': { display: 'none' },
              '&.Mui-selected': {
                bgcolor:
                  mode === 'light'
                    ? alpha(primary.main, 0.1)
                    : alpha(primary.main, 0.22),
                outline: `2px solid ${primary.main}`,
                outlineOffset: -2,
              },
              backgroundColor: bgcolor,
              marginBottom: '8px',
              height: '48px',
            }
          },
        ]}
      >
        <ProxyNodeFlag name={name} size={30} />
        <ListItemText
          title={name}
          secondary={
            <>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  marginRight: '8px',
                  fontSize: '14px',
                  fontWeight: 650,
                  color: 'text.primary',
                  maxWidth: '100%',
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
                  {showType && now && ` - ${now}`}
                </Box>
                {iso ? (
                  <Box
                    component="span"
                    sx={{
                      flexShrink: 0,
                      px: 0.6,
                      height: 16,
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: '6px',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: 'primary.main',
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.12),
                    }}
                  >
                    {iso}
                  </Box>
                ) : null}
              </Box>
              {showType && <TypeBox>{type}</TypeBox>}
              {!unresolved && showType && details?.udp && (
                <TypeBox>UDP</TypeBox>
              )}
              {!unresolved && showType && details?.xudp && (
                <TypeBox>XUDP</TypeBox>
              )}
              {!unresolved && showType && details?.tfo && (
                <TypeBox>TFO</TypeBox>
              )}
              {!unresolved && showType && details?.mptcp && (
                <TypeBox>MPTCP</TypeBox>
              )}
              {!unresolved && showType && details?.smux && (
                <TypeBox>SMUX</TypeBox>
              )}
            </>
          }
        />

        <ListItemIcon
          sx={{
            justifyContent: 'flex-end',
            color: 'primary.main',
            display: isPreset ? 'none' : '',
          }}
        >
          {!unresolved && delayValue === -2 && (
            <Widget>
              <BaseLoading />
            </Widget>
          )}

          {!unresolved && delayValue !== -2 && (
            <Widget
              className="the-check"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void onDelay()
              }}
              sx={({ palette }) => ({
                display: 'none',
                ':hover': { bgcolor: alpha(palette.primary.main, 0.15) },
              })}
            >
              {t('shared.actions.check')}
            </Widget>
          )}

          {!unresolved && delayValue > 0 && (
            <Widget
              className="the-delay"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void onDelay()
              }}
              sx={({ palette }) => ({
                color: delayManager.formatDelayColor(delayValue, timeout),
                ':hover': { bgcolor: alpha(palette.primary.main, 0.15) },
              })}
            >
              {delayManager.formatDelay(delayValue, timeout)}
            </Widget>
          )}

          {!unresolved && delayValue !== -2 && delayValue <= 0 && selected && (
            <CheckCircleOutlineRounded
              className="the-icon"
              sx={{ fontSize: 16 }}
            />
          )}
        </ListItemIcon>
      </ListItemButton>
    </ListItem>
  )
}
