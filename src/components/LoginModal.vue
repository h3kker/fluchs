<script setup lang="ts">
import { ref } from "vue";
const emits = defineEmits(["close", "login"]);
const props = defineProps(["server", "token", "error"]);

const formServer = ref(props.server);
const formToken = ref(props.token);
</script>
<template>
    <form @submit.prevent="$emit('login', formServer, formToken)">
        <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
                <p class="modal-card-title">Login</p>
            </header>
            <section class="modal-card-body">
                <b-field label="Server URL">
                    <b-input type="url" v-model="formServer" placeholder="https://miniflux.testha.se/" required></b-input>
                </b-field>
                <b-field label="Token">
                    <b-input type="password" v-model="formToken" password-reveal required></b-input>
                </b-field>
                <b-message v-if="error" type="is-danger" has-icon>
                    {{error}}
                </b-message>
            </section>
            <footer class="modal-card-foot">
                <b-button label="Close" @click="$emit('close')" />
                <b-button label="Login" type="is-primary" native-type="submit" />
            </footer>
        </div>
    </form>
</template>