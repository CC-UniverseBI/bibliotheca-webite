import EventEmitter from 'events'
const type = 'website'
const url = 'https://bibliotheca.com'
const title = 'Bibliotheca (for Loot)'
const description = 'Graphing the Lootverse to allow adventurers to explore.'
const mainImage =
  'https://i.ibb.co/fMq60gr/Screenshot-from-2021-09-11-11-45-23.png'
EventEmitter.defaultMaxListeners = 20
const meta = [
  {
    hid: 'description',
    name: 'description',
    content: description,
  },
  {
    hid: 'og:type',
    property: 'og:type',
    content: type,
  },
  {
    hid: 'og:url',
    property: 'og:url',
    content: url,
  },
  {
    hid: 'og:title',
    property: 'og:title',
    content: title,
  },
  {
    hid: 'og:description',
    property: 'og:description',
    content: description,
  },
  {
    hid: 'og:image',
    property: 'og:image',
    content: mainImage,
  },
  {
    hid: 'twitter:url',
    name: 'twitter:url',
    content: url,
  },
  {
    hid: 'twitter:title',
    name: 'twitter:title',
    content: title,
  },
  {
    hid: 'twitter:description',
    name: 'twitter:description',
    content: description,
  },
  {
    hid: 'twitter:image',
    name: 'twitter:image',
    content: mainImage,
  },
]

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: true,

  // Target: https://go.nuxtjs.dev/config-target
  // target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Loot Bibliotheca (for Adventurers)',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      ...meta,
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Inconsolata:wght@300&display=swap',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],
  loadingIndicator: {
    name: 'pulse',
    color: '#FFF',
    background: 'black',
  },
  graphql: {
    clients: {
      mainnet: {
        endpoint: process.env.GRAPH_API
          ? process.env.GRAPH_API
          : 'http://localhost:1337/graphql',
        options: {},
      },
      rinkeby: {
        endpoint: process.env.GRAPH_API_RINKEBY
          ? process.env.GRAPH_API_RINKEBY
          : 'http://localhost:1337/graphql',
        options: {},
      },
      /* arbitrum: {
        endpoint: process.env.GRAPH_API_RINKEBY
          ? process.env.GRAPH_API_RINKEBY
          : 'http://localhost:1337/graphql',
        options: {},
      }, */
      arbitrumRinkeby: {
        endpoint: process.env.GRAPH_API_ARB_RINKEBY
          ? process.env.GRAPH_API_ARB_RINKEBY
          : 'http://localhost:1337/graphql',
        options: {},
      },
      L1Mainnetlient: {
        endpoint:
          'https://api.thegraph.com/subgraphs/name/fredlacs/arb-bridge-eth',
      },

      L2Mainnetlient: {
        endpoint:
          'https://api.thegraph.com/subgraphs/name/fredlacs/arb-builtins',
      },

      L1RinkebyClient: {
        endpoint:
          'https://api.thegraph.com/subgraphs/name/fredlacs/arb-bridge-eth-rinkeby',
      },

      L2RinkebyClient: {
        endpoint:
          'https://api.thegraph.com/subgraphs/name/fredlacs/arb-builtins-rinkeby',
      },
      L2GatewaysRinkebyClient: {
        endpoint:
          'https://api.thegraph.com/subgraphs/name/redbeardeth/arb-bridge-rinkeby',
      },
    },
    options: {},
    useFetchPolyfill: true,
    includeNodeModules: true,
  },
  plugins: [
    '~/plugins/vue-formulate',
    '~/plugins/analytics.js',
    '~/plugins/v-click-outside.js',
    '~/plugins/vue-awesome-countdown.js',
    '~/plugins/v-tooltip.js',
  ],
  components: [
    '~/components/web3',
    '~/components/modal',
    '~/components/navigation',
    '~/components',
    '~/components/cards',
    '~/components/atoms',
    '~/components/market',
    '~/components/atoms/market',
  ],
  buildModules: [
    '@nuxtjs/eslint-module',
    'nuxt-graphql-request',
    '@nuxtjs/composition-api/module',
    '@nuxt/typescript-build',
    '@nuxtjs/tailwindcss',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxtjs/axios', '@nuxtjs/svg'],
  generate: {
    fallback: true,
  },
  serverMiddleware: [
    { path: '/api', handler: '~/serverMiddleware/server.js' },
    '~/serverMiddleware/redirects.ts',
  ],
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config) {
      config.node = {
        fs: 'empty',
      }
    },

    /* if (config.resolve.extensions) {
        config.resolve.extensions.push('.mjs')
      } else {
        config.resolve.extensions = ['.mjs']
      }
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      })
      // https://github.com/nuxt/nuxt.js/issues/1142
      config.resolve.alias.vue = 'vue/dist/vue.common'
    }, */
  },
  router: {
    linkExactActiveClass: 'bg-black text-red-400',
  },
  env: {
    INFURA_ID: process.env.INFURA_ID,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    ETHER_SCAN: process.env.ETHER_SCAN,
    ACTIVE_NETWORKS: process.env.ACTIVE_NETWORKS,
    OPENSEA: process.env.OPENSEA,
  },
}
