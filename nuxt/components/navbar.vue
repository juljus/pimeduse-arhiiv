<template>
    <div>
        <nav class="navbar">
            <div class="navbar-toggle" @click="toggleMenu" :class="{ open: menuOpen }">
                &#9776;
            </div>
            <div class="menu" :class="{ active: menuOpen }">
                <ul>
                    <li><a href="/">pimeduse arhiiv</a></li>
                    <li v-for="file in files" :key="file"><a :href="`/arhiiv/${file}`">{{ file }}</a></li>
                    <li><a href="/arhiiv/pildid">pildid</a></li>
                </ul>
            </div>
        </nav>
    </div>
</template>

<script>
export default {
    data() {
        return {
            menuOpen: false,
            files: [
                'foo',
                'bar',
            ]
        };
    },
    methods: {
        toggleMenu() {
            this.menuOpen = !this.menuOpen;
        }
    }
};
</script>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    padding: 1rem;
    background-color: transparent;
    color: white;
    z-index: 1000;
}

.navbar-toggle {
    position: absolute;
    top: 1rem;
    right: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1001;
    background-color: #444;
    padding: 10px 15px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    font-weight: bold;
    border-left: 2px solid #666;
    border-top: 2px solid #666;
    border-bottom: 2px solid #666;
    box-shadow: -3px 3px 0px #222;
}

.navbar-toggle:hover {
    background-color: #555;
}

.navbar-toggle.open {
    right: 250px; /* Position it at the left edge of the menu */
    box-shadow: -1px 1px 0px #222;
}

.menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 250px;
    height: 100%;
    background-color: #444;
    padding: 2rem 1rem 1rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    border-left: 2px solid #666;
    box-shadow: -5px 0px 15px rgba(0, 0, 0, 0.5);
}

.menu.active {
    transform: translateX(0);
}

.menu ul {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
}

.menu li {
    margin: 1.5rem 0;
    border-bottom: 1px solid #555;
    padding-bottom: 0.5rem;
}

.menu a {
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    letter-spacing: 1px;
    text-transform: lowercase;
    transition: all 0.2s;
}

.menu a:hover {
    color: #ccc;
    padding-left: 5px;
}

.menu li:first-child a {
    font-weight: bold;
    font-size: 1.3rem;
    display: inline-block;
    padding-bottom: 0.3rem;
}
</style>
