<template>
    <div>
        <nav class="navbar">
            <!-- Desktop navbar -->
            <div class="desktop-menu">
                <a href="/" class="site-title">pimeduse arhiiv</a>
                <div class="desktop-links">
                    <a v-for="file in files" :key="file" :href="`/arhiiv/${file}`">{{ file }}</a>
                    <a href="/arhiiv/pildid">pildid</a>
                </div>
            </div>

            <!-- Mobile navbar -->
            <div class="navbar-toggle" @click="toggleMenu" :class="{ open: menuOpen }">
                <img v-if="!menuOpen" src="/menu_closed.png" alt="Open menu" />
                <img v-else src="/menu_open.png" alt="Close menu" />
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
import { ref, onMounted } from 'vue';

export default {
    setup() {
        const menuOpen = ref(false);
        const errorMessage = ref(null);
        const files = ref([]);
        
        onMounted(() => {
            fetch('/api/arhiiv')
                .then((response) => response.json())
                .then((data) => {
                    if (data.files) {
                        // Remove the extension from each filename
                        files.value = data.files.map(file => file.replace(/\.[^/.]+$/, ''));
                        console.log('files: ', files.value);
                    } else {
                        errorMessage.value = 'No files found';
                    }
                })
                .catch(() => {
                    errorMessage.value = 'Error fetching files';
                });
        });
        
        const toggleMenu = () => {
            menuOpen.value = !menuOpen.value;
        };
        
        return {
            menuOpen,
            files,
            errorMessage,
            toggleMenu
        };
    }
};
</script>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    padding: 1rem;
    background-color: transparent;
    color: white;
    z-index: 1000;
    box-sizing: border-box;
    pointer-events: none;
}

/* Desktop menu styles - hidden on mobile */
.desktop-menu {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 1rem 2rem;
    background-color: rgba(40, 40, 40, 0.95);
    border-bottom: 1px solid #666;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 999;
    pointer-events: auto;
}

.site-title {
    font-size: 1.3rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
    margin-right: 2rem;
}

.desktop-links {
    display: flex;
    gap: 1.5rem;
}

.desktop-links a {
    color: #ddd;
    text-decoration: none;
    text-transform: lowercase;
    transition: all 0.2s;
    font-size: 1.05rem;
}

.desktop-links a:hover {
    color: white;
}

.navbar-toggle {
    position: fixed;
    top: 1rem;
    right: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1001;
    background-color: #383838;
    padding: 12px;  /* Equal padding on all sides */
    width: 48px;    /* Fixed width */
    height: 48px;   /* Fixed height to match width */
    display: flex;  /* For centering the image */
    align-items: center;
    justify-content: center;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    font-weight: bold;
    border-left: 2px solid #666;
    border-top: 2px solid #666;
    border-bottom: 2px solid #666;
    box-shadow: -3px 3px 0px #222;
    pointer-events: auto;
    box-sizing: border-box; /* Ensure padding is included in width/height */
}

.navbar-toggle img {
    width: 24px;
    height: 24px;
    display: block;
}

.navbar-toggle:hover {
    background-color: #4a4a4a;
}

.navbar-toggle.open {
    right: 250px;
    box-shadow: -1px 1px 0px #222;
}

.menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 250px;
    height: 100%;
    background-color: #383838;
    padding: 2rem 1rem 1rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    border-left: 2px solid #666;
    box-shadow: -5px 0px 15px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
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

/* Responsive styles */
@media (min-width: 768px) {
    .desktop-menu {
        display: flex;
        align-items: center;
    }
    
    .navbar-toggle {
        display: none;
    }
    
    .menu {
        display: none;
    }
}
</style>
