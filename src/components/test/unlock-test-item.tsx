import { Box, Divider, styled, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { BaseLoading } from '@/components/base'

import { TestBox } from './test-box'

const STATUS_LABEL_KEYS: Record<string, string> = {
  Pending: 'tests.statuses.test.pending',
  Yes: 'tests.statuses.test.yes',
  No: 'tests.statuses.test.no',
  Failed: 'tests.statuses.test.failed',
  Completed: 'tests.statuses.test.completed',
  'Disallowed ISP': 'tests.statuses.test.disallowedIsp',
  'Originals Only': 'tests.statuses.test.originalsOnly',
  'No (IP Banned By Disney+)': 'tests.statuses.test.noDisney',
  'Unsupported Country/Region': 'tests.statuses.test.unsupportedRegion',
  'Failed (Network Connection)': 'tests.statuses.test.failedNetwork',
}

interface UnlockTestItemProps {
  name: string
  status: string
  region?: string | null
  icon?: string
  loading?: boolean
  disabled?: boolean
  onTest: () => void
}

const statusColor = (status: string) => {
  if (status === 'Yes') return 'success.main'
  if (
    status === 'No' ||
    status.includes('Failed') ||
    status === 'Disallowed ISP' ||
    status === 'Unsupported Country/Region'
  ) {
    return 'error.main'
  }
  if (status === 'Soon') return 'warning.main'
  return 'primary.main'
}

export const UnlockTestItem = ({
  name,
  status,
  region,
  icon,
  loading,
  disabled,
  onTest,
}: UnlockTestItemProps) => {
  const { t } = useTranslation()
  const pending = status === 'Pending' && !loading
  const label = pending
    ? t('tests.components.item.actions.test')
    : t(STATUS_LABEL_KEYS[status] ?? status)

  return (
    <Box sx={{ height: '100%', width: 'fit-content' }}>
      <TestBox title={region || undefined}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {icon ? (
              <img
                alt={name}
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon)}`}
                height="40px"
              />
            ) : null}
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Box>
        </Box>
        <Divider sx={{ marginTop: '8px' }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '8px',
            color: 'primary.main',
          }}
        >
          {loading ? (
            <Widget>
              <BaseLoading />
            </Widget>
          ) : (
            <Widget
              className={pending ? 'the-check' : 'the-delay'}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                if (!disabled) onTest()
              }}
              sx={(theme) => ({
                color: pending ? undefined : statusColor(status),
                ':hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                },
              })}
            >
              {label}
            </Widget>
          )}
        </Box>
      </TestBox>
    </Box>
  )
}

const Widget = styled(Box)(({ theme: { typography } }) => ({
  padding: '3px 6px',
  fontSize: 14,
  fontFamily: typography.fontFamily,
  borderRadius: '4px',
}))
