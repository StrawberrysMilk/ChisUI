import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
import { ref, createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

test('dialog submits once and stale list requests cannot clear the current loading state', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { useDynamicFormDialog } = await server.ssrLoadModule('/src/components/DynamicFormDialog/index.ts')
    let calls = 0
    let finishSave
    const callback = () => {
      calls++
      return new Promise((resolve) => { finishSave = resolve })
    }
    const open = ref(true)
    const dialog = useDynamicFormDialog({ schema: [], loading: false, onSubmit: callback },
      (event) => { if (event === 'submit') callback() }, open, ref({ name: 'test' }))
    dialog.formRef.value = { validate: async () => true }
    const saving = dialog.submit()
    await Promise.resolve()
    assert.equal(calls, 1)
    assert.equal(dialog.busy.value, true)
    assert.equal(await dialog.submit(), false)
    finishSave(false)
    await saving
    assert.equal(open.value, true)
    assert.equal(dialog.busy.value, false)

    const { useTablePro } = await server.ssrLoadModule('/src/components/TablePro/index.ts')
    const pending = []
    function getPage() { return new Promise((resolve, reject) => pending.push({ resolve, reject })) }
    let table
    await renderToString(createSSRApp({ setup() {
      table = useTablePro({ apis: { get: getPage }, formItems: [], columns: [], rowKey: 'id' }, ref({}), () => {})
      return () => null
    } }))
    const initial = table.loadData()
    pending[0].resolve({ rows: [{ id: 1 }], totalRows: 1 })
    await initial
    const first = table.loadData()
    const second = table.loadData()
    pending[1].reject(Object.assign(new Error('cancelled'), { name: 'AbortError' }))
    await first
    assert.equal(table.rows.value.length, 1)
    assert.equal(table.loading.value, true)
    assert.equal(table.queryLoading.value, true)
    pending[2].resolve({ rows: [{ id: 2 }], totalRows: 1 })
    await second
    assert.equal(table.rows.value[0].id, 2)
    assert.equal(table.loading.value, false)
  } finally {
    await server.close()
  }
})
