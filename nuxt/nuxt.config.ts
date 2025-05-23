// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', '@nuxt/image'],
  compatibilityDate: '2024-11-01',
  
  devtools: { enabled: true },
  
  // Add site metadata with logo
  app: {
    head: {
      title: 'pimeduse arhiiv',
      link: [
        { rel: 'icon', type: 'image/png', href: '/main_logo.png' }
      ],
      meta: [
        { name: 'description', content: 'pimeduse arhiiv - the archive of darkness' }
      ]
    }
  }
})