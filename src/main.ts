import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
// import '@ionic/vue/css/palettes/dark.class.css'; 
// import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import { StatusBar, Style } from '@capacitor/status-bar';
import { Drivers, Storage } from '@ionic/storage';
import { createPinia } from 'pinia';

// 设置状态栏为透明沉浸式
StatusBar.setOverlaysWebView({ overlay: true });
StatusBar.setBackgroundColor({ color: '#00000000' });
StatusBar.setStyle({ style: Style.Light });

const app = createApp(App)

// 配置存储
const storage = new Storage({
  name: '__mydb',
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
});
(async () => {
  await storage.create();
})();
app.provide('storage', storage); // 提供给全局使用

app.use(createPinia())
app.use(IonicVue)
app.use(router)

router.isReady().then(() => {
  app.mount('#app');
});
