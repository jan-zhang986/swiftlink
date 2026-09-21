import {
  CheckRounded,
  DeveloperBoardOutlined,
  DirectionsRounded,
  DnsOutlined,
  InfoOutlined,
  LanguageOutlined,
  LanguageRounded,
  LockOpenOutlined,
  MultipleStopRounded,
  SpeedOutlined,
  SubjectOutlined,
  UnfoldMoreRounded,
} from '@mui/icons-material'
import {
  Box,
  ButtonBase,
  ClickAwayListener,
  Dialog,
  DialogContent,
  Paper,
  Popper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useLockFn } from 'ahooks'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import type { BaseConfig } from 'tauri-plugin-mihomo-api'

import { Switch } from '@/components/base'
import { CompactDialogTitle } from '@/components/profile/compact-dialog-title'
import {
  compactDialogBackdropSx,
  compactDialogBodySx,
  compactEditorPaperSx,
} from '@/components/profile/compact-editor-dialog'
import { useClashMode } from '@/hooks/use-clash'
import { useProfiles } from '@/hooks/use-profiles'
import { useProxySelection } from '@/hooks/use-proxy-selection'
import { useServiceInstaller } from '@/hooks/use-service-installer'
import { useSystemProxyState } from '@/hooks/use-system-proxy-state'
import { useSystemState } from '@/hooks/use-system-state'
import { useTrafficData } from '@/hooks/use-traffic-data'
import { useVerge } from '@/hooks/use-verge'
import {
  useAppRefreshers,
  useClashConfigData,
  useProxiesData,
} from '@/providers/app-data-context'
import { getRuntimeState, patchClashMode } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'
import { setCacheData } from '@/services/query-client'
import { isInteractableMember, resolveMember } from '@/types/proxy-view'
import parseTraffic from '@/utils/parse-traffic'
import { FLAG_EMOJI_FONT, splitProxyFlag } from '@/utils/proxy-flag'

import { campusPanelSx, campusTitleSx } from './campus-panel'
import { ClashInfoCard } from './clash-info-card'
import { EnhancedTrafficStats } from './enhanced-traffic-stats'
import { IpInfoCard } from './ip-info-card'
import { SystemInfoCard } from './system-info-card'

const ONLINE_SINCE_KEY = 'clash-verge-proxy-online-since'
const CAPTURE_PATH_KEY = 'clash-verge-proxy-active-tab'

type CapturePath = 'system' | 'tun'

const formatDuration = (totalSeconds: number) => {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    '0',
  )
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const CLASH_MODES = ['rule', 'global', 'direct'] as const
type ClashMode = (typeof CLASH_MODES)[number]

const MODE_LABELS = {
  rule: 'home.components.clashMode.labels.rule',
  global: 'home.components.clashMode.labels.global',
  direct: 'home.components.clashMode.labels.direct',
} as const

const TOOLS = [
  {
    label: 'layout.components.navigation.tabs.profiles',
    path: '/profile',
    color: '#22C55E',
    icon: DnsOutlined,
  },
  {
    label: 'layout.components.navigation.tabs.connections',
    path: '/connections',
    color: '#14B8A6',
    icon: LanguageOutlined,
  },
  {
    label: 'layout.components.navigation.tabs.logs',
    path: '/logs',
    color: '#8B5CF6',
    icon: SubjectOutlined,
  },
  {
    label: 'layout.components.navigation.tabs.unlock',
    path: '/unlock',
    color: '#38BDF8',
    icon: LockOpenOutlined,
  },
  {
    label: 'home.page.cards.trafficStats',
    panel: 'traffic',
    color: '#F97316',
    icon: SpeedOutlined,
  },
  {
    label: 'home.components.clashInfo.title',
    panel: 'clash',
    color: '#F59E0B',
    icon: DeveloperBoardOutlined,
  },
  {
    label: 'home.components.systemInfo.title',
    panel: 'system',
    color: '#64748B',
    icon: InfoOutlined,
  },
] as const

type ToolboxPanel = 'traffic' | 'clash' | 'system'

const APP_AVATAR_COLORS = [
  '#22C55E',
  '#14B8A6',
  '#8B5CF6',
  '#38BDF8',
  '#F97316',
  '#64748B',
] as const

const profileInitials = (name?: string) => {
  const chars = Array.from((name || 'XL').trim())
  if (chars.length === 0) return 'XL'
  if (/[\u3400-\u9fff]/.test(chars[0] ?? '')) return chars[0] ?? 'X'
  return chars.slice(0, 2).join('').toUpperCase()
}

const profileAvatarColor = (uid: string) => {
  let hash = 0
  for (const char of uid) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return APP_AVATAR_COLORS[hash % APP_AVATAR_COLORS.length]
}

const panelSx = campusPanelSx

const captionSx = {
  display: 'block',
  mt: 1,
  fontSize: 13,
  color: 'text.secondary',
  fontWeight: 400,
} as const

const titleSx = campusTitleSx

const MODE_ICONS = {
  rule: MultipleStopRounded,
  global: LanguageRounded,
  direct: DirectionsRounded,
} as const

const menuPaperSx = {
  mt: 1,
  p: 0.75,
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.14)',
  overflow: 'hidden',
} as const

export const CampusDashboard = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const { verge, mutateVerge, patchVerge } = useVerge()
  const { indicator, toggleSystemProxy } = useSystemProxyState()
  const { runState, isTunModeAvailable, isLoading, mutateSystemState } =
    useSystemState()
  const { installServiceAndRestartCore } = useServiceInstaller()
  const { clashConfig } = useClashConfigData()
  const { refreshClashConfig, refreshProxy } = useAppRefreshers()
  const { data: backendMode, refetch: refetchBackendMode } = useClashMode(true)
  const {
    response: { data: traffic },
  } = useTrafficData()
  const { proxyView } = useProxiesData()
  const { profiles, current, patchProfiles } = useProfiles()
  const { changeProxy } = useProxySelection({
    onSuccess: () => {
      void refreshProxy()
    },
    onError: (error) => {
      showNotice.error(error)
    },
  })

  const [capture, setCapture] = useState<CapturePath>(() => {
    const saved = localStorage.getItem(CAPTURE_PATH_KEY)
    return saved === 'tun' || saved === 'system' ? saved : 'system'
  })
  const [elapsed, setElapsed] = useState(0)
  const [modeAnchor, setModeAnchor] = useState<HTMLElement | null>(null)
  const [serverAnchor, setServerAnchor] = useState<HTMLElement | null>(null)
  const [optimisticMode, setOptimisticMode] = useState<ClashMode | null>(null)
  const [toolboxPanel, setToolboxPanel] = useState<ToolboxPanel | null>(null)

  const tunOn = Boolean(verge?.enable_tun_mode && isTunModeAvailable)
  const systemOn = Boolean(verge?.enable_system_proxy ?? indicator)
  const enabled = capture === 'tun' ? tunOn : systemOn
  const [upTotal, upTotalUnit] = parseTraffic(traffic?.upTotal || 0)
  const [downTotal, downTotalUnit] = parseTraffic(traffic?.downTotal || 0)
  const [upSpeed, upSpeedUnit] = parseTraffic(traffic?.up || 0)
  const [downSpeed, downSpeedUnit] = parseTraffic(traffic?.down || 0)

  useEffect(() => {
    if (!enabled) {
      sessionStorage.removeItem(ONLINE_SINCE_KEY)
      return
    }
    const stored = Number(sessionStorage.getItem(ONLINE_SINCE_KEY))
    const startedAt =
      Number.isFinite(stored) && stored > 0 ? stored : Date.now()
    if (startedAt !== stored) {
      sessionStorage.setItem(ONLINE_SINCE_KEY, String(startedAt))
    }
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
    const immediate = window.setTimeout(tick, 0)
    const timer = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(immediate)
      window.clearInterval(timer)
    }
  }, [enabled])

  const rawMode = clashConfig?.mode ?? backendMode
  const resolvedMode =
    typeof rawMode === 'string' ? rawMode.toLowerCase() : 'rule'
  const mode = optimisticMode ?? resolvedMode
  const modeLabel =
    mode in MODE_LABELS
      ? t(MODE_LABELS[mode as keyof typeof MODE_LABELS])
      : mode.toUpperCase()

  const selectorGroup = useMemo(() => {
    if (!proxyView || mode === 'direct') return null
    if (mode === 'global') return proxyView.global
    return (
      proxyView.groups.find(
        (group) =>
          !group.hidden &&
          (group.type === 'Selector' || group.type === 'URLTest') &&
          group.now,
      ) ??
      proxyView.groups.find(
        (group) =>
          !group.hidden &&
          (group.type === 'Selector' || group.type === 'URLTest'),
      ) ??
      null
    )
  }, [mode, proxyView])

  const serverOptions = useMemo(() => {
    if (!proxyView || !selectorGroup) return []
    const names: string[] = []
    const seen = new Set<string>()
    for (const memberRef of selectorGroup.members) {
      try {
        const member = resolveMember(proxyView, memberRef)
        if (!isInteractableMember(member) || seen.has(member.ref.name)) continue
        seen.add(member.ref.name)
        names.push(member.ref.name)
      } catch {
        continue
      }
    }
    return names
  }, [proxyView, selectorGroup])

  const currentServer =
    selectorGroup?.now || t('home.components.currentProxy.labels.noActiveNode')

  const recommended = useMemo(
    () =>
      (profiles?.items ?? [])
        .filter((item) => item?.type === 'remote' || item?.type === 'local')
        .slice(0, 4),
    [profiles?.items],
  )

  const persistCapture = (next: CapturePath) => {
    setCapture(next)
    localStorage.setItem(CAPTURE_PATH_KEY, next)
  }

  const ensureTunService = async () => {
    if (isTunModeAvailable) return true
    try {
      await installServiceAndRestartCore()
      await mutateSystemState()
      const state = await getRuntimeState()
      if (!state.tunCapable) {
        showNotice.error(
          'settings.sections.proxyControl.messages.installedCoreNotOnService',
        )
        return false
      }
      return true
    } catch {
      return false
    }
  }

  const setTunEnabled = async (value: boolean) => {
    if (value && !(await ensureTunService())) {
      return false
    }
    mutateVerge({ ...verge, enable_tun_mode: value }, false)
    await patchVerge({ enable_tun_mode: value })
    return true
  }

  const handleToggle = useLockFn(async (checked: boolean) => {
    try {
      if (capture === 'tun') {
        await setTunEnabled(checked)
        return
      }
      if (checked && !isLoading && runState.mode === 'NotRunning') {
        showNotice.error('settings.feedback.errors.sysproxy.coreNotReady')
        return
      }
      await toggleSystemProxy(checked)
    } catch (error: any) {
      showNotice.error(error?.message || error?.toString())
    }
  })

  const handleCaptureChange = useLockFn(async (next: CapturePath) => {
    if (next === capture) return
    if (!enabled) {
      persistCapture(next)
      return
    }
    try {
      if (next === 'tun') {
        const applied = await setTunEnabled(true)
        if (!applied) return
        persistCapture(next)
        await toggleSystemProxy(false)
        return
      }
      persistCapture(next)
      await setTunEnabled(false)
      if (!isLoading && runState.mode === 'NotRunning') {
        showNotice.error('settings.feedback.errors.sysproxy.coreNotReady')
        return
      }
      await toggleSystemProxy(true)
    } catch (error: any) {
      showNotice.error(error?.message || error?.toString())
    }
  })

  const handleSelectProfile = useLockFn(async (uid: string) => {
    await patchProfiles({ current: uid })
  })

  const handleChangeMode = useLockFn(async (next: ClashMode) => {
    setModeAnchor(null)
    if (next === mode) return
    setOptimisticMode(next)
    try {
      await patchClashMode(next)
      setCacheData<BaseConfig>(['getClashConfig'], (old) =>
        old ? { ...old, mode: next } : old,
      )
      await Promise.allSettled([refreshClashConfig(), refetchBackendMode()])
    } catch (error) {
      setOptimisticMode(null)
      showNotice.error(error)
      return
    }
    setOptimisticMode(null)
  })

  const handleChangeServer = (name: string) => {
    setServerAnchor(null)
    if (!selectorGroup || name === selectorGroup.now) return
    changeProxy(
      selectorGroup.name,
      name,
      selectorGroup.now,
      selectorGroup.fixed,
    )
  }

  const optionRowSx = (selected: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    width: '100%',
    px: 1.25,
    py: 1,
    borderRadius: '12px',
    textAlign: 'left' as const,
    bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
    color: selected ? 'primary.main' : 'text.primary',
    '&:hover': {
      bgcolor: selected
        ? alpha(theme.palette.primary.main, 0.16)
        : 'action.hover',
    },
  })

  const valueTag = (
    label: string,
    bgcolor: string,
    withFlag = false,
    open = false,
  ) => {
    const { flag, label: text } = withFlag
      ? splitProxyFlag(label)
      : { flag: '', label }
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          maxWidth: '100%',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 0,
            bgcolor,
            color: '#fff',
            borderRadius: '6px',
            px: 0.75,
            py: 0.15,
            minHeight: 22,
          }}
        >
          {flag ? (
            <Box
              component="span"
              sx={{
                fontFamily: FLAG_EMOJI_FONT,
                fontSize: 14,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {flag}
            </Box>
          ) : null}
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </Typography>
        </Box>
        <UnfoldMoreRounded
          sx={{
            fontSize: 16,
            color: 'text.secondary',
            flexShrink: 0,
            transition: 'transform 160ms ease',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        px: { xs: 2.5, md: 4 },
        pb: 2.5,
        minHeight: { md: '100%' },
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 1fr) minmax(0, 1fr)',
        },
        alignItems: 'stretch',
      }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}
      >
        <Box sx={panelSx}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                minWidth: 0,
                flex: 1,
                mr: 1,
              }}
            >
              <Typography sx={{ ...titleSx, flexShrink: 0 }}>
                {t('home.page.dashboard.vpn')}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: '3px',
                  borderRadius: '999px',
                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                  minWidth: 0,
                }}
              >
                {(
                  [
                    {
                      id: 'system' as const,
                      label: t('home.page.dashboard.captureSystem'),
                    },
                    {
                      id: 'tun' as const,
                      label: t('home.page.dashboard.captureTun'),
                    },
                  ] as const
                ).map((item) => {
                  const selected = capture === item.id
                  return (
                    <ButtonBase
                      key={item.id}
                      onClick={() => void handleCaptureChange(item.id)}
                      sx={{
                        px: 1.25,
                        py: 0.35,
                        borderRadius: '999px',
                        fontSize: 12,
                        fontWeight: selected ? 650 : 500,
                        color: selected ? 'primary.main' : 'text.secondary',
                        bgcolor: selected ? 'background.paper' : 'transparent',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </ButtonBase>
                  )
                })}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {enabled ? '开' : '关'}
              </Typography>
              <Switch
                checked={Boolean(enabled)}
                onChange={(_, checked) => void handleToggle(checked)}
              />
            </Box>
          </Box>
          <ClickAwayListener
            onClickAway={() => {
              setModeAnchor(null)
              setServerAnchor(null)
            }}
          >
            <Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  columnGap: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 650,
                      letterSpacing: '-0.04em',
                      lineHeight: '22px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatDuration(enabled ? elapsed : 0)}
                  </Typography>
                  <Typography sx={captionSx}>
                    {t('home.page.dashboard.onlineTime')}
                  </Typography>
                </Box>
                <Box
                  onClick={(event) => {
                    setServerAnchor(null)
                    setModeAnchor((current) =>
                      current ? null : event.currentTarget,
                    )
                  }}
                  sx={{ cursor: 'pointer', minWidth: 0 }}
                >
                  {valueTag(modeLabel, '#2F3A4A', false, Boolean(modeAnchor))}
                  <Typography sx={captionSx}>
                    {t('home.page.dashboard.currentMode')}
                  </Typography>
                </Box>
                <Box
                  onClick={(event) => {
                    if (!selectorGroup || serverOptions.length === 0) return
                    setModeAnchor(null)
                    setServerAnchor((current) =>
                      current ? null : event.currentTarget,
                    )
                  }}
                  sx={{
                    cursor:
                      selectorGroup && serverOptions.length > 0
                        ? 'pointer'
                        : 'default',
                    minWidth: 0,
                  }}
                >
                  {valueTag(
                    currentServer,
                    theme.palette.primary.main,
                    true,
                    Boolean(serverAnchor),
                  )}
                  <Typography sx={captionSx}>
                    {t('home.page.dashboard.currentServer')}
                  </Typography>
                </Box>
              </Box>
              <Popper
                open={Boolean(modeAnchor)}
                anchorEl={modeAnchor}
                placement="bottom-start"
                sx={{ zIndex: (zTheme) => zTheme.zIndex.modal }}
              >
                <Paper sx={{ ...menuPaperSx, minWidth: 168 }}>
                  {CLASH_MODES.map((item) => {
                    const selected = item === mode
                    const Icon = MODE_ICONS[item]
                    return (
                      <ButtonBase
                        key={item}
                        onClick={() => void handleChangeMode(item)}
                        sx={optionRowSx(selected)}
                      >
                        <Icon sx={{ fontSize: 18, flexShrink: 0 }} />
                        <Typography
                          sx={{
                            flex: 1,
                            fontSize: 13,
                            fontWeight: selected ? 650 : 500,
                            textAlign: 'left',
                          }}
                        >
                          {t(MODE_LABELS[item])}
                        </Typography>
                        {selected ? (
                          <CheckRounded sx={{ fontSize: 16, flexShrink: 0 }} />
                        ) : null}
                      </ButtonBase>
                    )
                  })}
                </Paper>
              </Popper>
              <Popper
                open={Boolean(serverAnchor)}
                anchorEl={serverAnchor}
                placement="bottom-start"
                sx={{ zIndex: (zTheme) => zTheme.zIndex.modal }}
              >
                <Paper
                  sx={{
                    ...menuPaperSx,
                    minWidth: 220,
                    maxWidth: 280,
                    maxHeight: 280,
                    overflowY: 'auto',
                  }}
                >
                  {serverOptions.map((name) => {
                    const selected = name === selectorGroup?.now
                    const { flag, label } = splitProxyFlag(name)
                    return (
                      <ButtonBase
                        key={name}
                        onClick={() => handleChangeServer(name)}
                        sx={optionRowSx(selected)}
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            bgcolor: selected
                              ? alpha(theme.palette.primary.main, 0.16)
                              : alpha(theme.palette.text.primary, 0.06),
                            fontFamily: FLAG_EMOJI_FONT,
                            fontSize: 16,
                            lineHeight: 1,
                          }}
                        >
                          {flag || '•'}
                        </Box>
                        <Typography
                          noWrap
                          sx={{
                            flex: 1,
                            fontSize: 13,
                            fontWeight: selected ? 650 : 500,
                            textAlign: 'left',
                          }}
                        >
                          {label}
                        </Typography>
                        {selected ? (
                          <CheckRounded sx={{ fontSize: 16, flexShrink: 0 }} />
                        ) : null}
                      </ButtonBase>
                    )
                  })}
                </Paper>
              </Popper>
            </Box>
          </ClickAwayListener>
          <Box
            sx={{
              mt: 3,
              pt: 2.25,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            {(
              [
                {
                  value: upSpeed,
                  unit: `${upSpeedUnit}/s`,
                  total: `${upTotal} ${upTotalUnit}`,
                  label: t('shared.labels.uploaded'),
                },
                {
                  value: downSpeed,
                  unit: `${downSpeedUnit}/s`,
                  total: `${downTotal} ${downTotalUnit}`,
                  label: t('shared.labels.downloaded'),
                },
              ] as const
            ).map((item) => (
              <Box key={item.label} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.5,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 650,
                      letterSpacing: '-0.04em',
                      lineHeight: '22px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 650,
                      color: 'text.secondary',
                    }}
                  >
                    {item.unit}
                  </Typography>
                </Box>
                <Typography sx={captionSx}>
                  {item.label} · {item.total}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{ ...panelSx, flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Typography
            sx={{
              ...titleSx,
              pb: 1.5,
              mb: 2.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            {t('home.page.dashboard.toolbox')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              rowGap: 3,
              columnGap: 1,
              flex: 1,
              alignContent: 'start',
              pt: 0.5,
            }}
          >
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <ButtonBase
                  key={tool.label}
                  onClick={() => {
                    if ('path' in tool) {
                      navigate(tool.path)
                      return
                    }
                    setToolboxPanel(tool.panel)
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.25,
                    py: 0.5,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      bgcolor: tool.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: 'text.secondary',
                      fontWeight: 400,
                      lineHeight: 1.2,
                    }}
                  >
                    {t(tool.label)}
                  </Typography>
                </ButtonBase>
              )
            })}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}
      >
        <Box
          sx={{
            ...panelSx,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.25,
            }}
          >
            <Typography sx={titleSx}>
              {t('home.page.dashboard.recommended')}
            </Typography>
            <Typography
              component="button"
              onClick={() => navigate('/profile')}
              sx={{
                border: 0,
                bgcolor: 'transparent',
                color: 'primary.main',
                fontSize: 13,
                fontWeight: 510,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                p: 0,
              }}
            >
              {t('home.page.dashboard.allApps')}
            </Typography>
          </Box>
          {recommended.length === 0 ? (
            <ButtonBase
              onClick={() => navigate('/profile')}
              sx={{
                minHeight: 64,
                borderRadius: '12px',
                border: `1px dashed ${theme.palette.divider}`,
                color: 'text.secondary',
                fontSize: 13,
              }}
            >
              {t('proxies.page.empty.noSubscriptions.title')}
            </ButtonBase>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {recommended.map((item) => {
                const selected = item.uid === current?.uid
                const color = profileAvatarColor(item.uid)
                const typeKey =
                  item.type === 'local'
                    ? 'profiles.modals.profileForm.types.local'
                    : 'profiles.modals.profileForm.types.remote'
                return (
                  <ButtonBase
                    key={item.uid}
                    onClick={() => void handleSelectProfile(item.uid)}
                    sx={{
                      width: '100%',
                      minHeight: 52,
                      px: 1,
                      py: 0.75,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      textAlign: 'left',
                      bgcolor: selected
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: selected
                          ? alpha(theme.palette.primary.main, 0.14)
                          : alpha(theme.palette.text.primary, 0.04),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        flexShrink: 0,
                        bgcolor: alpha(color, 0.16),
                        color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {profileInitials(item.name)}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: selected ? 650 : 510,
                          letterSpacing: '-0.01em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.15,
                          fontSize: 11,
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.desc?.trim() || t(typeKey)}
                      </Typography>
                    </Box>
                    {selected ? (
                      <CheckRounded
                        sx={{
                          fontSize: 16,
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                  </ButtonBase>
                )
              })}
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <IpInfoCard />
        </Box>
      </Box>

      <Dialog
        open={Boolean(toolboxPanel)}
        onClose={() => setToolboxPanel(null)}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: compactDialogBackdropSx },
          paper: {
            sx: {
              ...compactEditorPaperSx,
              width: toolboxPanel === 'traffic' ? 720 : 440,
            },
          },
        }}
      >
        <CompactDialogTitle onClose={() => setToolboxPanel(null)}>
          {toolboxPanel === 'traffic' && t('home.page.cards.trafficStats')}
          {toolboxPanel === 'clash' && t('home.components.clashInfo.title')}
          {toolboxPanel === 'system' && t('home.components.systemInfo.title')}
        </CompactDialogTitle>
        <DialogContent sx={compactDialogBodySx}>
          {toolboxPanel === 'traffic' && <EnhancedTrafficStats />}
          {toolboxPanel === 'clash' && <ClashInfoCard plain />}
          {toolboxPanel === 'system' && <SystemInfoCard plain />}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
