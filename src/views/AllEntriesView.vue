<script setup lang="ts">
import { useEntriesStore } from '../stores/entries';
import EntryList from '../components/EntryList.vue';
import { ref } from 'vue';

const entriesStore = useEntriesStore();

function refresh(force=false) {
    entriesStore.getAllEntries(force);
}
const isLoading = ref(false);
const curState = ref("init");

entriesStore.state.subscribe(
    v => {
        isLoading.value = v === 'loading';
        curState.value = v;
    }
);
refresh();
</script>
<template>
    <div class="container">
        <div class="mb-4">
            <b-breadcrumb size="is-large">
                <b-breadcrumb-item 
                    tag="router-link" 
                    :to="{ name: 'home' }">
                    Categories
                </b-breadcrumb-item>
                <b-breadcrumb-item active>
                    All
                </b-breadcrumb-item>
            </b-breadcrumb>
        </div>
        <div id="top" class="block" v-if="curState == 'ready'">
            <EntryList @refresh="(force) => refresh(force)" />
        </div>
        <b-loading v-model="isLoading"></b-loading>
    </div>
    
</template>