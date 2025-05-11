<template>
    <main>
        <div class="content-container">
            <ContentRenderer 
                v-if="page" 
                :value="page" 
                class="content-page prose content-fade-in" 
                :class="{ 'visible': contentVisible }" 
            />
        </div>
    </main>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    const route = useRoute();
    const contentVisible = ref(false);

    const { data: page } = await useAsyncData(route.path, () => {
        return queryCollection('arhiiv').path(route.path).first();
    });

    // Trigger the reveal animation after a small delay
    onMounted(() => {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
            contentVisible.value = true;
        }, 100);
    });
</script>

<style>
.content-container {
    width: 100%;
    max-width: 800px;
    padding: 0 1rem 3rem;
    margin: 0 auto;
}

.content-page {
    width: 100%;
    max-width: 100%;
}

/* Animation styles - same as on main page */
.content-fade-in {
    opacity: 0;
    clip-path: inset(0 0 100% 0); /* Clip from bottom to top */
    transition: opacity 1s ease-in-out, clip-path 1s ease-in-out; /* Animate opacity and clip-path */
}

.content-fade-in.visible {
    opacity: 1;
    clip-path: inset(0 0 0% 0); /* Reveal from top to bottom */
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
    
    .content-container {
        padding: 0 2rem 3rem;
    }
}

@media (min-width: 1200px) {
    .content-page p,
    .content-page li {
        line-height: 1.7;
    }
}
</style>
