import {
  ConstructionOutlined,
  DnsOutlined,
  GitHub,
  HelpOutlineRounded,
  PaletteOutlined,
  Telegram,
  TuneOutlined,
} from '@mui/icons-material'
import {
  Box,
  ButtonBase,
  ButtonGroup,
  IconButton,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useLockFn } from 'ahooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BasePage } from '@/components/base'
import { campusPanelSx } from '@/components/home/campus-panel'
import SettingClash from '@/components/setting/setting-clash'
import SettingSystem from '@/components/setting/setting-system'
import SettingVergeAdvanced from '@/components/setting/setting-verge-advanced'
import SettingVergeBasic from '@/components/setting/setting-verge-basic'
import { showNotice } from '@/services/notice-service'
import { openExternalUrl } from '@/utils/open-external-url'

const SECTIONS = [
  {
    id: 'system',
    label: 'settings.sections.system.title',
    icon: TuneOutlined,
  },
  {
    id: 'clash',
    label: 'settings.sections.clash.title',
    icon: DnsOutlined,
  },
  {
    id: 'verge-basic',
    label: 'settings.components.verge.basic.title',
    icon: PaletteOutlined,
  },
  {
    id: 'verge-advanced',
    label: 'settings.components.verge.advanced.title',
    icon: ConstructionOutlined,
  },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const SettingPage = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [section, setSection] = useState<SectionId>('system')

  const onError = (err: any) => {
    showNotice.error(err)
  }

  const toGithubRepo = useLockFn(() =>
    openExternalUrl('https://github.com/clash-verge-rev/clash-verge-rev').catch(
      onError,
    ),
  )

  const toGithubDoc = useLockFn(() =>
    openExternalUrl('https://clash-verge-rev.github.io/index.html').catch(
      onError,
    ),
  )

  const toTelegramChannel = useLockFn(() =>
    openExternalUrl('https://t.me/clash_verge_re').catch(onError),
  )

  return (
    <BasePage
      title={t('settings.page.title')}
      full
      contentStyle={{ padding: 0, height: '100%' }}
      header={
        <ButtonGroup
          variant="contained"
          aria-label={t('settings.page.actionsGroupLabel')}
        >
          <IconButton
            size="medium"
            color="inherit"
            title={t('settings.page.actions.manual')}
            onClick={toGithubDoc}
          >
            <HelpOutlineRounded fontSize="inherit" />
          </IconButton>
          <IconButton
            size="medium"
            color="inherit"
            title={t('settings.page.actions.telegram')}
            onClick={toTelegramChannel}
          >
            <Telegram fontSize="inherit" />
          </IconButton>

          <IconButton
            size="medium"
            color="inherit"
            title={t('settings.page.actions.github')}
            onClick={toGithubRepo}
          >
            <GitHub fontSize="inherit" />
          </IconButton>
        </ButtonGroup>
      }
    >
      <Box
        sx={{
          height: '100%',
          px: { xs: 2.5, md: 4 },
          pb: 2.5,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            ...campusPanelSx,
            width: { xs: '100%', md: 220 },
            flexShrink: 0,
            p: 1.25,
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            gap: 0.5,
            overflowX: { xs: 'auto', md: 'visible' },
          }}
        >
          {SECTIONS.map((item) => {
            const Icon = item.icon
            const selected = section === item.id
            return (
              <ButtonBase
                key={item.id}
                onClick={() => setSection(item.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 1.25,
                  width: { xs: 'auto', md: '100%' },
                  flexShrink: 0,
                  px: 1.5,
                  py: 1.15,
                  borderRadius: '14px',
                  textAlign: 'left',
                  color: selected ? 'primary.main' : 'text.primary',
                  bgcolor: selected
                    ? alpha(theme.palette.primary.main, 0.12)
                    : 'transparent',
                  '&:hover': {
                    bgcolor: selected
                      ? alpha(theme.palette.primary.main, 0.16)
                      : 'action.hover',
                  },
                }}
              >
                <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: selected ? 650 : 500,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t(item.label)}
                </Typography>
              </ButtonBase>
            )
          })}
        </Box>

        <Box
          sx={{
            ...campusPanelSx,
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 1, md: 1.5 },
            scrollbarWidth: 'auto',
            '&::-webkit-scrollbar': {
              width: '1px',
              height: '1px',
            },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: '999px',
              bgcolor: 'text.disabled',
            },
          }}
        >
          {section === 'system' && <SettingSystem onError={onError} />}
          {section === 'clash' && <SettingClash onError={onError} />}
          {section === 'verge-basic' && <SettingVergeBasic onError={onError} />}
          {section === 'verge-advanced' && (
            <SettingVergeAdvanced onError={onError} />
          )}
        </Box>
      </Box>
    </BasePage>
  )
}

export default SettingPage
