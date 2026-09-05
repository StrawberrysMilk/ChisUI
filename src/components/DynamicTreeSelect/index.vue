<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { DynamicTreeNode } from '@/components/DynamicForm/type'
import { watch } from 'vue'
import type { DynamicTreeSelectProps, DynamicTreeSelectEmits } from './type'
import { useDynamicTreeSelect } from './index'

defineOptions({ name: 'DynamicTreeSelect' })
const props = withDefaults(defineProps<DynamicTreeSelectProps>(), { treeData: () => [] })
const emit = defineEmits<DynamicTreeSelectEmits>()
const { open, expanded, selected, nodeKey, label, toggle, choose } = useDynamicTreeSelect(props, emit)

watch(open, (value) => {
  if (value && expanded.value.size === 0 && props.treeData.length) {
    expanded.value = new Set(props.treeData.map((node, index) => nodeKey(node, index)))
  }
})

function isExpanded(node: DynamicTreeNode, index: number) {
  return expanded.value.has(nodeKey(node, index))
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        class="h-9 w-full justify-between font-normal"
        :disabled="disabled"
        :aria-invalid="ariaInvalid || undefined"
      >
        <span :class="selected ? 'text-foreground' : 'text-muted-foreground'">
          {{ selected ? label(selected) : (placeholder ?? '请选择') }}
        </span>
        <span class="text-xs opacity-50">v</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="max-h-72 w-[var(--reka-popper-anchor-width)] overflow-auto p-1" align="start">
      <div v-if="!treeData.length" class="px-2 py-6 text-center text-sm text-muted-foreground">暂无数据</div>
      <ul v-else class="space-y-0.5">
        <TreeNode
          v-for="(node, index) in treeData"
          :key="nodeKey(node, index)"
          :node="node"
          :index="index"
          :depth="0"
          :expanded="expanded"
          @toggle="toggle"
          @choose="choose"
        />
      </ul>
    </PopoverContent>
  </Popover>
</template>

<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'
let TreeNode: any
TreeNode = defineComponent({
      name: 'TreeNode',
      props: {
        node: { type: Object as PropType<DynamicTreeNode>, required: true },
        index: { type: Number, required: true },
        depth: { type: Number, required: true },
        expanded: { type: Object as PropType<Set<string>>, required: true },
      },
      emits: ['toggle', 'choose'],
      setup(p, { emit }) {
        const key = String(p.node.value ?? p.node.id ?? `${p.node.label ?? p.node.title ?? p.node.name}-${p.index}`)
        const text = String(p.node.label ?? p.node.title ?? p.node.name ?? p.node.value ?? p.node.id ?? '')
        return () => h('li', [
          h('div', { class: ['flex items-center rounded-sm px-1 py-1 text-sm hover:bg-accent', p.node.disabled && 'opacity-50'] }, [
            p.node.children?.length ? h('button', { type: 'button', class: 'mr-1 grid size-5 place-items-center text-xs', onClick: () => emit('toggle', p.node, p.index) }, p.expanded.has(key) ? 'v' : '>') : h('span', { class: 'mr-1 size-5' }),
            h('button', { type: 'button', class: 'min-w-0 flex-1 truncate text-left', disabled: p.node.disabled, onClick: () => emit('choose', p.node) }, text),
          ]),
          p.node.children?.length && p.expanded.has(key) ? h('ul', { class: 'ml-4' }, p.node.children.map((child, i) => h(TreeNode, { node: child, index: i, depth: p.depth + 1, expanded: p.expanded, onToggle: (...args: any[]) => emit('toggle', ...args), onChoose: (node: any) => emit('choose', node) }))) : null,
        ])
      },
    })
export default defineComponent({
  components: { TreeNode },
})
</script>
