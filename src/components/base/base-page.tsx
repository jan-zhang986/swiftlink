import { Box, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

import { BaseErrorBoundary } from './base-error-boundary'

interface Props {
  title?: React.ReactNode // the page title
  header?: React.ReactNode // something behind title
  contentStyle?: React.CSSProperties
  children?: ReactNode
  full?: boolean
}

export const BasePage: React.FC<Props> = (props) => {
  const { title, header, contentStyle, full, children } = props

  return (
    <BaseErrorBoundary>
      <div className="base-page">
        <header data-tauri-drag-region="true" style={{ userSelect: 'none' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}
            data-tauri-drag-region="true"
          >
            <Typography
              sx={{
                fontSize: '22px',
                fontWeight: 590,
                letterSpacing: '-0.03em',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              data-tauri-drag-region="true"
            >
              {title}
            </Typography>
          </Box>

          {header}
        </header>

        <div
          className={full ? 'base-container no-padding' : 'base-container'}
          style={{ backgroundColor: 'transparent' }}
        >
          <section
            style={{
              backgroundColor: 'transparent',
            }}
          >
            <div className="base-content" style={contentStyle}>
              {children}
            </div>
          </section>
        </div>
      </div>
    </BaseErrorBoundary>
  )
}
