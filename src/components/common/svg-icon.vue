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
console.log(props.icon.replaceAll(':', '--'))
</script>

<template>
  <i :style="style">
    <!-- <span :class="`icon-[${props.icon.replaceAll(':', '--')}] text-[${props.size || '1.4em'}]`"></span> -->
    <Icon :icon="icon" :height="props.size || '1.4em'" :width="props.size || '1.4em'" />
  </i>
</template>

<style scoped></style>