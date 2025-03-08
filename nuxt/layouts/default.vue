<template>
    <div class="text-gray-400 bg-stone-900 font-mono h-screen">
        <header>

            <!-- Navbar -->
            <!-- <navbar/> -->

        </header>

        <!-- Page content -->
        <div class="page-content">
            <slot/>
        </div>

    </div>
</template>

<style>
    h1 {
        font-size: 2rem;
        color: aqua;
        font-weight: bold;
    }

    h2 {
        font-size: 1.5rem;
        color: aqua;
        font-style: italic;
    }
</style>