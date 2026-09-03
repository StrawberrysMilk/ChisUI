<!-- <template>
  <router-view></router-view>
</template> -->

<template>
  <a-config-provider :theme="themeConfig">
    <RouterView />
    <AuthDialogs />
    <Toaster position="top-right" rich-colors />
  </a-config-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
import { themeConfig } from '@/config/theme';
import AuthDialogs from '@/components/auth/AuthDialogs.vue';
</script>
<style>
#app {
  width: 100%;
  min-height: 100%;
  font-size: 14px;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
</style>
