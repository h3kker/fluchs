<script setup lang="ts">
import type { Subscription } from 'rxjs';
import { ref, onUnmounted } from 'vue';
import { useFeedsStore } from '../stores/feeds';
const props = defineProps(["feed"]);

const feedsStore = useFeedsStore();

let sub: Subscription;
const icon = ref(undefined as string | undefined);
if (props.feed?.icon.icon_id) {
    sub = feedsStore.fetchIcon(props.feed).subscribe(
        i => icon.value = i
    );
}
onUnmounted(() => {
    if (sub) sub.unsubscribe();
});
</script>
<template>
    <img v-if="icon" :src="'data:'+icon" class="feedIcon">
</template>
<style scoped>
img.feedIcon {
  height: 1.1rem;
  vertical-align: middle;
}
</style>