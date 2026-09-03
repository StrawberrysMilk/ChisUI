import type { AppMenuNode, RawMenuItem } from './types'

const iconRules: Array<[RegExp, string]> = [
  [/档案|居民/, 'solar:folder-with-files-linear'],
  [/家庭|医生/, 'solar:users-group-rounded-linear'],
  [/体检|检查/, 'solar:clipboard-check-linear'],
  [/慢病|高血压|糖尿病/, 'solar:heart-pulse-linear'],
  [/妇幼|儿童|孕产/, 'solar:users-group-two-rounded-linear'],
  [/疫苗|免疫/, 'solar:syringe-linear'],
  [/报表|统计|分析/, 'solar:chart-2-linear'],
  [/系统|设置|配置/, 'solar:settings-linear'],
  [/机构|组织/, 'solar:buildings-2-linear'],
  [/设备|智能/, 'solar:monitor-smartphone-linear'],
]

export function resolveMenuIcon(icon: unknown, title: string, hasChildren = false) {
  if (typeof icon === 'string' && icon.includes(':')) return icon
  return iconRules.find(([rule]) => rule.test(title))?.[1]
    ?? (hasChildren ? 'solar:folder-linear' : 'solar:document-text-linear')
}

function isHidden(item: RawMenuItem) {
  return item.hidden === true || item.show === false || item.meta?.show === false
}

function normalizeItem(item: RawMenuItem): AppMenuNode {
  const title = String(item.meta?.title ?? item.name ?? '未命名菜单')
  const children = (Array.isArray(item.children) ? item.children : [])
    .filter((child) => !isHidden(child))
    .map(normalizeItem)

  return {
    id: String(item.id ?? item.name ?? item.path ?? title),
    parentId: String(item.pid ?? 0),
    title,
    path: String(item.path ?? ''),
    routeName: String(item.name ?? ''),
    icon: resolveMenuIcon(item.meta?.icon ?? item.icon, title, children.length > 0),
    target: typeof item.meta?.target === 'string' ? item.meta.target : undefined,
    children,
  }
}

export function buildAppMenuTree(source: RawMenuItem[]): AppMenuNode[] {
  const visible = source.filter((item) => !isHidden(item))
  if (visible.some((item) => Array.isArray(item.children) && item.children.length > 0)) {
    return visible.map(normalizeItem)
  }

  const nodes = visible.map(normalizeItem)
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const roots: AppMenuNode[] = []

  nodes.forEach((node) => {
    const parent = nodeMap.get(node.parentId)
    if (parent && parent !== node) parent.children.push(node)
    else roots.push(node)
  })

  return roots
}

export function flattenMenu(nodes: AppMenuNode[]): AppMenuNode[] {
  return nodes.flatMap((node) => [node, ...flattenMenu(node.children)])
}
