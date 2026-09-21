import {
  PlayCircleOutlineRounded,
  PauseCircleOutlineRounded,
  SwapVertRounded,
} from '@mui/icons-material'
import { Box, Button, IconButton, MenuItem } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BasePage,
  BaseSearchBox,
  BaseStyledSelect,
  type SearchState,
  VirtualList,
  type VirtualListHandle,
} from '@/components/base'
import LogItem from '@/components/log/log-item'
import { useClashLog } from '@/hooks/use-clash-log'
import { useLogData } from '@/hooks/use-log-data'

const LogPage = () => {
  const { t } = useTranslation()
  const [clashLog, setClashLog] = useClashLog()
  const enableLog = clashLog.enable
  const logState = clashLog.logFilter
  const logOrder = clashLog.logOrder ?? 'asc'
  const isDescending = logOrder === 'desc'

  const [match, setMatch] = useState(() => (_: string) => true)
  const [searchState, setSearchState] = useState<SearchState>()
  const {
    response: { data: logData },
    refreshGetClashLog,
  } = useLogData()

  const filterLogs = useMemo(() => {
    if (!logData || logData.length === 0) {
      return []
    }

    // Server-side filtering handles level filtering via query parameters
    // We only need to apply search filtering here
    return logData.filter((data) => {
      // 构建完整的搜索文本，包含时间、类型和内容
      const searchText =
        `${data.time || ''} ${data.type} ${data.payload}`.toLowerCase()

      const matchesSearch = match(searchText)

      return (
        (logState == 'all' ? true : data.type.includes(logState)) &&
        matchesSearch
      )
    })
  }, [logData, logState, match])

  const filteredLogs = useMemo(
    () => (isDescending ? [...filterLogs].reverse() : filterLogs),
    [filterLogs, isDescending],
  )

  const scrollRef = useRef({ isNearBottom: true })
  const virtuosoRef = useRef<VirtualListHandle>(null)

  useEffect(() => {
    if (!isDescending && scrollRef.current.isNearBottom) {
      virtuosoRef.current?.scrollToIndex(filteredLogs.length - 1, {
        behavior: 'smooth',
      })
    }
  }, [isDescending, filteredLogs.length])

  const handleLogLevelChange = (newLevel: LogFilter) => {
    setClashLog((pre) => ({ ...pre!, logFilter: newLevel }))
  }

  const handleToggleLog = async () => {
    setClashLog((pre) => ({ ...pre!, enable: !enableLog }))
  }

  const handleToggleOrder = () => {
    setClashLog((pre) => ({
      ...pre!,
      logOrder: pre!.logOrder === 'desc' ? 'asc' : 'desc',
    }))
  }

  return (
    <BasePage
      full
      title={t('logs.page.title')}
      contentStyle={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
      header={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            title={t(
              enableLog ? 'shared.actions.pause' : 'shared.actions.resume',
            )}
            aria-label={t(
              enableLog ? 'shared.actions.pause' : 'shared.actions.resume',
            )}
            size="small"
            color="inherit"
            onClick={handleToggleLog}
          >
            {enableLog ? (
              <PauseCircleOutlineRounded />
            ) : (
              <PlayCircleOutlineRounded />
            )}
          </IconButton>
          <IconButton
            title={t(
              isDescending
                ? 'logs.actions.showAscending'
                : 'logs.actions.showDescending',
            )}
            aria-label={t(
              isDescending
                ? 'logs.actions.showAscending'
                : 'logs.actions.showDescending',
            )}
            size="small"
            color="inherit"
            onClick={handleToggleOrder}
          >
            <SwapVertRounded
              sx={{
                transform: isDescending ? 'scaleY(-1)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </IconButton>

          <Button
            size="small"
            variant="outlined"
            sx={{ ml: 1, borderRadius: '10px', textTransform: 'none' }}
            onClick={() => {
              refreshGetClashLog(true)
            }}
          >
            {t('shared.actions.clear')}
          </Button>
        </Box>
      }
    >
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pb: 2,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <BaseStyledSelect
            value={logState}
            onChange={(e) => handleLogLevelChange(e.target.value as LogFilter)}
          >
            <MenuItem value="all">{t('shared.filters.logLevels.all')}</MenuItem>
            <MenuItem value="debug">
              {t('shared.filters.logLevels.debug')}
            </MenuItem>
            <MenuItem value="info">
              {t('shared.filters.logLevels.info')}
            </MenuItem>
            <MenuItem value="warn">
              {t('shared.filters.logLevels.warn')}
            </MenuItem>
            <MenuItem value="err">
              {t('shared.filters.logLevels.error')}
            </MenuItem>
          </BaseStyledSelect>
          <Box sx={{ flex: 1, minWidth: 0, '& > *': { width: '100%' } }}>
            <BaseSearchBox
              onSearch={(matcher, state) => {
                setMatch(() => matcher)
                setSearchState(state)
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: '14px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#141821',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {filteredLogs.length > 0 ? (
            <VirtualList
              ref={virtuosoRef}
              count={filteredLogs.length}
              estimateSize={28}
              renderItem={(i) => (
                <LogItem value={filteredLogs[i]} searchState={searchState} />
              )}
              onScroll={(event) => {
                const element = event.currentTarget as HTMLDivElement
                scrollRef.current.isNearBottom =
                  element.scrollHeight -
                    element.scrollTop -
                    element.clientHeight <=
                  20
              }}
              style={{ flex: 1, padding: '8px 0 12px' }}
            />
          ) : null}
        </Box>
      </Box>
    </BasePage>
  )
}

export default LogPage
