<script setup lang="ts">
import { ref } from 'vue';
import { useFeedsStore } from '../stores/feeds';
const props = defineProps(["feed"]);

const feedsStore = useFeedsStore();

const icon = ref(undefined as string | undefined);
if (props.feed?.icon.icon_id) {
    feedsStore.getIcon(props.feed)
        .then(d => icon.value = d);
}
</script>
<template>
    <img v-if="icon" :src="'data:'+icon" class="feedIcon">
</template>
<style>
img.feedIcon {
  height: 1.1rem;
  vertical-align: middle;
}
</style>