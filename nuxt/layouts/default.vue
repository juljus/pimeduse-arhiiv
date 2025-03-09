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
        font-family: garamond;
        background-color: #232323;

        color: whitesmoke;
    }

    body {
        /* mina */
        margin: 2em;
    }

    h1 {
        color: white;
        font-size: 2.3rem;

        /* mina */
        text-align: center;
        font-weight: bold;
        margin-bottom: 1em;
    }

    h2 {
        font-size: 1.5rem;
        color: white;

        /* mina */
        font-style: italic;
        border-bottom: 0.001em solid rgb(110, 110, 110);
        margin-bottom: 0.8em;
        padding-bottom: 0;
        margin-top: 1.5em;
    }
</style>