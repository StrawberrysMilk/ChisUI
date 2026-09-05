import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import * as Vue from 'vue'
import { compileTemplate, parse } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'

const filename = 'src/components/TablePro/index.vue'
const { descriptor } = parse(readFileSync(filename, 'utf8'))
const { code, errors } = compileTemplate({ source: descriptor.template.content, filename, id: 'slots-test' })
assert.deepEqual(errors, [])
const render = new Function('Vue', code
  .replace(/import \{([^}]+)\} from "vue"/g, (_, imports) =>
    `const {${imports.replace(/\bas\b/g, ':')}} = Vue`)
  .replace('export function render', 'return function render'))(Vue)

async function renderSlots(slots) {
  let received
  const PageStub = {
    setup(_, context) {
      received = context.slots
      return () => Vue.h('div', Object.entries(context.slots).map(([name, slot]) =>
        Vue.h('section', { 'data-slot': name }, slot({
          hasTable: true, row: { id: 7 }, column: 'name', value: 'Alice',
        }))))
    },
  }
  const Wrapper = {
    components: {
      PageComponent: PageStub,
      ...Object.fromEntries(['Button', 'Icon', 'Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue', 'Input']
        .map(name => [name, { render: () => null }])),
    },
    setup(_, { slots }) {
      return {
        forwardedSlotNames: () => Object.keys(slots).filter(name => !['condition', 'actions', 'cell', 'bodyCell'].includes(name)),
        columns: [], rows: [], pagination: {}, loading: false, rowKey: 'id',
        visibleFormItems: [], defaultSpan: 24, queryLoading: false,
        changePage() {}, search() {}, handleCreate() {},
      }
    },
    render,
  }
  const html = await renderToString(Vue.createSSRApp({ render: () => Vue.h(Wrapper, {}, slots) }))
  return { html, received }
}

test('TablePro forwards layout slots and scoped table parameters', async () => {
  const { html } = await renderSlots({
    left: () => '1111', top: () => 'top content', advanced: () => 'advanced content',
    table: ({ hasTable }) => `custom table: ${hasTable}`,
    condition: () => 'custom query', actions: () => 'custom actions',
    cell: ({ row, column, value }) => `${row.id}:${column}:${value}`,
  })
  for (const content of ['1111', 'top content', 'advanced content', 'custom table: true', 'custom query', 'custom actions', '7:name:Alice']) {
    assert.ok(html.includes(content), content)
  }
})

test('absent optional slots preserve PageComponent defaults and cell text', async () => {
  const { html, received } = await renderSlots({})
  for (const name of ['left', 'top', 'advanced', 'table']) assert.equal(received[name], undefined)
  assert.ok(html.includes('Alice'))
})

test('bodyCell retains precedence over cell and receives its scope', async () => {
  const { html } = await renderSlots({
    bodyCell: ({ value }) => `body:${value}`,
    cell: () => 'should not render',
  })
  assert.ok(html.includes('body:Alice'))
  assert.ok(!html.includes('should not render'))
})
