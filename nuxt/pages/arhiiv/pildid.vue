<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold mb-6">pildid</h1>
        
        <!-- Images Grid -->
        <div class="image-grid" role="grid" aria-label="Image gallery">
            <div v-for="(image, index) in images" :key="index" 
                class="image-container cursor-pointer hover:opacity-80 transition-all duration-300"
                @click="openPreview(image)"
                role="gridcell"
                tabindex="0"
                @keydown.enter="openPreview(image)"
                :aria-label="`Image ${index + 1}: ${image.split('/').pop().replace(/\.[^/.]+$/, '')}`">
                <img :src="image" :alt="`Pilt ${index + 1}`" class="w-full h-full object-cover rounded-md" loading="lazy" />
            </div>
        </div>
        
        <!-- Image Preview Modal -->
        <div v-show="previewOpen" 
            class="modal-overlay"
            @click="closePreview"
            role="dialog"
            aria-modal="true"
            aria-label="Image preview">
            <div class="modal-content" @click.stop>
                <button @click="closePreview" class="modal-close" aria-label="Close preview">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <!-- Previous image button -->
                <button v-if="hasPreviousImage" 
                    @click.stop="navigateToPrevious" 
                    class="nav-arrow nav-prev"
                    aria-label="Previous image">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <!-- Image -->
                <div class="modal-image-container">
                    <!-- Placeholder frame - always visible -->
                    <div class="image-placeholder" :style="{ aspectRatio: imageAspectRatio }">
                        <!-- Loading indicator -->
                        <div v-if="isImageLoading" class="loading-indicator">
                            <div class="loader"></div>
                        </div>
                        
                        <!-- Actual image -->
                        <img 
                            :key="currentImage" 
                            :src="currentImage" 
                            class="modal-image" 
                            :alt="currentImageName || 'Preview'"
                            @click.stop
                            fetchpriority="high"
                            loading="eager"
                            @load="onImageLoaded"
                            :style="{ opacity: isImageLoading ? '0.3' : '1' }"
                        />
                    </div>
                    
                    <!-- Image name display - always below the image/placeholder -->
                    <div class="image-name">{{ currentImageName }}</div>
                </div>
                
                <!-- Next image button -->
                <button v-if="hasNextImage" 
                    @click.stop="navigateToNext" 
                    class="nav-arrow nav-next"
                    aria-label="Next image">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';

// State for images and preview
const images = ref([]);
const previewOpen = ref(false);
const currentImage = ref('');
const currentIndex = ref(0);
const currentImageName = ref('');
const isImageLoading = ref(false);
const imageAspectRatio = ref('16/9'); // Default aspect ratio for the placeholder

// Track when main image finishes loading
function onImageLoaded(event) {
    isImageLoading.value = false;
    
    // Update the aspect ratio for the placeholder based on the loaded image
    if (event && event.target) {
        const img = event.target;
        if (img.naturalWidth && img.naturalHeight) {
            imageAspectRatio.value = `${img.naturalWidth}/${img.naturalHeight}`;
        }
    }
    
    // ONLY start preloading after the current image has loaded
    // This ensures proper priority
    if (typeof window !== 'undefined') {
        setTimeout(() => {
            preloadAdjacentImages(currentIndex.value);
        }, 100);
    }
}

// Entirely separated preload function that runs in the background
// and doesn't interfere with the current image display
function preloadImage(src) {
  if (!src || typeof window === 'undefined' || src === currentImage.value) return;
  
  console.log(`[Preload] Attempting to preload: ${src}`);
  
  // Create a background preloader that doesn't affect the current image
  const preloader = document.createElement('div');
  preloader.style.width = '0';
  preloader.style.height = '0';
  preloader.style.overflow = 'hidden';
  preloader.style.position = 'absolute';
  preloader.style.top = '-9999px';
  preloader.style.left = '-9999px';
  document.body.appendChild(preloader);
  
  // Create an image to preload
  const img = new Image();
  img.src = src;
  preloader.appendChild(img);
  
  // Clean up after the image loads or errors
  const cleanup = () => {
    if (document.body.contains(preloader)) {
      document.body.removeChild(preloader);
    }
  };
  
  img.onload = () => {
    console.log(`[Preload] Successfully preloaded: ${src}`);
    cleanup();
  };
  
  img.onerror = () => {
    console.log(`[Preload] Failed to preload: ${src}`);
    cleanup();
  };
  
  // Safety cleanup in case onload/onerror don't fire
  setTimeout(cleanup, 5000);
}

// Open preview modal
function openPreview(image) {
    console.log('Opening preview for:', image);
    
    // Set loading state and update image
    isImageLoading.value = true;
    currentImage.value = image;
    currentIndex.value = images.value.indexOf(image);
    
    // Update image name
    const filename = image.split('/').pop();
    currentImageName.value = filename.replace(/\.[^/.]+$/, '');
    
    // Show modal
    previewOpen.value = true;
    if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
    }

    // Reset aspect ratio to default when loading a new image
    imageAspectRatio.value = '16/9';
    
    // NOTE: preloadAdjacentImages is now called from onImageLoaded
    // to ensure the current image loads first
}

// Close preview modal
function closePreview() {
    previewOpen.value = false;
    if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
    }
}

// Navigate to the previous image
function navigateToPrevious() {
    if (currentIndex.value > 0) {
        isImageLoading.value = true; // Show loading state
        currentIndex.value--;
        currentImage.value = images.value[currentIndex.value];
        currentImageName.value = currentImage.value.split('/').pop().replace(/\.[^/.]+$/, '');
        
        // Reset aspect ratio to default when loading a new image
        imageAspectRatio.value = '16/9';
        
        // NOTE: preloadAdjacentImages is now called from onImageLoaded
    }
}

// Navigate to the next image
function navigateToNext() {
    if (currentIndex.value < images.value.length - 1) {
        isImageLoading.value = true; // Show loading state
        currentIndex.value++;
        currentImage.value = images.value[currentIndex.value];
        currentImageName.value = currentImage.value.split('/').pop().replace(/\.[^/.]+$/, '');
        
        // Reset aspect ratio to default when loading a new image
        imageAspectRatio.value = '16/9';
        
        // NOTE: preloadAdjacentImages is now called from onImageLoaded
    }
}

// Preload adjacent images
function preloadAdjacentImages(index) {
    // Skip preloading if we're currently viewing an image that needs priority
    if (isImageLoading.value) return;
    
    // Define the indices to preload in priority order
    const indicesToPreload = [];
    
    // Next image has highest priority
    if (index < images.value.length - 1) {
        indicesToPreload.push(index + 1);
    }
    
    // Previous image has second priority
    if (index > 0) {
        indicesToPreload.push(index - 1);
    }
    
    // Then next+1
    if (index < images.value.length - 2) {
        indicesToPreload.push(index + 2);
    }
    
    // Then prev-1
    if (index > 1) {
        indicesToPreload.push(index - 2);
    }
    
    // Queue preloads with small delays to avoid network congestion
    indicesToPreload.forEach((i, idx) => {
        setTimeout(() => preloadImage(images.value[i]), idx * 150);
    });
}

// Check if there's a previous image
const hasPreviousImage = computed(() => {
    return currentIndex.value > 0;
});

// Check if there's a next image
const hasNextImage = computed(() => {
    return currentIndex.value < images.value.length - 1;
});

// Handle keyboard events for navigation and closing
function handleKeyDown(e) {
    if (!previewOpen.value) return;
    
    switch (e.key) {
        case 'Escape':
            closePreview();
            break;
        case 'ArrowLeft':
            if (hasPreviousImage.value) navigateToPrevious();
            break;
        case 'ArrowRight':
            if (hasNextImage.value) navigateToNext();
            break;
    }
}

// Fetch images from the server
const errorMessage = ref(null);
onMounted(() => {
    fetch('/api/images')
        .then((response) => response.json())
        .then((data) => {
            if (data.files) {
                images.value = data.files
                    .filter(file => {
                        const isSystemFile = file === '.DS_Store';
                        const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(file);
                        return !isSystemFile && hasImageExtension;
                    })
                    .map(file => `/pildid/${file}`);
                
                // Preload first few images in the background for better initial experience
                if (typeof window !== 'undefined' && images.value.length > 0) {
                    // Stagger preloads to avoid network congestion
                    for (let i = 0; i < Math.min(5, images.value.length); i++) {
                        setTimeout(() => preloadImage(images.value[i]), 1000 + (i * 300));
                    }
                }
            } else {
                errorMessage.value = 'No files found';
            }
        })
        .catch(() => {
            errorMessage.value = 'Error fetching files';
        });
    
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeyDown);
    }

    // Set up preloading after a short delay
    if (typeof window !== 'undefined') {
        setTimeout(() => {
            // Preload the first few images for quicker initial modal experience
            if (images.value.length > 0) {
                for (let i = 0; i < Math.min(3, images.value.length); i++) {
                    setTimeout(() => preloadImage(images.value[i]), i * 300);
                }
            }
        }, 1000);
    }
});

// Clean up event listener when component unmounts
onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown);
    }
    if (typeof document !== 'undefined') {
        document.body.style.overflow = ''; // Reset body overflow
    }

    // Clean up probe element
    if (probeElement && typeof document !== 'undefined') {
        document.body.removeChild(probeElement);
        probeElement = null;
    }
});
</script>

<style scoped>
/* Image grid styles */
.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
    justify-content: center;
}

/* Fixed size image containers */
.image-container {
    width: 100%;
    height: 160px;
    overflow: hidden;
    position: relative;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-container:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Modal styles with enhanced image size */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    /* Improve touch behavior on mobile */
    touch-action: manipulation;
    cursor: pointer; /* Add cursor pointer to indicate clickable */
}

.modal-content {
    position: relative;
    width: 95vw;  /* Use viewport width units */
    height: 95vh; /* Use viewport height units */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default; /* Reset cursor for content area */
}

.modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    color: white;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10000;
    padding: 8px;
    /* Larger touch target for mobile */
    min-width: 50px;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close svg {
    fill: none;
    stroke: white;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    width: 24px;
    height: 24px;
}

/* Direct styling of the image for maximum size */
.modal-image {
    width: auto;
    height: auto;
    max-width: 95vw;
    max-height: 85vh; /* Reduced slightly to make room for the name */
    min-width: 50vw; /* Ensure image has a minimum size */
    object-fit: contain;
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
    /* Add transition for smoother image changes */
    transition: opacity 0.3s ease;
    position: relative;
    z-index: 2;
}

/* Image name display */
.modal-image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* Added to center vertically */
    width: 100%;
    height: 100%;
    max-width: 95vw;
    max-height: 90vh;
}

/* Image placeholder frame */
.image-placeholder {
    position: relative;
    width: 100%;
    max-width: 95vw;
    max-height: 85vh;
    background-color: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: opacity 0.3s ease;
}

.image-name {
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 8px 16px;
    margin-top: 10px;
    border-radius: 4px;
    font-size: 16px;
    max-width: 90vw;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Navigation arrows */
.nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.3);
    color: white;
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    z-index: 10000;
}

.nav-arrow svg {
    fill: none;
    stroke: white;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    width: 24px;
    height: 24px;
}

.nav-arrow:hover {
    background-color: rgba(0, 0, 0, 0.6);
    transform: translateY(-50%) scale(1.1);
}

.nav-prev {
    left: 20px;
}

.nav-next {
    right: 20px;
}

/* Make sure the modal-close button is very visible on mobile */
@media (max-width: 768px) {
    .modal-close {
        top: 16px;
        right: 16px;
        background: rgba(0, 0, 0, 0.7);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.2); /* Add glow to make it stand out */
    }
    
    /* Make navigation buttons more visible on mobile */
    .nav-arrow {
        background-color: rgba(0, 0, 0, 0.6);
        width: 50px;
        height: 50px;
    }
    
    /* Ensure SVG icons are visible on mobile */
    .nav-arrow svg,
    .modal-close svg {
        width: 28px;
        height: 28px;
        stroke-width: 2.5;
    }
}

/* Responsive adjustments */
@media (min-width: 640px) {
    .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    
    .image-container {
        height: 200px;
    }
}

@media (min-width: 768px) {
    .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
    
    .image-container {
        height: 220px;
    }
}

/* Desktop adjustments */
@media (min-width: 1024px) {
    .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
    }
    
    .image-container {
        height: 240px;
    }
}

/* Large desktop adjustments */
@media (min-width: 1280px) {
    .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
    }
    
    .image-container {
        height: 280px;
    }
}

/* Loading indicator styles */
.loading-indicator {
    position: absolute;
    z-index: 10;
}

.loader {
    width: 48px;
    height: 48px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s infinite linear;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
