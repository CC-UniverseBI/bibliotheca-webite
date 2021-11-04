<template>
  <div>
    <h3 class="text-gray-400">
      <span v-if="ensName">{{ ensName }}</span>
      <span v-else>{{ shortenHash(address) }}</span>
    </h3>
    <h1 v-if="isAddressPage" class="mb-8">My Lord, your vast empire</h1>
    <h1 v-else class="mb-8">Adventurer's Empire</h1>
    <div class="flex">
      <nav class="space-x-4 mb-8 bg-gray-900 px-3 py-5 rounded-2xl">
        <NuxtLink
          v-for="(link, index) in displayedLinks"
          :key="index"
          class="
            text-xl
            rounded-xl
            px-6
            py-3
            text-gray-400
            hover:bg-black hover:text-red-600
            border-2 border-transparent
            uppercase
          "
          :to="'/adventurer/' + address + '/' + link.slug"
          >{{ link.title }}</NuxtLink
        >
      </nav>
    </div>

    <NuxtChild keep-alive />
  </div>
</template>
<script>
import {
  defineComponent,
  onMounted,
  ref,
  computed,
} from '@nuxtjs/composition-api'
import { useFormatting } from '~/composables/useFormatting'
import { useConnect } from '~/composables/web3/useConnect'
export default defineComponent({
  setup(props, context) {
    const { shortenHash, returnEns, ensName } = useFormatting()
    const { isAddressPage } = useConnect()
    const { address } = context.root.$route.params
    // const variables = ref({ slug: slug.toLowerCase() })

    const menuLinks = ref([
      {
        title: 'Empire',
        slug: 'empire',
      },
      {
        title: 'Iron Bank',
        slug: 'iron-bank',
      },
      {
        title: 'Assets',
        slug: '',
      },
      {
        title: 'Realms',
        slug: 'realms',
      },
      {
        title: 'Raid Results',
        slug: 'raid-results',
      },
    ])
    const displayedLinks = computed(() => {
      /* if (isAddressPage.value) {
        return menuLinks.value.concat({
          title: 'Realms available to Settle',
          slug: 'settling',
        })
      } else */ return menuLinks.value
    })

    if (isAddressPage) {
      menuLinks.value.push()
    }
    onMounted(async () => {
      await returnEns(address)
    })
    return {
      address,
      displayedLinks,
      ensName,
      shortenHash,
      isAddressPage,
    }
  },
})
</script>
