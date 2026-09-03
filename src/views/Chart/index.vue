<template>
  <div>
    <h1>ECharts 示例</h1>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Chart',
  setup() {
    const chartRef = ref<0>
    return { chartRef };
  },
});
</script>

<style scoped>
div {
  text-align: center;
}
</style>
