import { createApp } from 'vue';

import router from './router';
import store from './store/index';

import App from './App.vue';

import BaseSpinner from './components/ui/BaseSpinner.vue';

const app = createApp(App)
app.config.globalProperties.$store = store;

app.use(router);
app.use(store);

app.component('base-spinner', BaseSpinner);

app.mount('#app');
