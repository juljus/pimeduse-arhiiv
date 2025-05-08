<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold mb-6">Pildid</h1>
        
        <!-- Images Grid -->
        <div class="image-grid">
            <div v-for="(image, index) in images" :key="index" 
                class="image-container cursor-pointer hover:opacity-80 transition-all duration-300"
                @click="openPreview(image)">
                <NuxtImg :src="image" :alt="`Pilt ${index + 1}`" class="w-full h-full object-cover rounded-md" provider="ipx" sizes="sm:100vw md:50vw lg:200px" />
            </div>
        </div>
        
        <!-- Image Preview Modal -->
        <div v-show="previewOpen" 
            class="modal-overlay"
            @click="closePreview">
            <div class="modal-content" @click.stop>
                <button @click="closePreview" class="modal-close">
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
                    <NuxtImg 
                        :key="currentImage" 
                        :src="currentImage" 
                        :placeholder="[currentImage, { width: 160, fit: 'cover', quality: 15 }]"
                        class="modal-image" 
                        alt="Preview" 
                        @click.stop 
                        provider="ipx" 
                        sizes="sm:100vw md:80vw lg:95vw" 
                    />
                    <!-- Image name display -->
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

// Preload an image
function preloadImage(src) {
  if (!src || typeof window === 'undefined') return; // Ensure src exists and window is defined
  const img = new Image();
  img.src = src;
}

// Open preview modal
function openPreview(image) {
    console.log('Opening preview for:', image);
    currentImage.value = image;
    currentIndex.value = images.value.indexOf(image);
    
    const filename = image.split('/').pop();
    currentImageName.value = filename.replace(/\.[^/.]+$/, '');
    
    previewOpen.value = true;
    if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
    }

    // Preload next/previous images
    preloadAdjacentImages(currentIndex.value);
}

// Close preview modal
function closePreview() {
    console.log('Closing preview');
    previewOpen.value = false;
    if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
    }
}

// Navigate to the previous image
function navigateToPrevious() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        currentImage.value = images.value[currentIndex.value];
        currentImageName.value = currentImage.value.split('/').pop().replace(/\.[^/.]+$/, '');
        preloadAdjacentImages(currentIndex.value);
    }
}

// Navigate to the next image
function navigateToNext() {
    if (currentIndex.value < images.value.length - 1) {
        currentIndex.value++;
        currentImage.value = images.value[currentIndex.value];
        currentImageName.value = currentImage.value.split('/').pop().replace(/\.[^/.]+$/, '');
        preloadAdjacentImages(currentIndex.value);
    }
}

// Preload adjacent images (next 2, previous 2)
function preloadAdjacentImages(index) {
    // Preload next image
    if (index < images.value.length - 1) {
        preloadImage(images.value[index + 1]);
    }
    // Preload next+1 image
    if (index < images.value.length - 2) {
        preloadImage(images.value[index + 2]);
    }
    // Preload previous image
    if (index > 0) {
        preloadImage(images.value[index - 1]);
    }
    // Preload previous-1 image
    if (index > 1) {
        preloadImage(images.value[index - 2]);
    }
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
                // Filter out system files like .DS_Store and add the directory path
                images.value = data.files
                    .filter(file => {
                        // Filter out .DS_Store and other non-image files
                        const isSystemFile = file === '.DS_Store';
                        const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(file);
                        return !isSystemFile && hasImageExtension;
                    })
                    .map(file => `/pildid/${file}`);
                console.log('images: ', images.value);
                // Optional: Preload first few images for the modal if desired
                // if (images.value.length > 0) preloadImage(images.value[0]);
                // if (images.value.length > 1) preloadImage(images.value[1]);
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
});

// Clean up event listener when component unmounts
onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown);
    }
    if (typeof document !== 'undefined') {
        document.body.style.overflow = ''; // Reset body overflow
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
}

/* Image name display */
.modal-image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
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
</style>
