<template>
  <div>
    <h1>分级管理当前路由信息</h1>
    <p>路径: {{ route.path }}</p>
    <p>完整的路径: {{ route.fullPath }}</p>
    <p>查询参数: {{ route.query }}</p>
    <p>参数: {{ route.params }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

defineOptions({
  name: 'dagl_fjgljl'
});

const route = useRoute();
</script>
