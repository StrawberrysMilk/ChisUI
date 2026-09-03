<template>
  <div>
    首页
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'Home'
});

const chartRef = ref<0>()
</script>

<style scoped>
div {
  text-align: center;
}
</style>
