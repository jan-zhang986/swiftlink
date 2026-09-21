import type { CheckOptions, Update } from '@tauri-apps/plugin-updater'

export const checkUpdateSafe = async (
  _options?: CheckOptions,
): Promise<Update | null> => null

export type { CheckOptions }
