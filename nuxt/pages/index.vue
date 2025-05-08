<template>
    <div class="page-container">
        <!-- Animation as title/header -->
        <div class="animation-header">
            <div v-if="animationLoading" class="loading">Loading Animation...</div>
            <div v-else-if="animationError" class="error">Error loading animation</div>
            <img 
                v-else
                :src="currentFrameSrc" 
                alt="Animation frame"
                class="animation-frame"
            />
        </div>
        
        <!-- Markdown content area -->
        <div class="content-container" :class="{ 'content-hidden': !animationComplete }">
            <div v-if="pending" class="loading"></div>
            <div v-else-if="error" class="error"></div>
            <template v-else-if="page">
                <div class="markdown-content">
                    <!-- Use v-html directly on the ContentRenderer component -->
                    <ContentRenderer 
                        v-if="!showLineByLine"
                        :value="page" 
                        class="content-fade-in" 
                        :class="{ 'visible': animationComplete }"
                    />
                    <template v-else>
                        <!-- Only use line-by-line approach if contentLines has items -->
                        <div 
                            v-for="(line, index) in contentLines" 
                            :key="index"
                            class="content-line"
                            :class="{ 'visible': visibleLines > index }"
                        >
                            <div v-html="line"></div>
                        </div>
                    </template>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

// Animation variables
const frames = ref([]);
const currentFrameIndex = ref(0);
const animationLoading = ref(true);
const animationError = ref(null);
// const animationInterval = ref(null); // Replaced by requestAnimationFrame
let animationFrameId = null; // For requestAnimationFrame
const preloadedFrames = ref(0);
const frameDuration = 62.5; // milliseconds between frames, adjust as needed
let lastFrameTime = 0;

// Text reveal variables
const animationComplete = ref(false);
const contentLines = ref([]);
const visibleLines = ref(0);
const lineRevealInterval = ref(null);
const lineRevealDelay = 100; // milliseconds between revealing lines
const showLineByLine = ref(false); // Flag to toggle between approaches

// Content variables using Nuxt Content
const { data: page, pending, error } = await useAsyncData('index-page', () => {
    return queryCollection('main_page').first();
});

// Process page content into lines (client-side only)
const processPageContent = () => {
    if (!page.value || !process.client) return false;
    
    try {
        // Use the HTML content from page
        if (page.value.body && page.value.body.html) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = page.value.body.html;
            
            // Extract paragraphs, headings, and other block elements
            const elements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, div');
            if (elements.length > 0) {
                contentLines.value = Array.from(elements).map(el => el.outerHTML);
                console.log(`Processed ${contentLines.value.length} content lines`);
                return true;
            } else {
                // If no elements were found, use the entire HTML content as a single line
                contentLines.value = [page.value.body.html];
                console.log("Using full HTML as a single line");
                return true;
            }
        }
    } catch (err) {
        console.error("Error processing content:", err);
        return false;
    }
    
    return false;
};

// Compute the current frame's source path
const currentFrameSrc = computed(() => {
    if (frames.value.length === 0 || currentFrameIndex.value >= frames.value.length) return '';
    return `/animation/${frames.value[currentFrameIndex.value]}`;
});

// Animation loop using requestAnimationFrame
function animationLoop(timestamp) {
    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }

    const elapsed = timestamp - lastFrameTime;

    if (elapsed >= frameDuration) {
        lastFrameTime = timestamp - (elapsed % frameDuration);
        
        if (currentFrameIndex.value < frames.value.length - 1) {
            currentFrameIndex.value++;
        } else {
            animationComplete.value = true;
            startTextReveal();
            // No need to clear/stop loop here if it's a one-time animation
            // If it were to loop, reset currentFrameIndex.value = 0;
            return; // Stop the loop once animation is complete
        }
    }

    if (!animationComplete.value) {
        animationFrameId = requestAnimationFrame(animationLoop);
    }
}

// Start the animation
function startAnimation() {
    // Ensure all frames are loaded before starting
    if (preloadedFrames.value < frames.value.length) {
        console.warn("Attempted to start animation before all frames were loaded.");
        return;
    }
    animationLoading.value = false;
    currentFrameIndex.value = 0;
    lastFrameTime = 0; // Reset lastFrameTime before starting
    animationFrameId = requestAnimationFrame(animationLoop);
}

// Reveal text line by line
function startTextReveal() {
    console.log('Starting text reveal');
    
    // First, try to process content lines if we want the line-by-line approach
    const success = processPageContent();
    showLineByLine.value = success && contentLines.value.length > 0;
    
    // If line-by-line approach is successful, use it
    if (showLineByLine.value) {
        visibleLines.value = 0;
        if (lineRevealInterval.value) clearInterval(lineRevealInterval.value);
        
        // Ensure animation complete is set to true
        animationComplete.value = true;
        
        setTimeout(() => {
            console.log(`Beginning reveal of ${contentLines.value.length} lines`);
            
            lineRevealInterval.value = setInterval(() => {
                visibleLines.value++;
                
                if (visibleLines.value >= contentLines.value.length) {
                    clearInterval(lineRevealInterval.value);
                    lineRevealInterval.value = null;
                }
            }, lineRevealDelay);
        }, 500);
    } else {
        // Otherwise, just make the whole content visible at once
        console.log("Using simple fade-in for content");
        animationComplete.value = true;
    }
}

// Fetch animation frames and preload them
onMounted(async () => {
    try {
        const response = await fetch('/api/animation');
        const data = await response.json();
        
        if (data.error) {
            animationError.value = data.error;
            animationLoading.value = false;
            return;
        }
        
        if (data.files && data.files.length > 0) {
            frames.value = data.files.sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || 0);
                const numB = parseInt(b.match(/\d+/)?.[0] || 0);
                return numA - numB;
            });

            if (frames.value.length === 0) {
                animationError.value = "No valid animation frames found after sorting";
                animationLoading.value = false;
                return;
            }

            // Preload all frames
            let loadedCount = 0;
            frames.value.forEach(frameFile => {
                const img = new Image();
                img.src = `/animation/${frameFile}`;
                img.onload = () => {
                    loadedCount++;
                    preloadedFrames.value = loadedCount;
                    if (loadedCount === frames.value.length) {
                        // All frames are preloaded, start the animation
                        startAnimation();
                    }
                };
                img.onerror = () => {
                    loadedCount++; // Count errors as "loaded" to not stall indefinitely
                    preloadedFrames.value = loadedCount;
                    console.error(`Failed to load animation frame: ${frameFile}`);
                    // Potentially set animationError here or handle partial animation
                    if (loadedCount === frames.value.length) {
                         // If all (including errored ones) are processed
                        if (preloadedFrames.value > 0 && !animationError.value) startAnimation();
                        else if (!animationError.value) {
                            animationError.value = "Failed to load some animation frames";
                            animationLoading.value = false;
                        }
                    }
                };
            });
        } else {
            animationError.value = "No animation frames found";
            animationLoading.value = false;
        }
    } catch (error) {
        console.error("Error fetching or preloading animation:", error);
        animationError.value = "Error loading animation";
        animationLoading.value = false;
    }
});

// Clean up on component unmount
onUnmounted(() => {
    // if (animationInterval.value) {
    //     clearInterval(animationInterval.value);
    // }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (lineRevealInterval.value) {
        clearInterval(lineRevealInterval.value);
    }
});
</script>

<style scoped>
.animation-header {
    width: 100%;
    height: 20vh; /* Reduced from 30vh */
    min-height: 150px; /* Reduced from 200px */
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem; /* Reduced from 2rem */
    overflow: hidden;
}

.animation-frame {
    max-width: 100%;
    max-height: 20vh; /* Reduced from 30vh */
    object-fit: contain;
}

.content-container {
    width: 100%;
    max-width: 800px;
    padding: 0 1rem 3rem;
    opacity: 1;
    visibility: visible;
    transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
}

.content-hidden {
    opacity: 0;
    visibility: hidden;
}

.markdown-content {
    color: white;
    font-size: 1rem;
    line-height: 1.6;
}

.content-line {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    min-height: 1px;
}

.content-line.visible {
    opacity: 1;
    transform: translateY(0);
}

.content-fade-in {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 1s ease-in-out, transform 1s ease-in-out;
}

.content-fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Markdown styling */
.markdown-content h1, 
.markdown-content h2, 
.markdown-content h3 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
}

.markdown-content p {
    margin-bottom: 1rem;
}

.markdown-content a {
    color: #6af;
    text-decoration: underline;
}

.markdown-content ul, 
.markdown-content ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
}

.loading {
    /* display: none; */ /* Hide loading completely */
    color: white; /* Make loading text visible */
    font-style: italic;
}

.error {
    color: #ff5555;
    /* display: none; */ /* Hide error messages too */
}

/* Remove these CSS rules - no spinner */
/* 
.loading {
    background: url('/loading-spinner.gif') center center no-repeat;
    position: relative;
}

.loading::after {
    content: '';
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    animation: spin 1s linear infinite;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -15px;
    margin-left: -15px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
*/

/* Responsive adjustments */
@media (min-width: 768px) {
    .animation-header {
        height: 25vh; /* Reduced from 40vh */
    }
    
    .animation-frame {
        max-height: 25vh; /* Reduced from 40vh */
    }
    
    .content-container {
        padding: 0 2rem 3rem; /* Reduced bottom padding from 4rem to 3rem */
    }
}
</style>
