import {
  defineAsyncComponent,
  markRaw,
  reactive,
  shallowRef,
  watch,
  type WatchStopHandle,
} from 'vue'
import { toast } from 'vue-sonner'
import { getMenuResponsibility, getMenuRouteRoleList } from '@/api/modular/system/menuManage'
import { renderDialogForm } from '@/utils/CommonMethod/DynamicallyCreateForms'
import type { MenuFormDialogProps } from './type'
import GnTable from '../GnTable/index.vue'

const WorkResponsibilityEditor = defineAsyncComponent(
  () => import('../WorkResponsibilityEditor/index.vue'),
)

export function useMenuFormDialog(props: Readonly<MenuFormDialogProps>) {
  const mode = shallowRef<'add' | 'edit'>('add')
  const dialog = shallowRef<ReturnType<typeof renderDialogForm>>()
  let stopModelWatch: WatchStopHandle | undefined
  let contentRequestVersion = 0
  let cachedTreeSource: unknown = props.treeRows
  const treeCache = new Map<string, any[]>()
  const buildTree = (application: unknown) => {
    if (cachedTreeSource !== props.treeRows) {
      cachedTreeSource = props.treeRows
      treeCache.clear()
    }
    const cacheKey = String(application ?? '')
    const cached = treeCache.get(cacheKey)
    if (cached) return cached
    const source = props.treeRows
    const hasApplication = source.some(
      (item) => item.application != null && String(item.application) !== '',
    )
    const flat: any[] = []
    const visit = (nodes: any[], inheritedApplication?: unknown, inheritedParent?: unknown) => {
      nodes.forEach((item) => {
        const itemApplication = item.application ?? inheritedApplication
        const parentId = item.pid ?? item.parentId ?? inheritedParent
        // 按钮级菜单不可作为父级菜单，因此不放入树选择数据。
        if (String(item.type ?? '') === '2') {
          if (Array.isArray(item.children)) visit(item.children, itemApplication, inheritedParent)
          return
        }
        const copy = {
          ...item,
          application: itemApplication,
          pid: parentId,
          parentId,
          label: item.label ?? item.name ?? item.title,
          value: item.value ?? item.id,
          children: [] as any[],
        }
        if (!hasApplication || String(itemApplication ?? '') === String(application ?? ''))
          flat.push(copy)
        if (Array.isArray(item.children)) visit(item.children, itemApplication, item.id)
      })
    }
    visit(source)
    const byId = new Map(flat.map((item) => [String(item.id), item]))
    const result: any[] = []
    for (const node of byId.values()) {
      const parentId = node.parentId ?? node.pid
      const parent = parentId != null ? byId.get(String(parentId)) : undefined
      if (parent && parent !== node) parent.children.push(node)
      else result.push(node)
    }
    const tree = [{ label: '顶级菜单', value: 0, children: result }]
    treeCache.set(cacheKey, tree)
    return tree
  }
  const items = [
    {
      type: 'input',
      label: '菜单ID',
      field: 'id',
      placeholder: '请输入菜单ID',
      required: true,
      span: 12,
    },
    {
      type: 'input',
      label: '菜单名称',
      field: 'name',
      placeholder: '请输入菜单名称',
      required: true,
      span: 12,
    },
    {
      type: 'input',
      label: '菜单编号',
      field: 'code',
      placeholder: '请输入菜单编号',
      required: true,
      span: 12,
    },
    {
      type: 'select',
      label: '所属应用',
      field: 'application',
      required: true,
      span: 12,
      options: () => props.apps.map((item) => ({ label: item.name, value: item.code ?? item.id })),
    },
    {
      type: 'radioGroup',
      label: '菜单层级',
      field: 'type',
      required: true,
      span: 12,
      options: () =>
        props.typeDict.map((item) => ({
          label: item.value ?? item.label,
          value: String(item.code ?? item.value),
        })),
    },
    {
      type: 'treeSelect',
      label: '父级菜单',
      field: 'pid',
      span: 12,
      hidden: ({ model }: any) => String(model.type) === '0',
      required: ({ model }: any) => String(model.type) !== '0',
      placeholder: '请选择父级菜单',
      treeData: ({ model }: any) => buildTree(model.application),
    },
    {
      type: 'input',
      label: '重定向',
      field: 'redirect',
      span: 12,
      hidden: ({ model }: any) => String(model.type) !== '0',
      placeholder: '请输入重定向地址',
    },
    {
      type: 'radioGroup',
      label: '打开方式',
      field: 'openType',
      required: true,
      span: 12,
      disabled: ({ model }: any) => String(model.type) === '2',
      options: [
        { label: '无', value: '0' },
        { label: '组件', value: '1' },
        { label: '内链', value: '2' },
        { label: '外链', value: '3' },
      ],
    },
    {
      type: 'select',
      label: '菜单级别',
      field: 'cdqxjb',
      span: 12,
      required: ({ model }: any) => String(model.type) === '1',
      options: [
        { label: '镇级', value: 1 },
        { label: '县级', value: 2 },
        { label: '市级', value: 3 },
      ],
    },
    {
      type: 'switch',
      label: '免刷名单',
      field: 'msmd',
      span: 12,
      hidden: ({ model }: any) => String(model.type) !== '1',
    },
    { type: 'separator', field: '__separator__', span: 24 },
    {
      type: 'input',
      label: '前端组件',
      field: 'component',
      placeholder: '请输入前端组件',
      span: 12,
      required: ({ model }: any) => String(model.type) !== '2' && String(model.openType) !== '3',
      disabled: ({ model }: any) => String(model.type) === '2' || String(model.openType) === '3',
    },
    {
      type: 'input',
      label: '路由地址',
      field: 'router',
      placeholder: '请输入路由',
      span: 12,
      hidden: ({ model }: any) => String(model.type) === '2',
      required: ({ model }: any) => String(model.type) !== '2',
    },
    {
      type: 'input',
      label: '权限标识',
      field: 'permission',
      placeholder: '请输入权限标识',
      span: 12,
      hidden: ({ model }: any) => String(model.type) !== '2',
      required: ({ model }: any) => String(model.type) === '2',
    },
    {
      type: 'input',
      label: '内外链地址',
      field: 'link',
      placeholder: '请输入内链打开地址',
      span: 12,
      hidden: ({ model }: any) => String(model.type) === '2',
      disabled: ({ model }: any) => !['2', '3'].includes(String(model.openType)),
      required: ({ model }: any) =>
        String(model.type) !== '2' && ['2', '3'].includes(String(model.openType)),
    },
    {
      type: 'input',
      label: '图标',
      field: 'icon',
      span: 12,
      hidden: ({ model }: any) => String(model.type) === '2',
    },
    {
      type: 'radioGroup',
      label: '权重',
      field: 'weight',
      span: 12,
      options: [
        { label: '系统权重', value: '1' },
        { label: '业务权重', value: '2' },
        { label: '管理权重', value: '3' },
      ],
    },
    { type: 'switch', label: '是否可见', field: 'visible', span: 12 },
    { type: 'input', label: '排序', field: 'sort', span: 12 },
    { type: 'textarea', label: '备注', field: 'remark', span: 12 },
    {
      type: markRaw(WorkResponsibilityEditor),
      label: '菜单管理工作职责',
      field: 'GZZZ',
      colSpan: 2,
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      hidden: ({ model }: any) => String(model.type) !== '1',
    },
    {
      type: markRaw(GnTable),
      label: '功能表格',
      field: 'gnTable',
      colSpan: 2,
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      hidden: ({ model }: any) => String(model.type) !== '2',
    },
  ]
  function open(record?: Record<string, any>, requestedMode?: 'add' | 'edit') {
    const requestVersion = ++contentRequestVersion
    stopModelWatch?.()
    const isEdit = requestedMode === 'edit' || (requestedMode == null && Boolean(record))
    mode.value = isEdit ? 'edit' : 'add'
    const model = reactive<Record<string, any>>(
      (() => {
        const initial = {
          id: '',
          pid: 0,
          name: '',
          code: '',
          application: props.apps[0]?.code ?? props.apps[0]?.id ?? '',
          type: '1',
          openType: '1',
          component: '',
          router: '',
          permission: '',
          link: '',
          redirect: '',
          icon: '',
          cdqxjb: undefined,
          weight: '1',
          visible: true,
          msmd: false,
          sort: 100,
          GZZZ: '',
          gnTable: [{ GNLY: '', GNMS: '' }],
          ...record,
        }
        if (!isEdit) return initial
        return {
          ...initial,
          type: String(record?.type ?? initial.type),
          openType:
            String(record?.type ?? initial.type) === '2'
              ? '0'
              : String(record?.openType ?? initial.openType),
          weight: String(record?.weight ?? initial.weight),
        }
      })(),
    )
    stopModelWatch = watch(
      () => String(model.application ?? ''),
      (application, previous) => {
        if (application !== previous) model.pid = 0
      },
      { immediate: false },
    )
    const stopTypeWatch = watch(
      () => String(model.type ?? ''),
      (type) => {
        // Keep the legacy default when a user changes the menu level.
        model.openType = type === '2' ? '0' : '1'
        if (type === '0') model.pid = '0'
        model.redirect = ''
        model.component = type === '0' ? 'RouteView' : ''
        model.router = ''
        model.link = ''
        model.icon = type === '2' ? '' : model.icon
        model.permission = ''
      },
    )
    const stopOpenWatch = watch(
      () => [String(model.type ?? ''), String(model.openType ?? '')],
      ([type, openType], [previousType, previousOpenType]) => {
        if (type === '2') {
          model.component = ''
          model.router = ''
          model.link = ''
          model.icon = ''
          model.permission = ''
          return
        }
        const wasLinkMode = type === previousType && ['2', '3'].includes(String(previousOpenType))
        if (!wasLinkMode || !['2', '3'].includes(openType)) model.link = ''
        if (openType === '3') model.component = ''
        else if (openType === '2') model.component = 'Iframe'
        else model.component = type === '0' ? 'RouteView' : ''
      },
    )
    const oldStop = stopModelWatch
    stopModelWatch = () => {
      oldStop?.()
      stopTypeWatch()
      stopOpenWatch()
    }

    if (isEdit && record?.id != null) {
      void getMenuResponsibility({ id: record.id })
        .then((response: any) => {
          if (requestVersion !== contentRequestVersion) return
          const result = response?.data ?? response
          if (result?.success === false) throw new Error(result.message || '工作职责加载失败')
          model.GZZZ = result?.mkgzzz ?? result?.data?.mkgzzz ?? ''
        })
        .catch((error: any) => {
          if (requestVersion === contentRequestVersion)
            toast.error(error?.message || '工作职责加载失败')
        })
    }

    if (isEdit && record?.id != null) {
      void getMenuRouteRoleList({ id: record.id })
        .then((response: any) => {
          if (requestVersion !== contentRequestVersion) return
          const result = response?.data ?? response
          if (result?.success === false) throw new Error(result.message || '功能路由加载失败')
          const rows = Array.isArray(result) ? result : result?.data
          model.gnTable = Array.isArray(rows)
            ? [
                ...rows.map((item: any) => ({
                  GNLY: item.gnly ?? item.GNLY ?? '',
                  GNMS: item.gnms ?? item.GNMS ?? '',
                })),
                { GNLY: '', GNMS: '' },
              ]
            : [{ GNLY: '', GNMS: '' }]
        })
        .catch((error: any) => {
          if (requestVersion === contentRequestVersion)
            toast.error(error?.message || '功能路由加载失败')
        })
    }

    dialog.value = renderDialogForm(
      {
        formItems: items,
        modelValue: model,
        componentInstance: {
          submit: (values) => {
            const rows = Array.isArray(values.gnTable) ? values.gnTable : []
            const routeRows =
              String(values.type) === '2'
                ? rows.filter(
                    (row: any) => String(row.GNLY ?? '').trim() && String(row.GNMS ?? '').trim(),
                  )
                : []
            const duplicateRoute = new Set<string>()
            for (const row of routeRows) {
              const route = String(row.GNLY).trim()
              if (duplicateRoute.has(route)) {
                toast.error('存在相同的【功能路由】')
                return false
              }
              duplicateRoute.add(route)
            }

            const payload: Record<string, any> = {
              ...values,
              requestData: { QueryKey: JSON.stringify(routeRows) },
            }
            delete payload.gnTable
            if (String(values.type) !== '1') delete payload.GZZZ
            return props.onSubmit(payload, mode.value)
          },
        },
      },
      {},
      {
        title: () => (mode.value === 'add' ? '新增菜单' : '编辑菜单'),
        width: 'min(900px, calc(100vw - 2rem))',
        cancelText: '取消',
        okText: '确定',
      },
    )
  }
  return {
    add: (parent?: Record<string, any>) =>
      open(parent ? { pid: parent.id, application: parent.application } : undefined, 'add'),
    edit: (record: Record<string, any>) => open(record, 'edit'),
    close: () => {
      contentRequestVersion += 1
      return dialog.value?.close()
    },
  }
}
