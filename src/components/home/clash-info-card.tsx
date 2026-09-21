import { DeveloperBoardOutlined } from '@mui/icons-material'
import { Box, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useClash } from '@/hooks/use-clash'
import { useDisplayedMixedPort } from '@/hooks/use-displayed-mixed-port'
import { useAppUptime } from '@/hooks/use-system-state'
import {
  useClashConfigData,
  useRulesData,
  useSystemData,
} from '@/providers/app-data-context'

import { campusInfoRowSx } from './campus-panel'
import { EnhancedCard } from './enhanced-card'

// 将毫秒转换为时:分:秒格式的函数
const formatUptime = (uptimeMs: number) => {
  const hours = Math.floor(uptimeMs / 3600000)
  const minutes = Math.floor((uptimeMs % 3600000) / 60000)
  const seconds = Math.floor((uptimeMs % 60000) / 1000)
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const ClashInfoCard = ({ plain = false }: { plain?: boolean }) => {
  const { t } = useTranslation()
  const { version: clashVersion } = useClash()
  const { clashConfig } = useClashConfigData()
  const displayedMixedPort = useDisplayedMixedPort()
  const { rules } = useRulesData()
  const uptime = useAppUptime()
  const { systemProxyAddress } = useSystemData()

  // 使用useMemo缓存格式化后的uptime，避免频繁计算
  const formattedUptime = useMemo(() => formatUptime(uptime), [uptime])

  // 使用备忘录组件内容，减少重新渲染
  const cardContent = useMemo(() => {
    if (!clashConfig) return null

    return (
      <Stack spacing={0.75}>
        {(
          [
            [
              t('home.components.clashInfo.fields.coreVersion'),
              clashVersion || '-',
            ],
            [
              t('home.components.clashInfo.fields.systemProxyAddress'),
              systemProxyAddress,
            ],
            [
              t('home.components.clashInfo.fields.mixedPort'),
              displayedMixedPort,
            ],
            [t('home.components.clashInfo.fields.uptime'), formattedUptime],
            [t('home.components.clashInfo.fields.rulesCount'), rules.length],
          ] as const
        ).map(([label, value]) => (
          <Box key={label} sx={campusInfoRowSx}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 650,
                minWidth: 0,
                textAlign: 'right',
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Stack>
    )
  }, [
    clashConfig,
    clashVersion,
    displayedMixedPort,
    t,
    formattedUptime,
    rules.length,
    systemProxyAddress,
  ])

  if (plain) return cardContent

  return (
    <EnhancedCard
      title={t('home.components.clashInfo.title')}
      icon={<DeveloperBoardOutlined />}
      iconColor="warning"
      action={null}
    >
      {cardContent}
    </EnhancedCard>
  )
}
