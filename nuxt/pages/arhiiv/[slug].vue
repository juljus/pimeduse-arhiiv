<template>
    <main>
        <ContentRenderer v-if="page" :value="page" class="content-page prose" />
    </main>
</template>

<script setup>
    const route = useRoute()

    const { data: page } = await useAsyncData(route.path, () => {
        return queryCollection('arhiiv').path(route.path).first()
    })

    console.log(route.path)
</script>

<style>
.content-page {
    width: 100%;
    max-width: 100%;
}

.content-page p {
    margin-bottom: 1.2em;
}

.content-page ul,
.content-page ol {
    margin-left: 1.5em;
    margin-bottom: 1.2em;
}

.content-page li {
    margin-bottom: 0.5em;
}

/* Better code block display if present */
.content-page pre {
    background-color: #333;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1.2em;
}

@media (min-width: 768px) {
    .content-page {
        width: 100%;
    }
}

@media (min-width: 1200px) {
    .content-page p,
    .content-page li {
        line-height: 1.7;
    }
}
</style>
