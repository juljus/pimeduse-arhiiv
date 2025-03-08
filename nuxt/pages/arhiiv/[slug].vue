<template>
    <main>
        <ContentRenderer v-if="page" :value="page" />
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

</style>