import getSystem from '@/utils/get-system'
const OS = getSystem()

// default theme setting
export const defaultTheme = {
  primary_color: '#3B6FFF',
  secondary_color: '#5B8CFF',
  primary_text: '#1A1D26',
  secondary_text: '#8B93A7',
  info_color: '#3B6FFF',
  error_color: '#FF3B30',
  warning_color: '#FF9500',
  success_color: '#22C55E',
  background_color: '#E8F0FE',
  font_family: `"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji"${
    OS === 'windows' ? ', twemoji mozilla' : ''
  }`,
}

// dark mode
export const defaultDarkTheme = {
  ...defaultTheme,
  primary_color: '#5B8CFF',
  secondary_color: '#7AA2FF',
  primary_text: '#F4F6FB',
  background_color: '#121722',
  secondary_text: '#9AA3B8',
  info_color: '#5B8CFF',
  error_color: '#FF453A',
  warning_color: '#FF9F0A',
  success_color: '#30D158',
}
