<template>
    <div>
        <header>
            <!-- Navbar -->
            <navbar/>
        </header>

        <!-- Page content -->
        <div class="page-content">
            <div class="content-container">
                <slot/>
            </div>
        </div>
    </div>
</template>

<style>
    html {
        font-family: garamond;
        background-color: #121212; /* Changed to a darker background */
        color: whitesmoke;
        font-size: 16px; /* Base font size for mobile */
    }

    body {
        /* mina */
        margin: 0;
        padding: 0;
    }

    .page-content {
        padding: 1em;
        margin-top: 2em;
    }

    .content-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 1em;
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

    p {
        font-size: 1.1rem;
        line-height: 1.5;
        margin-bottom: 1.2em;
    }

    /* Base content styling */
    .prose {
        font-size: 1.1rem;
        line-height: 1.6;
    }

    /* Responsive typography */
    @media (min-width: 768px) {
        html {
            font-size: 18px; /* Larger base font size for tablet */
        }

        h1 {
            font-size: 2.8rem;
        }

        h2 {
            font-size: 1.8rem;
        }

        p {
            font-size: 1.2rem;
            line-height: 1.6;
        }

        .page-content {
            padding: 2em;
        }
    }

    /* Large screens */
    @media (min-width: 1200px) {
        html {
            font-size: 20px; /* Even larger base font size for desktop */
        }

        .content-container {
            max-width: 1100px;
        }

        h1 {
            font-size: 3.2rem;
        }

        h2 {
            font-size: 2rem;
        }

        p {
            font-size: 1.25rem;
            line-height: 1.7;
        }
    }

    /* Extra large screens */
    @media (min-width: 1600px) {
        html {
            font-size: 22px;
        }
    }
</style>