<template>
<div class="error-wrap">
    <h3>错误：页面不存在~</h3>
    <p class="intro">404</p>
</div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style lang="scss" scoped>
.error-wrap{
    width: 100%;
    min-height: 100vh;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    h3{
        font-size: 30px;
        margin-bottom: 20px;
    }
    p.intro{
        font-size: 62px;
        font-weight: bold;
    }
}
</style>
