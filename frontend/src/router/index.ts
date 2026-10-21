import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AuthView from '../views/AuthView.vue';
import GruposView from '../views/GruposView.vue';
import GrupoDetalheView from '../views/GrupoDetalheView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/grupos',
  },
  {
    path: '/login',
    name: 'Auth',
    component: AuthView,
    meta: { guestOnly: true },
  },
  {
    path: '/grupos',
    name: 'Grupos',
    component: GruposView,
    meta: { requiresAuth: true },
  },
  {
    path: '/grupos/:grupoId',
    name: 'GrupoDetalhe',
    component: GrupoDetalheView,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/grupos',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.guestOnly && token) {
    next('/grupos');
  } else {
    next();
  }
});
