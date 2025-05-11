<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold mb-6">Pildid</h1>
        
        <!-- Images Grid -->
        <div class="image-grid" role="grid" aria-label="Image gallery">
            <div v-for="(image, index) in images" :key="index" 
                class="image-container cursor-pointer hover:opacity-80 transition-all duration-300"
                @click="openPreview(image)"
                role="gridcell"
                tabindex="0"
                @keydown.enter="openPreview(image)"
                :aria-label="`Image ${index + 1}: ${image.split('/').pop().replace(/\.[^/.]+$/, '')}`">
                <NuxtImg :src="image" :alt="`Pilt ${index + 1}`" class="w-full h-full object-cover rounded-md" provider="ipx" sizes="sm:100vw md:50vw lg:200px" />
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
                        
                        <!-- Actual image - low quality preview loads immediately, full image fades in -->
                        <NuxtImg 
                            :key="currentImage" 
                            :src="currentImage" 
                            class="modal-image" 
                            :alt="currentImageName || 'Preview'" 
                            @click.stop 
                            provider="ipx" 
                            sizes="sm:100vw md:80vw lg:95vw" 
                            :modifiers="{quality: 90}"
                            loading="eager"
                            :placeholder="[currentImage, { width: 40, quality: 10 }]"
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

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
            // Use the actual image dimensions for the placeholder
            imageAspectRatio.value = `${img.naturalWidth}/${img.naturalHeight}`;
        }
    }
}

// More reliable preload function using fetch API with cache: 'force-cache'
function preloadImage(src) {
  if (!src || typeof window === 'undefined') return;
  console.log(`[Preload] Attempting to preload: ${src}`);
  
  // First, preload the original image
  fetch(src, { method: 'GET', mode: 'no-cors', cache: 'force-cache' })
    .then(() => console.log(`[Preload] Successfully fetched original: ${src}`))
    .catch(err => console.log(`[Preload] Error preloading ${src}:`, err));
  
  // Create a temporary img element to see what URL Nuxt Image generates
  const tempImg = document.createElement('img');
  tempImg.style.position = 'absolute';
  tempImg.style.opacity = '0';
  tempImg.style.pointerEvents = 'none';
  tempImg.style.width = '1px';
  tempImg.style.height = '1px';
  document.body.appendChild(tempImg);
  
  // Use a data attribute to identify this as preloading
  tempImg.setAttribute('data-preload', 'true');
  
  // Set the src to trigger NuxtImg's URL transformation
  tempImg.src = src;
  
  // Wait a bit for the image to potentially get its src rewritten by Nuxt Image
  setTimeout(() => {
    // If the src has been transformed to include _ipx or similar
    if (tempImg.src !== src && (tempImg.src.includes('_ipx') || tempImg.src.includes('/_nuxt/image'))) {
      const transformedSrc = tempImg.src;
      console.log(`[Preload] Detected transformed URL: ${transformedSrc}`);
      
      // Now preload this transformed URL using fetch with force-cache
      fetch(transformedSrc, { method: 'GET', mode: 'no-cors', cache: 'force-cache' })
        .then(() => console.log(`[Preload] Successfully fetched transformed: ${transformedSrc}`))
        .catch(err => console.log(`[Preload] Error preloading ${transformedSrc}:`, err));
      
      // Also load into browser's image cache
      const imgCache = new Image();
      imgCache.src = transformedSrc;
    }
    
    // Clean up temporary element
    document.body.removeChild(tempImg);
  }, 200); // Reduced timeout for faster processing
}

// Open preview modal
function openPreview(image) {
    console.log('Opening preview for:', image);
    isImageLoading.value = true;
    currentImage.value = image;
    currentIndex.value = images.value.indexOf(image);
    
    const filename = image.split('/').pop();
    currentImageName.value = filename.replace(/\.[^/.]+$/, '');
    
    previewOpen.value = true;
    if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
    }

    // Reset aspect ratio to default when loading a new image
    imageAspectRatio.value = '16/9';

    // Immediately preload adjacent images (but not the current one since we're already showing it)
    if (typeof window !== 'undefined') {
        // This delay allows the current image to take priority in loading
        setTimeout(() => {
            preloadAdjacentImages(currentIndex.value);
        }, 300);
    }
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
        
        // Preload adjacent images (for future navigation)
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                preloadAdjacentImages(currentIndex.value);
            }, 300);
        }
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
        
        // Preload adjacent images (for future navigation)
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                preloadAdjacentImages(currentIndex.value);
            }, 300);
        }
    }
}

// Preload adjacent images (next 2, previous 2) - but not the current image
function preloadAdjacentImages(index) {
    // Define the indices to preload in priority order, excluding the current index
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
    
    // Queue preloads in priority order with small delays between them
    indicesToPreload.forEach((i, idx) => {
        setTimeout(() => preloadImage(images.value[i]), idx * 100); // Small staggered delay
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
