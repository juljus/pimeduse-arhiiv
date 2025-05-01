// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: "/pimeduse-arhiiv/", // 👈 Set this to match your GitHub repo name
  },
  ssr: true,
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true }
})