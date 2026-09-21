import { Box, styled } from '@mui/material'
import type { ReactNode } from 'react'

import type { SearchState } from '@/components/base'
import { MONACO_FONT_FAMILY } from '@/utils/font-family'

const Item = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '3px 14px',
  margin: 0,
  fontSize: 12.5,
  lineHeight: 1.55,
  fontFamily: MONACO_FONT_FAMILY,
  letterSpacing: 0,
  userSelect: 'text',
  color: '#c8d2e0',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  '& .time': {
    color: '#6b778c',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
  },
  '& .type': {
    fontWeight: 700,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
  },
  '& .type[data-type="error"], & .type[data-type="err"]': {
    color: '#ff6b6b',
  },
  '& .type[data-type="warning"], & .type[data-type="warn"]': {
    color: '#ffc857',
  },
  '& .type[data-type="info"], & .type[data-type="inf"]': {
    color: '#5eead4',
  },
  '& .type[data-type="debug"], & .type[data-type="dbg"]': {
    color: '#8b9bb4',
  },
  '& .data': {
    color: '#d7e0ee',
    overflowWrap: 'anywhere',
    minWidth: 0,
    flex: '1 1 auto',
  },
  '& .highlight': {
    backgroundColor: '#facc15',
    color: '#111827',
    borderRadius: 2,
    padding: '0 2px',
  },
})

interface Props {
  value: ILogItem
  searchState?: SearchState
}

const LogItem = ({ value, searchState }: Props) => {
  const renderHighlightText = (text: string) => {
    if (!searchState?.text.trim()) return text

    try {
      const searchText = searchState.text
      let pattern: string

      if (searchState.useRegularExpression) {
        try {
          new RegExp(searchText)
          pattern = searchText
        } catch {
          pattern = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
      } else {
        const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        pattern = searchState.matchWholeWord ? `\\b${escaped}\\b` : escaped
      }

      const flags = searchState.matchCase ? 'g' : 'gi'
      const regex = new RegExp(pattern, flags)
      const elements: ReactNode[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(text)) !== null) {
        const start = match.index
        const matchText = match[0]

        if (matchText === '') {
          regex.lastIndex += 1
          continue
        }

        if (start > lastIndex) {
          elements.push(text.slice(lastIndex, start))
        }

        elements.push(
          <span key={`highlight-${start}`} className="highlight">
            {matchText}
          </span>,
        )

        lastIndex = start + matchText.length
      }

      if (lastIndex < text.length) {
        elements.push(text.slice(lastIndex))
      }

      return elements.length ? elements : text
    } catch {
      return text
    }
  }

  return (
    <Item>
      <span className="time">{renderHighlightText(value.time || '')}</span>
      <span className="type" data-type={value.type.toLowerCase()}>
        {renderHighlightText(value.type)}
      </span>
      <span className="data">{renderHighlightText(value.payload)}</span>
    </Item>
  )
}

export default LogItem
