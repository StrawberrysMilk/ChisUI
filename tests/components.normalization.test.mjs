import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { createRenderer, h, nextTick, reactive, ref } from 'vue'
import { createServer } from 'vite'

const renderer = createRenderer({
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  insert() {},
  remove() {},
  setText() {},
  setElementText() {},
  parentNode: () => null,
  nextSibling: () => null,
  patchProp() {},
})

function mountLogic(context, setup) {
  let result
  const app = renderer.createApp({
    setup() {
      result = setup()
      return () => h('div')
    },
  })
  app.mount({})
  context.after(() => app.unmount())
  return result
}

test('normalized components retain their reactive contracts', async (context) => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  context.after(() => server.close())

  await context.test(
    'dynamic form validates, clears errors and reacts to replacement models',
    async (context) => {
      const { useDynamicForm } = await server.ssrLoadModule('/src/components/DynamicForm/index.ts')
      const model = ref({ name: '' })
      const errors = ref({})
      const props = reactive({
        schema: [{ field: 'name', type: 'input', label: 'Name', required: true }],
      })
      const form = mountLogic(context, () => useDynamicForm(props, model, errors))
      assert.equal(await form.validate(), false)
      assert.ok(errors.value.name)
      form.update('name', 'Alice')
      assert.equal(errors.value.name, undefined)
      assert.equal(await form.validate(), true)
      model.value = { name: '' }
      assert.equal(await form.validate(), false)
      props.schema[0].hidden = true
      assert.equal(await form.validate(), true)
      form.resetValidation()
      assert.deepEqual(errors.value, {})
    },
  )

  await context.test(
    'pagination keeps bounds and emits the current pagination data',
    async (context) => {
      const { usePageComponentPagination } = await server.ssrLoadModule(
        '/src/components/PageComponentPagination/index.ts',
      )
      const props = reactive({ pagination: { current: 1, pageSize: 10, total: 21 } })
      const events = []
      const pager = mountLogic(context, () =>
        usePageComponentPagination(props, (...event) => events.push(event)),
      )
      assert.equal(pager.pageCount.value, 3)
      pager.changePage(0)
      pager.changePage(1)
      pager.changePage(4)
      assert.equal(events.length, 0)
      pager.changePage(2)
      assert.deepEqual(events, [['change', { current: 2, pageSize: 10, total: 21 }]])
      props.pagination = { current: 1, pageSize: 20, total: 0 }
      assert.equal(pager.pageCount.value, 1)
    },
  )

  await context.test(
    'table selection survives refresh and falls back when a row disappears',
    async (context) => {
      const { usePageComponentTable } = await server.ssrLoadModule(
        '/src/components/PageComponentTable/index.ts',
      )
      const props = reactive({
        columns: [],
        data: [{ id: 1 }, { id: 2 }],
        rowKey: 'id',
        loading: false,
        emptyText: '',
      })
      const events = []
      const table = mountLogic(context, () =>
        usePageComponentTable(props, (...event) => events.push(event)),
      )
      assert.equal(
        table.getRowClassName({ row: props.data[0], rowIndex: 0 }),
        'page-table__row--current',
      )
      const event = new Event('click')
      table.handleCellClick({ row: props.data[1], $event: event })
      assert.equal(events[0][0], 'rowClick')
      assert.equal(events[0][1].id, 2)
      assert.equal(events[0][2], event)
      props.data = [{ id: 2 }, { id: 3 }]
      await nextTick()
      assert.equal(
        table.getRowClassName({ row: props.data[0], rowIndex: 0 }),
        'page-table__row--current',
      )
      props.data = [{ id: 3 }]
      await nextTick()
      assert.equal(
        table.getRowClassName({ row: props.data[0], rowIndex: 0 }),
        'page-table__row--current',
      )
      props.data = []
      await nextTick()
      assert.equal(table.getRowClassName({ row: { id: 3 }, rowIndex: 0 }), '')
    },
  )
})

test('all shared Vue components have separated files and a public export', () => {
  const root = path.resolve('src/components')
  const entry = fs.readFileSync(path.join(root, 'index.ts'), 'utf8')
  let count = 0
  for (const directory of fs.readdirSync(root, { withFileTypes: true })) {
    if (!directory.isDirectory() || directory.name === 'ui') continue
    const dir = path.join(root, directory.name)
    if (!fs.existsSync(path.join(dir, 'index.vue'))) continue
    count++
    for (const name of ['index.ts', 'type.ts', 'index.scss'])
      assert.ok(fs.existsSync(path.join(dir, name)), `${directory.name}/${name}`)
    assert.ok(entry.includes(`'./${directory.name}/index.vue'`), `${directory.name} public export`)
  }
  assert.equal(count, 23)
})
