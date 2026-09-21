import { Box, Button, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BaseEmpty,
  BaseSearchBox,
  VirtualList,
  type VirtualListHandle,
} from '@/components/base'
import { ScrollTopButton } from '@/components/layout/scroll-top-button'
import { RulesEditorViewer } from '@/components/profile/rules-editor-viewer'
import { ProviderButton } from '@/components/rule/provider-button'
import RuleItem from '@/components/rule/rule-item'
import { useVisibility } from '@/hooks/use-visibility'
import { useAppRefreshers, useRulesData } from '@/providers/app-data-context'
import { enhanceProfiles } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'

interface Props {
  current?: IProfileItem
}

export const ProfileRulesPanel = ({ current }: Props) => {
  const { t } = useTranslation()
  const { rules = [] } = useRulesData()
  const { refreshRules, refreshRuleProviders } = useAppRefreshers()
  const [match, setMatch] = useState(() => (_: string) => true)
  const [editorOpen, setEditorOpen] = useState(false)
  const virtuosoRef = useRef<VirtualListHandle>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const pageVisible = useVisibility()

  useEffect(() => {
    refreshRules()
    refreshRuleProviders()
    if (pageVisible) {
      refreshRules()
      refreshRuleProviders()
    }
  }, [pageVisible, refreshRuleProviders, refreshRules])

  const filteredRules = useMemo(() => {
    return rules
      .map((item, index) => ({ ...item, lineNo: index + 1 }))
      .filter((item) => match(item.payload ?? ''))
  }, [match, rules])

  const handleScroll = useCallback((e: Event) => {
    setShowScrollTop((e.target as HTMLElement).scrollTop > 100)
  }, [])

  const openEditor = () => {
    if (!current?.uid || !current.option?.rules) {
      showNotice.error('rules.page.needProfile')
      return
    }
    setEditorOpen(true)
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '18px',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{ fontSize: 16, fontWeight: 600, minWidth: 0, flexShrink: 0 }}
        >
          {t('layout.components.navigation.tabs.rules')}
        </Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BaseSearchBox onSearch={(next) => setMatch(() => next)} />
        </Box>
        <Typography
          sx={{ flexShrink: 0, fontSize: 12, color: 'text.secondary' }}
        >
          {t('rules.page.count', { count: filteredRules.length })}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={openEditor}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {t('rules.page.editCustom')}
        </Button>
        <ProviderButton />
      </Box>
      {filteredRules.length > 0 ? (
        <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <VirtualList
            ref={virtuosoRef}
            count={filteredRules.length}
            estimateSize={40}
            renderItem={(i) => <RuleItem value={filteredRules[i]} />}
            style={{ height: '100%' }}
            onScroll={handleScroll}
          />
          <ScrollTopButton
            onClick={() =>
              virtuosoRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }
            show={showScrollTop}
          />
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 160,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <BaseEmpty />
        </Box>
      )}
      {editorOpen && current?.uid && current.option?.rules && (
        <RulesEditorViewer
          groupsUid={current.option.groups ?? ''}
          mergeUid={current.option.merge ?? ''}
          profileUid={current.uid}
          property={current.option.rules}
          open
          onClose={() => setEditorOpen(false)}
          onSave={async (prev, curr) => {
            if (prev !== curr) {
              await enhanceProfiles()
              refreshRules()
              refreshRuleProviders()
            }
          }}
        />
      )}
    </Box>
  )
}
