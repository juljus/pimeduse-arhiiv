import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
    collections: {
        arhiiv: defineCollection({
            // Load every .md file inside the `arhiiv` directory
            source: 'arhiiv/*.md',

            // Specify the type of content in this collection
            type: 'page',
        }),

        main_page: defineCollection({
            // Load every .md file inside the `main` directory
            source: 'main/*.md',

            // Specify the type of content in this collection
            type: 'page',
        })
    }
})
