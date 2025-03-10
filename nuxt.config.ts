import { createRequire } from 'module'
import path from 'path'

const { resolve } = createRequire(import.meta.url)

const prismaClient = `prisma${path.sep}client`

const prismaClientIndexBrowser = resolve('@prisma/client/index-browser').replace(`@${prismaClient}`, `.${prismaClient}`)


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@prisma/nuxt",
    "@nuxt/icon",
  ],
  eslint: {},
  css: ["@/assets/css/tailwind.css"],
  vite: {
    resolve: { alias: { '.prisma/client/index-browser': path.relative(__dirname, prismaClientIndexBrowser) } },
    optimizeDeps: {
      include: ['vue']
    },
    build: {
      commonjsOptions: {
        esmExternals: true
      }
    }
  },
});
