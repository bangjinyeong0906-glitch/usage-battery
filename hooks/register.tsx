import { atom, read, update } from 'claude-code'
import type { Register, EngineInterface } from 'claude-code'

import type { Limit, Reading } from '../types'

const reading = atom({ plugin: 'usage-battery', key: 'reading' } as const, null)

// Width of the bar, in columns.
const BAR = 16

// Like a laptop's battery: what is left is always green.
const COLOR = 'green'
const EMPTY = 'gray'
const TEXT_CELLS = 10

function resetLabel(iso: string | undefined, now: number): string {
  if (!iso) return ''
  const ms = Date.parse(iso) - now
  if (!Number.isFinite(ms) || ms <= 0) return ''
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h >= 24) return ` ↻${Math.floor(h / 24)}d${h % 24}h`
  return h > 0 ? ` ↻${h}h${m}m` : ` ↻${m}m`
}

function bar(label: string, limit: Limit | undefined, now: number): string {
  if (!limit) return `${label} —`
  const left = Math.max(0, Math.min(100, 100 - limit.percentUsed))
  const filled = Math.round((left / 100) * TEXT_CELLS)
  return `${label} ${'█'.repeat(filled)}${'░'.repeat(TEXT_CELLS - filled)} ${Math.round(left)}%${resetLabel(limit.resetsAt, now)}`
}

function summary(r: Reading | null): string {
  const limits = r?.limits ?? []
  const now = r?.at ?? 0
  if (limits.length === 0) return '🔋 아직 데이터 없음 (Pro/Max 구독에서 첫 응답 뒤 표시)'
  return [
    bar('일일', limits.find(l => l.kind === 'five_hour'), now),
    bar('주간', limits.find(l => l.kind === 'seven_day'), now),
  ].join('  ·  ')
}

async function refresh($: EngineInterface): Promise<void> {
  const u = await $.session.usage()
  const now = await $.clock.now()
  const next: Reading = {
    limits: u.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
    at: now,
  }
  await update($, reading, () => next)
  show($, next)
}

// Pin the summary under the prompt so it shows without typing /battery.
function show($: EngineInterface, r: Reading | null): void {
  if (!r || r.limits.length === 0) return
  $.ui.status(`🔋 ${summary(r)}`)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command.register({ name: 'battery', description: '일일·주간 사용량을 배터리로 보여줘요' })
    await refresh($)
    return r
  })

  on('command.run', { command: 'battery' }, async $ => {
    await refresh($)
    return { text: summary(await read($, reading)), isTextDisplayOnly: true }
  })

  on('session.measure', async ($, e, next) => {
    const now = await $.clock.now()
    const r: Reading = {
      limits: e.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
      at: now,
    }
    await update($, reading, () => r)
    show($, r)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const r = await read($, reading)
    const now = r?.at ?? 0

    const battery = (label: string, limit: Limit | undefined) => {
      if (!limit) {
        return (
          <Box key={label} flexDirection="row" marginRight={2}>
            <Text dimColor>{label} [ — ] 아직 데이터 없음</Text>
          </Box>
        )
      }
      const left = Math.max(0, Math.min(100, 100 - limit.percentUsed))
      const filled = Math.round((left / 100) * BAR)
      return (
        <Box key={label} flexDirection="row" marginRight={2}>
          <Text>{label} </Text>
          <Box flexDirection="row" width={BAR} height={1} flexShrink={0} backgroundColor={EMPTY}>
            {filled > 0 ? <Box key={`${label}-fill`} width={filled} height={1} backgroundColor={COLOR} /> : null}
          </Box>
          <Text> </Text>
          <Text color={COLOR} bold>{Math.round(left)}%</Text>
          <Text dimColor>{resetLabel(limit.resetsAt, now)}</Text>
        </Box>
      )
    }

    const limits = r?.limits ?? []
    const daily = limits.find(l => l.kind === 'five_hour')
    const weekly = limits.find(l => l.kind === 'seven_day')

    return (
      <Box flexDirection="row" justifyContent="center" alignItems="center" width="100%">
        {battery('일일', daily)}
        {battery('주간', weekly)}
        <Button
          key="refresh"
          label="⟳ 새로고침"
          onPress={async () => {
            await refresh($)
            $.ui.toast(summary(await read($, reading)))
          }}
        />
      </Box>
    )
  })
}
