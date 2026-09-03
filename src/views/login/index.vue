<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { useDocumentTitleStore } from '@/store/global'
import LoginAccountForm from './components/LoginAccountForm.vue'

defineOptions({ name: 'Login' })

const documentTitleStore = useDocumentTitleStore()
const { title } = storeToRefs(documentTitleStore)

onMounted(async () => {
  try {
    await documentTitleStore.fetchTitle()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '未获取到系统名称')
  }
})
</script>

<template>
  <main class="login-page">
    <Card class="login-panel">
      <CardHeader class="login-header">
        <img src="@/assets/img/logoNEW.png" alt="" class="login-logo" />
        <CardTitle v-if="title" class="login-title">{{ title }}</CardTitle>
        <Skeleton v-else class="login-title-skeleton" />
      </CardHeader>

      <CardContent class="login-content">
        <LoginAccountForm />
      </CardContent>

      <CardFooter class="login-footer">
        <p>服务热线：<a href="tel:18584630881">18584630881</a></p>
        <p>版权所有 © 2021 重庆医事通科技发展有限公司 保留所有权利。 v8</p>
      </CardFooter>
    </Card>
  </main>
</template>

<style scoped lang="scss">
@use './index.scss';
</style>
