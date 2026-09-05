<!-- <template>
  <router-view></router-view>
</template> -->

<template>
  <RouterView />
  <AuthDialogs />
  <Toaster position="top-right" rich-colors />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
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
