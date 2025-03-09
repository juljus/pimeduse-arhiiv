<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold mb-6">Pildid</h1>
        
        <!-- Images Grid -->
        <div class="image-grid">
            <div v-for="(image, index) in images" :key="index" 
                class="image-container cursor-pointer hover:opacity-80 transition-all duration-300"
                @click="openPreview(image)">
                <img :src="image" :alt="`Pilt ${index + 1}`" class="w-full h-full object-cover rounded-md">
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
                <img :src="currentImage" class="modal-image" alt="Preview" @click.stop>
                
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

// Open preview modal
function openPreview(image) {
    console.log('Opening preview for:', image);
    currentImage.value = image;
    currentIndex.value = images.value.indexOf(image);
    previewOpen.value = true;
    document.body.style.overflow = 'hidden';
}

// Close preview modal
function closePreview() {
    console.log('Closing preview');
    previewOpen.value = false;
    document.body.style.overflow = '';
}

// Navigate to the previous image
function navigateToPrevious() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        currentImage.value = images.value[currentIndex.value];
    }
}

// Navigate to the next image
function navigateToNext() {
    if (currentIndex.value < images.value.length - 1) {
        currentIndex.value++;
        currentImage.value = images.value[currentIndex.value];
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

// Load images on component mount
onMounted(() => {
    // In a real application, you might want to fetch this list from the server
    // For now, we'll simulate accessing images from the public folder
    const imageFiles = [
        '/pildid/image1.png',
        '/pildid/image2.png',
        '/pildid/image3.png',
        '/pildid/image4.png',
    ];
    
    console.log('Loading images:', imageFiles);
    images.value = imageFiles;

    window.addEventListener('keydown', handleKeyDown);
});

// Clean up event listener when component unmounts
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
    document.body.style.overflow = ''; // Reset body overflow
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
    max-height: 95vh;
    min-width: 50vw; /* Ensure image has a minimum size */
    object-fit: contain;
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
    /* Add transition for smoother image changes */
    transition: opacity 0.3s ease;
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
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
    
    .image-container {
        height: 180px;
    }
}

@media (min-width: 768px) {
    .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    
    .image-container {
        height: 200px;
    }
}
</style>