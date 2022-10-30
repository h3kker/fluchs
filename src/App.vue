<script setup lang="ts">
import { useRootStore } from "./stores/root";
import { storeToRefs } from "pinia";
import { DialogProgrammatic as Dialog } from 'buefy'


const { user, isLoggedIn } = storeToRefs(useRootStore());

const { getUserProfile, registerToken, clearToken } = useRootStore();
getUserProfile();

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

</script>

<template>
  <div id="app">
    <header>
      <div class="container">
        <b-navbar>
          <template #brand>
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
              Fluchshase!
            </b-navbar-item>
          </template>
          <template #end>
            <b-navbar-dropdown :label="user.username" v-if="isLoggedIn">
              <b-navbar-item @click="clearToken()">
                Log out
              </b-navbar-item>
            </b-navbar-dropdown>
            <b-navbar-item tag="div" v-else>
              <button @click="promptForToken()" class="button is-info">Log in</button>
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
    <section class="section" v-else>
      <main>
        <div class="columns">
          <div class="column is-one-third"></div>
          <div class="column is-one-third">
          <b-message 
            title="No Token!"
            type="is-danger" 
            has-icon>
              Cannot do much without a token. Please to configure.
          </b-message>
          </div>
        </div>
      </main>
    </section>
  </div>
</template>

<style scoped></style>
