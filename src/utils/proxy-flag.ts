const FLAG_RE = /[\u{1F1E6}-\u{1F1FF}]{2}/u

const COUNTRY_KEYWORDS: [string, string][] = [
  ['香港', 'HK'],
  ['台湾', 'TW'],
  ['台灣', 'TW'],
  ['澳门', 'MO'],
  ['澳門', 'MO'],
  ['日本', 'JP'],
  ['韩国', 'KR'],
  ['韓國', 'KR'],
  ['新加坡', 'SG'],
  ['美国', 'US'],
  ['美國', 'US'],
  ['英国', 'GB'],
  ['英國', 'GB'],
  ['法国', 'FR'],
  ['法國', 'FR'],
  ['德国', 'DE'],
  ['德國', 'DE'],
  ['越南', 'VN'],
  ['俄罗斯', 'RU'],
  ['俄羅斯', 'RU'],
  ['乌克兰', 'UA'],
  ['烏克蘭', 'UA'],
  ['土耳其', 'TR'],
  ['尼日利亚', 'NG'],
  ['尼日利亞', 'NG'],
  ['加拿大', 'CA'],
  ['澳大利亚', 'AU'],
  ['澳洲', 'AU'],
  ['印度', 'IN'],
  ['泰国', 'TH'],
  ['泰國', 'TH'],
  ['菲律宾', 'PH'],
  ['菲律賓', 'PH'],
  ['马来西亚', 'MY'],
  ['馬來西亞', 'MY'],
  ['印尼', 'ID'],
  ['荷兰', 'NL'],
  ['荷蘭', 'NL'],
  ['意大利', 'IT'],
  ['西班牙', 'ES'],
  ['巴西', 'BR'],
  ['阿根廷', 'AR'],
  ['瑞士', 'CH'],
  ['瑞典', 'SE'],
  ['波兰', 'PL'],
  ['波蘭', 'PL'],
  ['爱尔兰', 'IE'],
  ['愛爾蘭', 'IE'],
  ['阿联酋', 'AE'],
  ['阿聯酋', 'AE'],
  ['中国', 'CN'],
  ['中國', 'CN'],
]

const ISO_CODES = new Set([
  'AE',
  'AR',
  'AU',
  'BR',
  'CA',
  'CH',
  'CN',
  'DE',
  'ES',
  'FR',
  'GB',
  'HK',
  'ID',
  'IE',
  'IN',
  'IT',
  'JP',
  'KR',
  'MO',
  'MY',
  'NG',
  'NL',
  'PH',
  'PL',
  'RU',
  'SE',
  'SG',
  'TH',
  'TR',
  'TW',
  'UA',
  'UK',
  'US',
  'VN',
])

const isoToFlag = (iso: string) => {
  const code = iso === 'UK' ? 'GB' : iso.toUpperCase()
  if (code.length !== 2) return ''
  return String.fromCodePoint(
    0x1f1e6 + code.charCodeAt(0) - 65,
    0x1f1e6 + code.charCodeAt(1) - 65,
  )
}

const INFO_NAME_RE =
  /剩余流量|流量剩余|已用流量|套餐到期|到期时间|过期时间|重置时间|距离下次|官网|客服|使用须知|最新消息|订阅信息/

export const parseSubscriptionInfo = (name: string) => {
  if (!INFO_NAME_RE.test(name)) return null
  const parts = name.split(/[:：]/)
  const label = (parts[0] ?? name).trim()
  const value = parts.slice(1).join(':').trim()
  return { label, value: value || name }
}

const inferIso = (name: string) => {
  if (parseSubscriptionInfo(name)) return ''
  for (const [keyword, iso] of COUNTRY_KEYWORDS) {
    if (name.includes(keyword)) return iso
  }
  const token = name.match(/(?:^|[^A-Za-z0-9.])([A-Z]{2})(?:[^A-Za-z]|$)/)
  const iso = token?.[1]
  if (!iso || !ISO_CODES.has(iso) || token.index == null) return ''
  const isoIndex = token.index + token[0].indexOf(iso)
  const prev = isoIndex > 0 ? name[isoIndex - 1] : ''
  if (prev && /\d/.test(prev)) return ''
  return iso
}

export const FLAG_EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Twemoji Mozilla", "Noto Color Emoji"'

const flagToIso = (flag: string) => {
  if (flag.length < 2) return ''
  const a = flag.codePointAt(0)
  const b = flag.codePointAt(2) ?? flag.codePointAt(1)
  if (a == null || b == null) return ''
  const iso = String.fromCharCode(a - 0x1f1e6 + 65, b - 0x1f1e6 + 65)
  return iso.length === 2 ? iso : ''
}

export const splitProxyFlag = (name: string) => {
  const existing = name.match(FLAG_RE)
  if (existing?.index != null) {
    const flag = existing[0]
    const label =
      existing.index === 0 ? name.slice(flag.length).replace(/^\s+/, '') : name
    const fromFlag = flagToIso(flag)
    const iso = fromFlag || inferIso(name)
    return { flag, label: label || name, iso }
  }
  const iso = inferIso(name)
  return { flag: iso ? isoToFlag(iso) : '', label: name, iso }
}
