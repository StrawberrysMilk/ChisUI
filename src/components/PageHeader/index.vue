<script setup lang="ts">
import { pageHeaderDefaults } from './index'
import type { PageHeaderProps } from './type'

defineOptions({ name: 'PageHeader' })
withDefaults(defineProps<PageHeaderProps>(), pageHeaderDefaults)
</script>

<template>
  <div class="page-header">
    <div class="page-header-index-wide">
      <div class="detail">
        <div class="main" v-if="!$route.meta.hiddenHeaderContent">
          <div class="row">
            <h1 v-if="title" class="title">{{ title }}</h1>
            <div class="action">
              <slot name="action"></slot>
            </div>
          </div>
          <div class="row">
            <div v-if="avatar" class="avatar">
              <img :src="avatar" alt="" class="page-header-avatar" />
            </div>
            <div v-if="$slots.content" class="headerContent">
              <slot name="content"></slot>
            </div>
            <div v-if="$slots.extra" class="extra">
              <slot name="extra"></slot>
            </div>
          </div>
          <div>
            <slot name="pageMenu"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./index.scss"></style>
