<template>
    <div>
        <header>

            <!-- Navbar -->
            <navbar/>

        </header>

        <!-- Page content -->
        <div class="page-content">
            <slot/>
        </div>

    </div>
</template>

<style>
    html {
        font-family: 'Courier New', Courier, monospace;
        background-color: #333;
        color: #dbdbdb;
    }

    h1 {
        font-size: 2rem;
        color: whitesmoke;
        font-weight: bold;
        text-align: center;
    }

    h2 {
        font-size: 1.5rem;
        color: whitesmoke;
        font-style: italic;
        /* underline */
        text-decoration: underline;
    }
</style>