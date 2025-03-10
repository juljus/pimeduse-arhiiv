<template>
    <div>
        <ContentRenderer v-if="page" :value="page" class="index-page prose" />
    </div>
</template>

<script setup>
    const route = useRoute()

    const { data: page } = await useAsyncData(route.path, () => {
        return queryCollection('main_page').first()
    })
</script>

<style>
.index-page {
    width: 100%;
    max-width: 100%;
}

.index-page p {
    margin-bottom: 1.2em;
}

.index-page ul,
.index-page ol {
    margin-left: 1.5em;
    margin-bottom: 1.2em;
}

.index-page li {
    margin-bottom: 0.5em;
}

@media (min-width: 768px) {
    .index-page {
        width: 100%;
    }
}

@media (min-width: 1200px) {
    .index-page p,
    .index-page li {
        line-height: 1.7;
    }
}
</style>