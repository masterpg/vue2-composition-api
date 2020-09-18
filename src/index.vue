<style lang="sass">
@import 'src/styles/app.variables'

.header
  background-color: $indigo-5

.menu-list
  min-width: 150px

.page
  height: 100vh

.drawer-scroll-area
  height: 100%
</style>

<template>
  <q-layout id="app" view="lHh Lpr lFf">
    <q-header elevated class="glossy header">
      <q-toolbar>
        <q-btn flat dense round aria-label="Menu" icon="menu" @click="state.leftDrawerOpen = !state.leftDrawerOpen" />

        <q-toolbar-title>
          Vue2 Composition API
        </q-toolbar-title>

        <div v-show="isSignedIn" class="app-mr-16">{{ user.displayName }}</div>
        <div class="app-mr-16">Quasar v{{ $q.version }}</div>

        <q-btn flat round dense color="white" icon="more_vert">
          <q-menu>
            <q-list class="menu-list">
              <q-item v-show="!isSignedIn" v-close-popup clickable>
                <q-item-section @click="signInMenuItemOnClick">サインイン</q-item-section>
              </q-item>
              <q-item v-show="isSignedIn" v-close-popup clickable>
                <q-item-section @click="signOutMenuItemOnClick">サインアウト</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="state.leftDrawerOpen" :width="300" :breakpoint="500" show-if-above bordered content-class="bg-grey-2">
      <q-scroll-area class="drawer-scroll-area">
        <q-list padding>
          <template v-for="(item, index) in state.pages">
            <q-item :key="index" v-ripple :to="item.path" clickable>
              <q-item-section>{{ item.title }}</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="page">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { LogicContainerKey, createLogicContainer } from '@/logic'
import { computed, defineComponent, inject, provide, reactive } from '@vue/composition-api'
import { Platform } from 'quasar'

export default defineComponent({
  setup() {
    const state = reactive({
      leftDrawerOpen: Platform.is.desktop,
      pages: [
        {
          title: 'Home',
          path: '/',
        },
        {
          title: 'ABC',
          path: '/abc',
        },
        {
          title: 'Shop',
          path: '/shop',
        },
      ] as { title: string; path: string }[],
    })
    provide(LogicContainerKey, createLogicContainer())
    const logic = inject(LogicContainerKey)!

    const isSignedIn = computed(() => logic.auth.isSignedIn)

    function signInMenuItemOnClick() {
      logic.auth.signIn()
    }

    function signOutMenuItemOnClick() {
      logic.auth.signOut()
    }

    return {
      state,
      isSignedIn,
      user: logic.auth.user,
      signInMenuItemOnClick,
      signOutMenuItemOnClick,
    }
  },
})
</script>
