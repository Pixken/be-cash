<script setup lang='ts'>
import { Icon  } from '@iconify/vue'
const props = defineProps<{
  icon: string
  color?: string
  size?: number | string
}>()
const style = computed(() => {
  return {
    color: props.color ? props.color : '#7a818a',
    transition: 'all 0.3s',
  }
})
</script>

<template>
  <i :style="style">
    <Icon :icon="icon" :height="props.size || '1.4em'" :width="props.size || '1.4em'" :ssr="true" />
  </i>
</template>

<style scoped></style>