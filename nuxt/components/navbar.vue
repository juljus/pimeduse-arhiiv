<template>
    <div>
        <nav class="navbar">
            <!-- Desktop navbar - now with logo and text instead of logo and image -->
            <div class="desktop-menu">
                <a href="/" class="site-title">
                    <div class="logo-title-combo">
                        <img src="/main_logo_skeleton.png" alt="logo" class="site-logo" />
                        <span class="desktop-site-title">pimeduse arhiiv</span>
                    </div>
                </a>
                <div class="desktop-links">
                    <a href="/arhiiv/kirju">kirju</a>
                    <a href="/arhiiv/pimedusest">pimedusest</a>
                    <a href="/arhiiv/soovitusi">soovitusi</a>
                    <a href="/arhiiv/pildid">pildid</a>
                </div>
            </div>

            <!-- Mobile navbar with new hamburger icon -->
            <div class="navbar-toggle" @click="toggleMenu">
                <!-- Hamburger icon - three lines -->
                <div class="hamburger-icon" :class="{ 'is-active': menuOpen }">
                    <span class="line"></span>
                    <span class="line"></span>
                    <span class="line"></span>
                </div>
            </div>
            <!-- Menu slides underneath the fixed toggle button -->
            <div class="menu" :class="{ active: menuOpen }">
                <ul>
                    <li class="logo-item">
                        <a href="/" class="mobile-site-title">
                            pimeduse arhiiv
                        </a>
                    </li>
                    <li><a href="/arhiiv/kirju">kirju</a></li>
                    <li><a href="/arhiiv/pimedusest">pimedusest</a></li>
                    <li><a href="/arhiiv/soovitusi">soovitusi</a></li>
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
    background-color: #121212;
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
    padding: 0.8rem 2rem; /* Slightly reduced padding to accommodate logo height */
    background-color: #181818; /* Match mobile menu background */
    border-bottom: 1px solid #333; /* Match mobile menu border style */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5); /* Enhanced shadow to match mobile */
    z-index: 999;
    pointer-events: auto;
    align-items: center;
    justify-content: space-between; /* Better spacing between logo and links */
}

.site-title {
    font-size: 1.3rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
    /* Removed margin-right as we're using justify-content: space-between */
}

.desktop-links {
    display: flex;
    gap: 1.8rem; /* Increased spacing between links to match mobile menu */
    align-items: center; /* Ensure vertical centering of links */
}

.desktop-links a {
    color: #f5f5f5; /* Match mobile menu text color */
    text-decoration: none;
    text-transform: lowercase;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1); /* Match mobile menu transition */
    font-size: 1.05rem;
    letter-spacing: 1px; /* Match mobile menu letter spacing */
    padding-bottom: 0.3rem; /* Add padding for hover effect */
    border-bottom: 1px solid transparent; /* For hover effect */
    line-height: 1; /* Ensure consistent line height */
}

.desktop-links a:hover {
    color: white;
    border-bottom: 1px solid #666; /* Add subtle underline effect on hover */
}

/* Updated navbar toggle with hamburger icon */
.navbar-toggle {
    position: fixed;
    top: 1.2rem;
    right: 1.2rem;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 1100;
    background-color: transparent;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    box-sizing: border-box;
}

/* Hamburger icon styles */
.hamburger-icon {
    width: 28px;
    height: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.hamburger-icon .line {
    display: block;
    width: 100%;
    height: 2px;
    background-color: white;
    border-radius: 2px;
    /* Match the new easing */
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Animation for hamburger to X */
.hamburger-icon.is-active .line:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
}

.hamburger-icon.is-active .line:nth-child(2) {
    opacity: 0;
}

.hamburger-icon.is-active .line:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
}

/* Updated menu styles with smoother animation without bouncing */
.menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    height: 100%;
    background-color: #181818;
    padding: 5rem 1.5rem 2rem;
    transform: translateX(100%);
    /* Changed to a non-bouncy easing curve */
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    z-index: 1050;
    border-left: 1px solid #333;
    box-shadow: -5px 0px 25px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    /* Add overflow hidden to prevent content from being visible outside the menu */
    overflow: hidden;
}

/* Keep the small delay but remove transition-delay for closing */
.menu.active {
    transform: translateX(0);
    transition-delay: 0.05s;
}

/* When menu is closing, no delay */
.menu:not(.active) {
    transition-delay: 0s;
}

.menu ul {
    list-style: none;
    padding: 0;
    margin-top: 1.5rem; /* More space at the top of the list */
}

.menu li {
    margin: 1.8rem 0; /* More vertical spacing between items */
    border-bottom: 1px solid #333;
    padding-bottom: 0.8rem; /* More padding below each item */
}

.menu a {
    color: #f5f5f5;
    text-decoration: none;
    font-size: 1.2rem; /* Slightly larger text */
    letter-spacing: 1px;
    text-transform: lowercase;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1); /* Matching easing */
}

/* Logo styles for desktop and mobile */
.site-logo {
    height: 36px; /* Slightly reduced for better alignment */
    width: auto;
    display: block;
}

.site-title-img {
    height: 22px;
    width: auto;
    display: block;
    margin-top: 2px; /* Small alignment adjustment */
}

.menu-logo {
    height: 40px;
    width: auto;
    display: block;
}

.menu-title-img {
    height: 26px;
    width: auto;
    display: block;
    margin-top: 3px; /* Small alignment adjustment */
}

.logo-title-combo, .menu-logo-title-combo {
    display: flex;
    align-items: center; /* Ensure logo and text are vertically centered */
    gap: 15px; /* Increased spacing between logo and text */
}

.menu-logo-title-combo {
    margin-bottom: 0.5rem;
}

.logo-item {
    border-bottom: none !important; /* Remove border from logo item */
    margin-bottom: 2rem !important; /* Add more space after the logo */
}

/* Desktop site title text style */
.desktop-site-title {
    font-size: 1.5rem; /* Slightly increased from 1.4rem */
    font-weight: 300;
    letter-spacing: 0.5px;
    color: white;
    display: inline-block; /* Better for alignment */
    line-height: 1; /* Consistent line height */
    /* Removed position relative and top offset */
    margin-top: 3px; /* Adjusted for better vertical alignment */
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

/* Updated mobile site title (plain text) */
.mobile-site-title {
    font-size: 1.8rem !important;
    font-weight: 300 !important;
    letter-spacing: 0.5px !important;
    color: white !important;
    text-decoration: none !important;
    padding-bottom: 0 !important;
    text-transform: none !important;
}
</style>
