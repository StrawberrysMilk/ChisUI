import { createApp } from 'vue';
// Keep legacy application helpers in a lower-priority layer so they cannot
// override shadcn/Tailwind component utilities.
import '@/assets/css/global.less';
import './style.css';
import './core/lazy_use';
import App from './App.vue';
import router from './permission';
import pinia from '@/store';
import 'vue-sonner/style.css';
import 'vxe-table/lib/style.css';
import VxeUITable from 'vxe-table';
import { migrateLegacyAuthCache } from '@/utils/storage';
import ShadcnVue from '@/plugins/shadcn-vue';

const app = createApp(App);
migrateLegacyAuthCache();

app.use(pinia);
app.use(router);
app.use(VxeUITable);
app.use(ShadcnVue);
app.mount('#app');
