<script lang="ts">
import { defineComponent, h } from 'vue'
import { useRoute, RouterView } from 'vue-router' // 显式导入 RouterView
import { CONFIG_DATA } from '@/store/mutation-types'
import { readStorage } from '@/utils/storage'

export default defineComponent({
  name: 'KeepAliveWrapper',
  props: {
    keepAlive: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const route = useRoute()
    const config = readStorage(CONFIG_DATA, {})
    const pageCacheNum = 15

    return () => {
      // 使用 RouterView 组件而非字符串
      return h(
        RouterView,
        {},
        {
          default: ({ Component }: { Component: any }) => {
            const shouldKeepAlive = (props.keepAlive || route.meta?.keepAlive) && route.meta?.keepAlive !== false

            if (shouldKeepAlive) {
              return h(
                'keep-alive',
                { max: pageCacheNum },
                h(Component)
              )
            } else {
              return h(Component)
            }
          }
        }
      )
    }
  }
})
</script>
