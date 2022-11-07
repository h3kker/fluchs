<script setup lang="ts">
import { useRootStore } from "./stores/root";
import { useFeedsStore } from "./stores/feeds";
import { useRouter } from "vue-router/composables";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { DialogProgrammatic as Dialog } from "buefy";
import LoginModal from "@/components/LoginModal.vue";
import { AxiosError } from "axios";

const router = useRouter();
const rootStore = useRootStore();
const feedsStore = useFeedsStore();

const { user, isLoggedIn, server, token } = storeToRefs(rootStore);
const { getUserProfile, registerToken, clearToken } = rootStore;
const { getFeeds, getFeedCounters } = feedsStore;

function loadInit() {
  return getUserProfile().then(() => {
    return getFeeds();
  }).then(() => {
    getFeedCounters();
  }).catch(() => {});
}
loadInit();

const isLoading = ref(true);
rootStore.state.subscribe((v) => (isLoading.value = v === "checking"));

const showLogin = ref(false);

const searchText = ref('');
function search() {
  router.push({
    name: 'all-entries',
    query: { q: searchText.value }
  });
}

const loginError = ref('');
function doRegisterToken(s: string, t: string) {
  loginError.value = '';
  registerToken(s, t)
    .then(() => {
      return getFeeds()
    })
    .then(() => {
      getFeedCounters();
      showLogin.value = false;
    })
    .catch((e: AxiosError) => {
      loginError.value = 
        e.response?.status === 401 ?  "Invalid token" :
        e.code === "ERR_NETWORK" ? "Invalid Server URL" : e.message;
    });
}
</script>

<template>
  <div id="app">
    <b-loading v-model="isLoading"></b-loading>
    <header>
      <div class="container">
        <b-navbar centered>
          <template #brand>
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
              <img src="./assets/klimtfox-wide.png">
            </b-navbar-item>
          </template>
          <template #start>
            <b-navbar-item tag="router-link" :to="{ name: 'starred-entries' }">
              <b-icon icon="star"></b-icon>&nbsp;
              Starred
            </b-navbar-item>
            <b-navbar-item>
              <b-field>
                <b-input placeholder="Search..."
                  type="search"
                  v-model="searchText"
                  icon="text-search"
                  @icon-click="search()"
                  @keyup.enter.native="search()"
                  icon-clickable>
                </b-input>
              </b-field>
            </b-navbar-item>
          </template>
          <template #end>
            <b-navbar-dropdown :label="user.username" v-if="isLoggedIn">
              <b-navbar-item @click="clearToken()"> Log out </b-navbar-item>
            </b-navbar-dropdown>
            <b-navbar-item tag="div" v-else>
              <button @click="showLogin = true" class="button is-info">
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
              Cannot do much without a token. Please to log in.
            </b-message>
          </div>
        </div>
      </main>
    </section>
    <footer class="footer">
      <div class="content has-text-centered">
        (c) 2022 Heinz Axelsson-Ekker - 
        <a href="https://codeberg.org/hekker/fluchs">View Source <img src="./assets/codeberg.svg"></a> - 
        <a href="http://opensource.org/licenses/mit-license.php">MIT Licence</a>.
      </div>
    </footer>
    <b-modal v-model="showLogin" has-model-card trap-focus>
      <template #default="props">
        <LoginModal :server="server" :token="token" :error="loginError" @close="props.close" @login="(s, t) => doRegisterToken(s, t)" />
      </template>
    </b-modal>
  </div>
</template>

<style scoped>
.navbar-brand img {
  max-height: 2.5rem;
}
</style>
