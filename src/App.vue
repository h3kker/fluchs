<script setup lang="ts">
import { useRootStore } from "./stores/root";
import { useFeedsStore } from "./stores/feeds";
import { useRouter } from "vue-router/composables";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { DialogProgrammatic as Dialog } from "buefy";

const router = useRouter();
const rootStore = useRootStore();
const feedsStore = useFeedsStore();

const { user, isLoggedIn } = storeToRefs(rootStore);
const { getUserProfile, registerToken, clearToken } = rootStore;
const { getFeeds, getFeedCounters } = feedsStore;

getUserProfile().then(() => {
  return getFeeds();
}).then(() => {
  getFeedCounters();
});

const isLoading = ref(true);
rootStore.state.subscribe((v) => (isLoading.value = v === "checking"));

function promptForToken() {
  Dialog.prompt({
    message: "Gimme da token",
    inputAttrs: {
      placeholder: "Create a token in miniflux and enter it here",
    },
    trapFocus: true,
    onConfirm: (value: string) => {
      registerToken(value);
    },
  });
}

const searchText = ref('');
function search() {
  router.push({
    name: 'all-entries',
    query: { q: searchText.value }
  });
}
</script>

<template>
  <div id="app">
    <b-loading v-model="isLoading"></b-loading>
    <header>
      <div class="container">
        <b-navbar>
          <template #brand>
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
              Fluchshase!
            </b-navbar-item>
          </template>
          <template #start>
            <b-navbar-item tag="router-link" :to="{ name: 'starred-entries' }">
              <b-icon icon="star"></b-icon>
            </b-navbar-item>
            <b-navbar-item>
              <b-input placeholder="Search..."
                type="search"
                v-model="searchText"
                icon="text-search"
                @icon-click="search()"
                @keyup.enter.native="search()"
                icon-clickable>
              </b-input>
            </b-navbar-item>
          </template>
          <template #end>
            <b-navbar-dropdown :label="user.username" v-if="isLoggedIn">
              <b-navbar-item @click="clearToken()"> Log out </b-navbar-item>
            </b-navbar-dropdown>
            <b-navbar-item tag="div" v-else>
              <button @click="promptForToken()" class="button is-info">
                Log in
              </button>
            </b-navbar-item>
          </template>
        </b-navbar>
      </div>
    </header>
    <section class="section" v-if="isLoggedIn">
      <main>
        <router-view />
      </main>
    </section>
    <section class="section" v-else-if="!isLoading">
      <main>
        <div class="columns">
          <div class="column is-one-third"></div>
          <div class="column is-one-third">
            <b-message title="No Token!" type="is-danger" has-icon>
              Cannot do much without a token. Please to configure.
            </b-message>
          </div>
        </div>
      </main>
    </section>
  </div>
</template>

<style scoped></style>
