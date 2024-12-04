<script setup lang='ts'>
import {cashCategories} from '@/constants/cashCategories'

const show = ref(false)

const showAdd = () => {
  show.value = true
}

defineExpose({
  showAdd
})

</script>

<template>
  <transition name="slide">
    <div class="mask" v-show="show" @click="show = false">
      <div class="add-cash " @click.stop="">
        <footer>
          <ul>
            <li v-for="i in cashCategories">{{ i.title }}</li>
          </ul>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.mask {
  width: 100%;
  height: 100vh;
  z-index: 9999999;
}

.add-cash {
  height: 20em;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  position: fixed;
  bottom: 0;
  border-radius: 10px 10px 0 0;
  footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    ul {
      display: flex;
      width: 100%;
      list-style: none;
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
      padding: 0.3em;
      li {
        width: 60px;
        height: 2em;
        line-height: 2em;
        padding: 0.1em;
        overflow: hidden;
        text-align: center;
        background-color: antiquewhite;
      }
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}
</style>