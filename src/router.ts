import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import WeatherMain from './pages/WeatherMain.vue';
import FavoriteWeather from './pages/FavoriteWeather.vue'
import NotFound from './pages/NotFound.vue'

const routes: Array<RouteRecordRaw> =[
   
  { path: '/', component: WeatherMain },
  { path: '/favorite_weather', component: FavoriteWeather },
  { path: '/:pathMatch(.*)*', name: 'Not Found', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;