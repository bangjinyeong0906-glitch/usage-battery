import { expect, test, mock } from 'claude-code/testing'

const BAND = {
  plugin: 'usage-battery',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 10, bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 10 }, view: {},
  },
} as const

const LIMITS = [
  { kind: 'five_hour', percentUsed: 30 },
  { kind: 'seven_day', percentUsed: 85 },
]

test('the band shows what is left on every surface', async ($, on) => {
  mock.clock(on, { now: 1000 })
  on('ui.status', () => ({ value: undefined }) as any)
  on('session.measure', () => ({ changed: ['rateLimits'] }) as any)
  await $.session.measure({ context: {}, rateLimits: LIMITS, changed: ['rateLimits'] } as any)

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect((await ui.find({ type: 'Text', text: /^\d+%$/ }))?.text).toBe('70%')
    // Even at 15% left the weekly battery stays green, like a laptop's.
    const fill = await ui.find({ key: '주간-fill' })
    expect(fill?.props.width).toBe(2)
    expect(fill?.props.backgroundColor).toBe('green')
    await ui.unmount()
  }
})

test('the summary is pinned under the prompt without typing /battery', async ($, on) => {
  mock.clock(on, { now: 1000 })
  const lines: unknown[] = []
  on('ui.status', (_$, e: any) => { lines.push(e.text); return { value: undefined } as any })
  on('session.measure', () => ({ changed: ['rateLimits'] }) as any)
  await $.session.measure({ context: {}, rateLimits: LIMITS, changed: ['rateLimits'] } as any)
  expect(lines).toEqual(['🔋 일일 ███████░░░ 70%  ·  주간 ██░░░░░░░░ 15%'])
})

test('/battery prints both batteries on one line', async ($, on) => {
  mock.clock(on, { now: 1000 })
  on('session.usage', () => ({ value: { startedAt: 0, context: {}, rateLimits: LIMITS } }) as any)
  on('ui.status', () => ({ value: undefined }) as any)
  const r = await $.command.run({ command: 'battery', args: '' } as any)
  expect(r.text).toBe('일일 ███████░░░ 70%  ·  주간 ██░░░░░░░░ 15%')
})
