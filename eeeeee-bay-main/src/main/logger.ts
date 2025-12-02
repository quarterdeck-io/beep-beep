import { appendFileSync } from 'fs'
import { join } from 'path'

const logPath = join(__dirname, '../../eeeeee-bay.log')

export function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  try {
    appendFileSync(logPath, line)
  } catch {
    /* ignore */
  }
  console.log(line.trim())
}
