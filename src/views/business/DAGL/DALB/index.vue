<template>
  <div>
    <h1>档案管理当前路由信息</h1>
    <p>路径: {{ route.path }}</p>
    <p>完整的路径: {{ route.fullPath }}</p>
    <p>查询参数: {{ route.query }}</p>
    <p>参数: {{ route.params }}</p>
    <!-- <page /> -->
    <Button @click="btnClick">打开弹窗</Button>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
// import page from './page.vue';
import { h, ref, onMounted, onActivated, onDeactivated } from 'vue';
import { renderDialog } from './dagl';
import { Button } from '@/components/ui/button';

defineOptions({
  name: 'dagl_dalb'
});

const route = useRoute();
const open = ref(false);
const mask = ref(false);
const btnClick = () => {
  open.value = true;
  mask.value = true;
  renderDialog(
    {
      render() {
        return h('div', 'helloWord');
      },
    },
    null,
    { title: '带props的弹窗', width: 600, open, maskClosable: false, mask }
  );
};
</script>
