import {
  CheckCircleOutlineRounded,
  DataUsageRounded,
  EventAvailableRounded,
} from '@mui/icons-material'
import { alpha, Box, ListItemButton, styled, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { BaseLoading } from '@/components/base'
import { useProxyDelayState } from '@/hooks/use-proxy-delay-state'
import delayManager from '@/services/delay'
import {
  memberDetails,
  type ProxyGroupView,
  type ResolvedProxyMember,
} from '@/types/proxy-view'
import { splitProxyFlag, parseSubscriptionInfo } from '@/utils/proxy-flag'

import { ProxyNodeFlag } from './proxy-node-flag'

interface Props {
  group: ProxyGroupView
  member: ResolvedProxyMember
  selected: boolean
  showType?: boolean
  onClick?: (member: ResolvedProxyMember) => void
}

export const ProxyItemMini = (props: Props) => {
  const { group, member, selected, showType = true, onClick } = props
  const details = memberDetails(member)
  const unresolved = member.kind === 'unresolved'
  const name = member.ref.name
  const { label, iso } = splitProxyFlag(name)
  const type = unresolved ? member.ref.reason : (details?.type ?? '')
  const now = member.kind === 'group' ? member.group.now : undefined

  const { t } = useTranslation()

  const { delayValue, isPreset, timeout, onDelay } = useProxyDelayState(
    member,
    group.name,
  )
  const info = parseSubscriptionInfo(name)
  const InfoIcon = /到期|过期|重置/.test(name)
    ? EventAvailableRounded
    : DataUsageRounded

  if (info) {
    return (
      <Box
        title={name}
        sx={{
          height: 64,
          borderRadius: '16px',
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
          bgcolor: (theme) =>
            theme.palette.mode === 'light' ? '#ffffff' : '#282A36',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          }}
        >
          <InfoIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            noWrap
            sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.3 }}
          >
            {info.label}
          </Typography>
          <Typography
            noWrap
            sx={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.35,
            }}
          >
            {info.value}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <ListItemButton
      dense
      disabled={unresolved}
      selected={!unresolved && selected}
      onClick={unresolved ? undefined : () => onClick?.(member)}
      sx={[
        {
          height: 64,
          borderRadius: '16px',
          px: 1.25,
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
        },
        ({ palette: { mode, primary } }) => {
          const bgcolor = mode === 'light' ? '#ffffff' : '#282A36'
          const showDelay = delayValue > 0

          return {
            '&:hover .the-check': { display: !showDelay ? 'block' : 'none' },
            '&:hover .the-delay': { display: showDelay ? 'block' : 'none' },
            '&:hover .the-icon': { display: 'none' },
            '& .the-pin, & .the-unpin': {
              position: 'absolute',
              fontSize: '12px',
              top: '-5px',
              right: '-5px',
            },
            '& .the-unpin': { filter: 'grayscale(1)' },
            '&.Mui-selected': {
              bgcolor:
                mode === 'light'
                  ? alpha(primary.main, 0.1)
                  : alpha(primary.main, 0.22),
              outline: `2px solid ${primary.main}`,
              outlineOffset: -2,
            },
            backgroundColor: bgcolor,
          }
        },
      ]}
    >
      <ProxyNodeFlag name={name} />
      <Box
        title={`${name}\n${now ?? ''}`}
        sx={{ overflow: 'hidden', flex: 1, minWidth: 0 }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}
        >
          <Typography
            variant="body2"
            component="div"
            color="text.primary"
            sx={{
              minWidth: 0,
              fontWeight: 650,
              fontSize: 13,
              letterSpacing: '-0.02em',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
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
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              }}
            >
              {iso}
            </Box>
          ) : null}
        </Box>

        {showType && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              flex: 'none',
              marginTop: '4px',
            }}
          >
            {now && (
              <Typography
                variant="body2"
                component="div"
                color="text.secondary"
                sx={{
                  display: 'block',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  marginRight: '8px',
                }}
              >
                {now}
              </Typography>
            )}
            <TypeBox color="text.secondary" component="span">
              {type}
            </TypeBox>
            {!unresolved && details?.udp && (
              <TypeBox color="text.secondary" component="span">
                UDP
              </TypeBox>
            )}
            {!unresolved && details?.xudp && (
              <TypeBox color="text.secondary" component="span">
                XUDP
              </TypeBox>
            )}
            {!unresolved && details?.tfo && (
              <TypeBox color="text.secondary" component="span">
                TFO
              </TypeBox>
            )}
            {!unresolved && details?.mptcp && (
              <TypeBox color="text.secondary" component="span">
                MPTCP
              </TypeBox>
            )}
            {!unresolved && details?.smux && (
              <TypeBox color="text.secondary" component="span">
                SMUX
              </TypeBox>
            )}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          ml: 0.5,
          flexShrink: 0,
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

        {!unresolved && delayValue >= 0 && (
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
        {!unresolved &&
          type !== 'Direct' &&
          delayValue !== -2 &&
          delayValue < 0 &&
          selected && (
            <CheckCircleOutlineRounded
              className="the-icon"
              sx={{ fontSize: 16, mr: 0.5, display: 'block' }}
            />
          )}
      </Box>
      {!unresolved && group.fixed && group.fixed === name && (
        <span
          className={name === group.now ? 'the-pin' : 'the-unpin'}
          title={
            group.type === 'URLTest'
              ? t('proxies.page.labels.delayCheckReset')
              : ''
          }
        >
          📌
        </span>
      )}
    </ListItemButton>
  )
}

const Widget = styled(Box)(({ theme: { typography } }) => ({
  padding: '2px 4px',
  fontSize: 13,
  fontWeight: 650,
  fontFamily: typography.fontFamily,
  fontVariantNumeric: 'tabular-nums',
  borderRadius: '8px',
}))

const TypeBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'component',
})<{ component?: React.ElementType }>(({ theme }) => ({
  display: 'inline-block',
  color: theme.palette.text.secondary,
  backgroundColor: alpha(theme.palette.text.primary, 0.06),
  borderRadius: 8,
  fontSize: 10,
  fontFamily: theme.typography.fontFamily,
  marginRight: '4px',
  marginTop: 'auto',
  padding: '0 6px',
  lineHeight: 1.6,
}))
