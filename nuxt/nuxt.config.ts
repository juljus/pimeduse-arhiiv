// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: "/pimeduse-arhiiv/", // as long as no custom domain is set
  },
  nitro: {
    prerender: {
      routes: ["/"], // Ensures content is prebuilt
    },
  },
  ssr: true,
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true }
})