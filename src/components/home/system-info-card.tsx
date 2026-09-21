import {
  InfoOutlined,
  SettingsOutlined,
  AdminPanelSettingsOutlined,
  DnsOutlined,
  ExtensionOutlined,
} from '@mui/icons-material'
import { Typography, Stack, Chip, IconButton, Box } from '@mui/material'
import { useLockFn } from 'ahooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useServiceInstaller } from '@/hooks/use-service-installer'
import { useSystemState } from '@/hooks/use-system-state'
import {
  useUpdate,
  updateLastCheckTime,
  readLastCheckTime,
} from '@/hooks/use-update'
import { useVerge } from '@/hooks/use-verge'
import { getSystemInfo } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'
import { version as appVersion } from '@root/package.json'

import { campusInfoRowSx } from './campus-panel'
import { EnhancedCard } from './enhanced-card'

export const SystemInfoCard = ({ plain = false }: { plain?: boolean }) => {
  const { t } = useTranslation()
  const { verge, patchVerge } = useVerge()
  const navigate = useNavigate()
  const { isAdminMode, isSidecarMode, mutateSystemState } = useSystemState()
  const { installServiceAndRestartCore } = useServiceInstaller()

  const { checkUpdate: triggerCheckUpdate, lastCheckUpdate } = useUpdate(true)

  const [osInfo, setOsInfo] = useState('')

  const lastCheckUpdateText = useMemo(
    () => (lastCheckUpdate ? new Date(lastCheckUpdate).toLocaleString() : '-'),
    [lastCheckUpdate],
  )

  useEffect(() => {
    getSystemInfo()
      .then((info) => {
        const sysName = info.system_name
        let sysVersion = info.system_version

        if (
          sysName &&
          sysVersion.toLowerCase().startsWith(sysName.toLowerCase())
        ) {
          sysVersion = sysVersion.substring(sysName.length).trim()
        }

        setOsInfo(`${sysName} ${sysVersion}`)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!verge?.auto_check_update) return
    if (readLastCheckTime() !== null) return

    updateLastCheckTime()
    const timeoutId = window.setTimeout(() => {
      triggerCheckUpdate().catch(console.error)
    }, 5000)
    return () => window.clearTimeout(timeoutId)
  }, [verge?.auto_check_update, triggerCheckUpdate])

  const goToSettings = useCallback(() => {
    navigate('/settings')
  }, [navigate])

  const toggleAutoLaunch = useCallback(async () => {
    if (!verge) return
    try {
      await patchVerge({ enable_auto_launch: !verge.enable_auto_launch })
    } catch (err) {
      console.error('切换开机自启动状态失败:', err)
    }
  }, [verge, patchVerge])

  const handleRunningModeClick = useCallback(async () => {
    if (isSidecarMode || (isAdminMode && isSidecarMode)) {
      await installServiceAndRestartCore()
      await mutateSystemState()
    }
  }, [
    isSidecarMode,
    isAdminMode,
    installServiceAndRestartCore,
    mutateSystemState,
  ])

  const onCheckUpdate = useLockFn(async () => {
    try {
      const result = await triggerCheckUpdate()
      const info = result.data
      if (!info?.available) {
        showNotice.success(
          'settings.components.verge.advanced.notifications.latestVersion',
        )
      } else {
        showNotice.info('shared.feedback.notifications.updateAvailable', 2000)
        goToSettings()
      }
    } catch (err) {
      console.warn('update check failed:', err)
      showNotice.warning(err)
    }
  })

  const autoLaunchEnabled = useMemo(
    () => verge?.enable_auto_launch || false,
    [verge],
  )

  const runningModeStyle = useMemo(
    () => ({
      cursor:
        isSidecarMode || (isAdminMode && isSidecarMode) ? 'pointer' : 'default',
      textDecoration:
        isSidecarMode || (isAdminMode && isSidecarMode) ? 'underline' : 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      '&:hover': {
        opacity: isSidecarMode || (isAdminMode && isSidecarMode) ? 0.7 : 1,
      },
    }),
    [isSidecarMode, isAdminMode],
  )

  const getModeIcon = () => {
    if (isAdminMode) {
      if (!isSidecarMode) {
        return (
          <>
            <AdminPanelSettingsOutlined
              sx={{ color: 'primary.main', fontSize: 16 }}
              titleAccess={t('home.components.systemInfo.badges.adminMode')}
            />
            <DnsOutlined
              sx={{ color: 'success.main', fontSize: 16, ml: 0.5 }}
              titleAccess={t('home.components.systemInfo.badges.serviceMode')}
            />
          </>
        )
      }
      return (
        <AdminPanelSettingsOutlined
          sx={{ color: 'primary.main', fontSize: 16 }}
          titleAccess={t('home.components.systemInfo.badges.adminMode')}
        />
      )
    } else if (isSidecarMode) {
      return (
        <ExtensionOutlined
          sx={{ color: 'info.main', fontSize: 16 }}
          titleAccess={t('home.components.systemInfo.badges.sidecarMode')}
        />
      )
    } else {
      return (
        <DnsOutlined
          sx={{ color: 'success.main', fontSize: 16 }}
          titleAccess={t('home.components.systemInfo.badges.serviceMode')}
        />
      )
    }
  }

  const getModeText = () => {
    if (isAdminMode) {
      if (!isSidecarMode) {
        return t('home.components.systemInfo.badges.adminServiceMode')
      }
      return t('home.components.systemInfo.badges.adminMode')
    } else if (isSidecarMode) {
      return t('home.components.systemInfo.badges.sidecarMode')
    } else {
      return t('home.components.systemInfo.badges.serviceMode')
    }
  }

  if (!verge) return null

  const body = (
    <Stack spacing={0.75}>
      <Box sx={campusInfoRowSx}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {t('home.components.systemInfo.fields.osInfo')}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 650,
            textAlign: 'right',
            minWidth: 0,
          }}
        >
          {osInfo}
        </Typography>
      </Box>
      <Box sx={campusInfoRowSx}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {t('home.components.systemInfo.fields.autoLaunch')}
        </Typography>
        <Chip
          size="small"
          label={
            autoLaunchEnabled
              ? t('shared.statuses.enabled')
              : t('shared.statuses.disabled')
          }
          onClick={toggleAutoLaunch}
          sx={{
            cursor: 'pointer',
            height: 24,
            fontWeight: 650,
            borderRadius: '8px',
            bgcolor: autoLaunchEnabled ? 'success.main' : 'action.selected',
            color: autoLaunchEnabled ? '#fff' : 'text.secondary',
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Box>
      <Box sx={campusInfoRowSx}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {t('home.components.systemInfo.fields.runningMode')}
        </Typography>
        <Typography
          onClick={handleRunningModeClick}
          sx={{
            ...runningModeStyle,
            fontSize: 13,
            fontWeight: 650,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {getModeIcon()}
          {getModeText()}
        </Typography>
      </Box>
      <Box sx={campusInfoRowSx}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {t('home.components.systemInfo.fields.lastCheckUpdate')}
        </Typography>
        <Typography
          onClick={onCheckUpdate}
          sx={{
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 650,
            color: 'primary.main',
            '&:hover': { opacity: 0.75 },
          }}
        >
          {lastCheckUpdateText}
        </Typography>
      </Box>
      <Box sx={campusInfoRowSx}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {t('home.components.systemInfo.fields.vergeVersion')}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 650 }}>
          v{appVersion}
        </Typography>
      </Box>
    </Stack>
  )

  if (plain) return body

  return (
    <EnhancedCard
      title={t('home.components.systemInfo.title')}
      icon={<InfoOutlined />}
      iconColor="error"
      action={
        <IconButton
          size="small"
          onClick={goToSettings}
          title={t('home.components.systemInfo.actions.settings')}
        >
          <SettingsOutlined fontSize="small" />
        </IconButton>
      }
    >
      {body}
    </EnhancedCard>
  )
}
