<script lang="ts">
import { defineComponent, computed, ref, onMounted, onUpdated, h, useSlots, reactive } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader'

export default defineComponent({
  name: 'PageView',
  props: {
    avatar: {
      type: String,
      default: null
    },
    title: {
      type: [String, Boolean],
      default: true
    },
    logo: {
      type: String,
      default: null
    },
    directTabs: {
      type: Object,
      default: null
    }
  },
  setup(props, { slots }) {
    const route = useRoute()
    // const appStore = useAppStore() // 使用Pinia的app store
    const appStore = reactive({multiTab: true}) // 使用Pinia的app store
    const contentRef = ref<InstanceType<typeof PageHeader> | null>(null)
    const slotsData = useSlots()

    // 响应式数据
    const pageTitle = ref<string | null>(null)
    const description = ref<string | null>(null)
    const linkList = ref<any[]>([])
    const extraImage = ref<string>('')
    const search = ref<boolean>(false)
    const tabs = ref<any>({})

    // 计算属性
    const multiTab = computed(() => appStore.multiTab) // 从Pinia store获取
    const hasHeaderContentSlot = computed(() => !!slotsData.headerContent)

    // 获取页面元数据
    const getPageMeta = () => {
      pageTitle.value = ''

      if (contentRef.value) {
        const content = contentRef.value
        if ('pageMeta' in content) {
          // 处理pageMeta逻辑
          const meta = content.pageMeta
          pageTitle.value = meta.title || null
          description.value = meta.description || null
          linkList.value = meta.linkList || []
          extraImage.value = meta.extraImage || ''
          search.value = meta.search === true
          tabs.value = meta.tabs || {}
        } else {
          // 兼容旧版逻辑
          description.value = content.description || null
          linkList.value = content.linkList || []
          extraImage.value = content.extraImage || ''
          search.value = content.search === true
          tabs.value = content.tabs || {}
        }
      }
    }

    // 生命周期钩子
    onMounted(() => {
      tabs.value = props.directTabs || {}
      getPageMeta()
    })

    onUpdated(() => {
      getPageMeta()
    })

    // 使用 h 函数渲染
    return () => {
      // 构建页面头部内容
      const buildHeaderContent = () => {
        if (hasHeaderContentSlot.value && slotsData.headerContent) {
          return slotsData.headerContent()
        }
        if (description.value) {
          return h('div', [
            h('p', { style: 'font-size: 14px;color: rgba(0,0,0,.65)' }, description.value),
            h('div', { class: 'link' })
          ])
        }
        return null
      }

      // 构建额外内容
      const buildExtraContent = () => {
        if (slotsData.extra) {
          return slotsData.extra()
        }
        return h('div', { class: 'extra-img' }, [
          extraImage.value && h('img', { src: extraImage.value })
        ])
      }

      // 构建页面菜单
      const buildPageMenu = () => {
        const children = []

        if (search.value) {
          children.push(
            h('div', { class: 'page-menu-search' }, [
              h('a-input-search', {
                style: 'width: 80%; max-width: 522px;',
                placeholder: '请输入...',
                size: 'large',
                enterButton: '搜索'
              })
            ])
          )
        }

        if (tabs.value?.items) {
          children.push(
            h('div', { class: 'page-menu-tabs' }, [
              h('a-tabs', {
                tabBarStyle: { margin: 0 },
                activeKey: tabs.value.active?.(),
                onChange: tabs.value.callback
              }, tabs.value.items.map((item: any) =>
                h('a-tab-pane', { tab: item.title, key: item.key })
              ))
            ])
          )
        }

        return h('div', { slot: 'pageMenu' }, children)
      }

      // 构建主内容区域
      const buildMainContent = () => {
        const routerView = h('router-view', { ref: contentRef })

        return h('div', { class: 'content' }, [
          h('div', { class: 'page-header-index-wide' }, [
            slots.default?.() || (multiTab.value ? h('keep-alive', [routerView]) : routerView)
          ])
        ])
      }

      // 返回完整的页面结构
      return h('div', [
        !route.meta.hiddenHeaderContent && h(PageHeader, {
          title: pageTitle.value,
          logo: props.logo,
          avatar: props.avatar
        }, {
          action: () => slotsData.action?.(),
          content: buildHeaderContent,
          extra: buildExtraContent,
          pageMenu: buildPageMenu
        }),
        buildMainContent()
      ])
    }
  }
})
</script>

<style lang="less" scoped>
/* 样式部分保持不变 */
.content {
  .link {
    margin-top: 16px;

    &:not(:empty) {
      margin-bottom: 16px;
    }

    a {
      margin-right: 32px;
      height: 24px;
      line-height: 24px;
      display: inline-block;

      i {
        font-size: 24px;
        margin-right: 8px;
        vertical-align: middle;
      }

      span {
        height: 24px;
        line-height: 24px;
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
}

.page-menu-search {
  text-align: center;
  margin-bottom: 16px;
}

.page-menu-tabs {
  margin-top: 48px;
}

.extra-img {
  margin-top: -60px;
  text-align: center;
  width: 195px;

  img {
    width: 100%;
  }
}

.mobile {
  .extra-img {
    margin-top: 0;
    text-align: center;
    width: 96px;

    img {
      width: 100%;
    }
  }
}
</style>
