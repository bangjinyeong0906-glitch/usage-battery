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
  on('session.measure', () => ({ changed: ['rateLimits'] }) as any)
  await $.session.measure({ context: {}, rateLimits: LIMITS, changed: ['rateLimits'] } as any)

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect((await ui.find({ type: 'Text', text: /^\d+%$/ }))?.text).toBe('70%')
    // Even at 15% left the weekly battery stays green, like a laptop's.
    expect((await ui.find({ type: 'Text', text: /^██$/ }))?.props.color).toBe('green')
    await ui.unmount()
  }
})

test('/battery prints both batteries on one line', async ($, on) => {
  mock.clock(on, { now: 1000 })
  on('session.usage', () => ({ value: { startedAt: 0, context: {}, rateLimits: LIMITS } }) as any)
  const r = await $.command.run({ command: 'battery', args: '' } as any)
  expect(r.text).toBe('일일 🟩🟩🟩🟩⬜ 70%  ·  주간 🟩⬜⬜⬜⬜ 15%')
})
