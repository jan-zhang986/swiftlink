import { Channel, invoke } from '@tauri-apps/api/core'
import { useLockFn } from 'ahooks'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import chatgptIcon from '@/assets/image/test/chatgpt.svg?raw'
import claudeIcon from '@/assets/image/test/claude.svg?raw'
import geminiIcon from '@/assets/image/test/gemini.svg?raw'
import youtubeIcon from '@/assets/image/test/youtube.svg?raw'
import { BasePage } from '@/components/base'
import { TestCard } from '@/components/home/test-card'
import { UnlockTestItem } from '@/components/test/unlock-test-item'
import { showNotice } from '@/services/notice-service'

interface UnlockItem {
  name: string
  status: string
  region?: string | null
  check_time?: string | null
}

const UNLOCK_RESULTS_STORAGE_KEY = 'clash_verge_unlock_results'

const normalizeUnlockName = (name: string) => name.trim().toLowerCase()

const UNLOCK_ICONS: Record<string, string> = {
  'chatgpt web': chatgptIcon,
  claude: claudeIcon,
  gemini: geminiIcon,
  'youtube premium': youtubeIcon,
}

const UNLOCK_LABELS: Record<string, string> = {
  'chatgpt web': 'ChatGPT',
  'youtube premium': 'YouTube',
}

const getStatusPriority = (status: string) => (status === 'Pending' ? 0 : 1)
const mergeOptionalFields = (preferred: UnlockItem, fallback: UnlockItem) => ({
  ...preferred,
  region: preferred.region ?? fallback.region,
  check_time: preferred.check_time ?? fallback.check_time,
})

const dedupeUnlockItems = (items: UnlockItem[]) => {
  const map = new Map<string, UnlockItem>()

  items.forEach((item) => {
    const key = normalizeUnlockName(item.name)
    const existing = map.get(key)

    if (!existing) {
      map.set(key, item)
      return
    }

    const existingPriority = getStatusPriority(existing.status)
    const itemPriority = getStatusPriority(item.status)

    if (itemPriority > existingPriority) {
      map.set(key, mergeOptionalFields(item, existing))
      return
    }

    if (itemPriority < existingPriority) {
      map.set(key, mergeOptionalFields(existing, item))
      return
    }

    map.set(key, mergeOptionalFields(item, existing))
  })

  return Array.from(map.values())
}

const UnlockPage = () => {
  const { t } = useTranslation()

  const [unlockItems, setUnlockItems] = useState<UnlockItem[]>([])
  const unlockItemsRef = useRef<UnlockItem[]>([])
  const [isCheckingAll, setIsCheckingAll] = useState(false)
  const [loadingItems, setLoadingItems] = useState<string[]>([])

  const saveResultsToStorage = (items: UnlockItem[]) => {
    try {
      localStorage.setItem(UNLOCK_RESULTS_STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.error('Failed to save results to storage:', err)
    }
  }

  useEffect(() => {
    let storedItems: UnlockItem[] = []
    try {
      const itemsJson = localStorage.getItem(UNLOCK_RESULTS_STORAGE_KEY)
      if (itemsJson) {
        storedItems = dedupeUnlockItems(JSON.parse(itemsJson) as UnlockItem[])
      }
    } catch (err) {
      console.error('Failed to load results from storage:', err)
    }

    void (async () => {
      try {
        const defaultItems = await invoke<UnlockItem[]>('get_unlock_items')
        const existingMap = new Map(
          storedItems.map((item) => [normalizeUnlockName(item.name), item]),
        )
        const mergedItems = defaultItems.map((item) => {
          const matchedItem = existingMap.get(normalizeUnlockName(item.name))
          return matchedItem ? { ...matchedItem, name: item.name } : item
        })

        const sortedItems = mergedItems.sort((a, b) =>
          a.name.localeCompare(b.name),
        )
        unlockItemsRef.current = sortedItems
        setUnlockItems(sortedItems)
      } catch (err: any) {
        console.error('Failed to get unlock items:', err)
      }
    })()
  }, [])

  const checkAllMedia = useLockFn(async () => {
    const onComplete = new Channel<UnlockItem>((result) => {
      const updatedItems = unlockItemsRef.current.map((item) =>
        item.name === result.name ? result : item,
      )
      unlockItemsRef.current = updatedItems
      setUnlockItems(updatedItems)
      setLoadingItems((items) => items.filter((name) => name !== result.name))
    })

    try {
      setIsCheckingAll(true)
      setLoadingItems(unlockItems.map((item) => item.name))
      const result = await invoke<UnlockItem[]>('check_media_unlock', {
        onComplete,
      })
      const sortedItems = result.sort((a, b) => a.name.localeCompare(b.name))

      unlockItemsRef.current = sortedItems
      setUnlockItems(sortedItems)
      saveResultsToStorage(sortedItems)
    } catch (err: any) {
      showNotice.error('tests.unlock.page.messages.detectionTimeout', err)
      console.error('Failed to check media unlock:', err)
    } finally {
      setLoadingItems([])
      setIsCheckingAll(false)
    }
  })

  const checkSingleMedia = async (name: string) => {
    setLoadingItems((items) => [...items, name])
    try {
      const result = await invoke<UnlockItem>('check_media_unlock_item', {
        name,
      })
      const updatedItems = unlockItemsRef.current.map((item) =>
        item.name === name ? result : item,
      )

      unlockItemsRef.current = updatedItems
      setUnlockItems(updatedItems)
      saveResultsToStorage(updatedItems)
    } catch (err: any) {
      showNotice.error(
        'tests.unlock.page.messages.detectionFailedWithName',
        { name },
        err,
      )
      console.error(`Failed to check ${name}:`, err)
    } finally {
      setLoadingItems((items) => items.filter((item) => item !== name))
    }
  }

  return (
    <BasePage title={t('tests.page.title')}>
      <TestCard
        compact={false}
        onExtraTestAll={() => void checkAllMedia()}
        extraItems={unlockItems.map((item) => {
          const key = normalizeUnlockName(item.name)
          return (
            <UnlockTestItem
              key={item.name}
              name={UNLOCK_LABELS[key] ?? item.name}
              status={item.status}
              region={item.region}
              icon={UNLOCK_ICONS[key]}
              loading={loadingItems.includes(item.name) || isCheckingAll}
              disabled={isCheckingAll}
              onTest={() => void checkSingleMedia(item.name)}
            />
          )
        })}
      />
    </BasePage>
  )
}

export default UnlockPage
