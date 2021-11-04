<template>
  <div
    class="
      border-r border-gray-700
      p-4
      bg-gray-1000
      transform
      duration-300
      ease-in-out
      transition-all
      left-0
      top-0
      h-screen
      flex flex-col
      overflow-y-scroll
      z-30
    "
    :class="filtersOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'"
  >
    <div class="px-4 flex items-center justify-between">
      <h3 class="text-gray-200">Filters</h3>
      <button
        type="button"
        class="
          -mr-2
          w-10
          h-10
          p-2
          rounded-md
          flex
          items-center
          justify-center
          text-gray-400
        "
        @click="$emit('toggleFilter')"
      >
        <Close class="w-6 h-6" />
      </button>
    </div>

    <div class="mt-4 border-t border-gray-200">
      <div
        v-for="section in filters"
        :key="section.id"
        class="border-t border-gray-200 px-4 py-6"
      >
        <h4 class="-mx-2 -my-3 flow-root">
          <!-- Expand/collapse section button -->
          <button
            type="button"
            class="
              px-2
              py-3
              w-full
              flex
              items-center
              justify-between
              text-gray-400
              hover:text-gray-500
            "
            aria-controls="filter-section-mobile-0"
            aria-expanded="false"
            @click="toggleSection(section)"
          >
            <span class="text-gray-300"> {{ section.name }} </span>
            <span class="ml-6 flex items-center">
              <svg
                v-if="!section.open"
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <!--
                    Collapse icon, show/hide based on section open state.

                    Heroicon name: solid/minus-sm
                  -->
              <svg
                v-else
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </button>
        </h4>
        <!-- Filter section, show/hide based on section state. -->
        <div v-if="section.open" id="filter-section-mobile-0" class="pt-6">
          <div class="space-y-2">
            <div
              v-for="option in section.options"
              :key="option.id"
              class="flex items-center"
            >
              <input
                :id="'filter-' + option.id"
                v-model="checked[type][section.id]"
                :value="parseInt(option.id)"
                :checked="option.checked"
                type="checkbox"
                class="
                  h-4
                  w-4
                  border-gray-300
                  rounded
                  text-indigo-600
                  focus:ring-indigo-500
                "
              />
              <label
                :for="'filter-' + option.id"
                class="ml-3 min-w-0 flex-1 text-gray-500"
              >
                {{ option.name }}
                <span v-if="option.stakedRealms"
                  >({{ option.stakedRealms }})</span
                >
              </label>
            </div>
            <BButton type="primary" @click="updateResources()"
              >Update Resources</BButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { onMounted, ref } from '@vue/composition-api'
import BButton from '../atoms/BButton.vue'
import Close from '~/assets/img/x-square.svg?inline'
// import { resources } from '@/composables/utils/resourceColours'
import { useResources } from '~/composables/resources/useResources'
import { gaOrders } from '~/composables/ordersData'

// import Helm from '~/assets/img/helm.svg?inline'
export default {
  name: 'Filters',
  components: {
    Close,
    BButton,
  },
  props: {
    filtersOpen: {
      default: false,
      type: Boolean,
    },
    type: {
      type: String,
      default: 'all',
    },
  },
  setup(props, context) {
    const { getResourceList, resourceList, resourceListOrdered } =
      useResources()
    const filters = ref([
      {
        id: 'resources',
        name: 'Resources',
        open: false,
        options: [],
      },
      {
        id: 'orders',
        name: 'Orders',
        open: false,
        options: gaOrders,
      },
      {
        id: 'defence',
        name: 'Defence',
        open: false,

        options: [
          { value: 'new-arrivals', label: 'New Arrivals', checked: false },
          { value: 'sale', label: 'Sale', checked: false },
          { value: 'travel', label: 'Travel', checked: true },
          { value: 'organization', label: 'Organization', checked: false },
          { value: 'accessories', label: 'Accessories', checked: false },
        ],
      },
    ])
    const openFilter = ref(null)

    const checked = ref({
      user: { resources: [], orders: [] },
      all: { resources: [], orders: [] },
    })

    const updateResources = () => {
      context.emit('searchFilter', checked.value[props.type])
    }
    const toggleSection = (section) => {
      section.open = !section.open
    }
    const adventureLinks = [
      {
        page: '/adventurer',
        title: 'Search All',
      },
    ]

    onMounted(async () => {
      await getResourceList()
      filters.value[0].options = resourceListOrdered.value.map((obj) => {
        obj.checked = false
        return obj
      })
    })

    return {
      resourceList,
      filters,
      resourceListOrdered,
      toggleSection,
      updateResources,
      openFilter,
      adventureLinks,
      checked,
    }
  },
}
</script>
