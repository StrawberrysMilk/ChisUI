<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { readRawStorage } from '@/utils/storage';

const route = useRoute();

const link = computed(() => route.meta.link as string);
const url = computed(() => {
  if (!link.value) return '';

  return link.value.includes('token=')
    ? `${link.value}${readRawStorage(ACCESS_TOKEN)}`
    : link.value;
});

const iframeHeight = computed(() => {
  const deviceHeight = document.documentElement.clientHeight;
  return `${deviceHeight - 260}px`;
});
</script>

<template>
  <template v-if="!link">
    404
  </template>
  <iframe
    v-else
    id="iframe"
    :height="iframeHeight"
    :src="url"
    style="width:100%;overflow:hidden;"
    frameborder="0"
  ></iframe>
</template>
