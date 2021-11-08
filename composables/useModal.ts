import { computed, ref } from '@nuxtjs/composition-api'
import NetworksMismatchDialog from '~/components/modal/NetworksMismatchDialog.vue'
import AssetBridgeModal from '~/components/modal/AssetBridgeModal.vue'

const modal = ref(null)
const props = ref({})

export function useModal() {
  function showNetworksMismatchDialog() {
    console.log('showing')
    modal.value = NetworksMismatchDialog
  }

  function showAssetBox() {
    modal.value = AssetBridgeModal
  }

  function close() {
    // @ts-ignore issue
    if (props.value?.persistent) return
    modal.value = null
    props.value = null
  }

  function closePersistent() {
    modal.value = null
    props.value = null
  }

  const isShown = computed(() => Boolean(modal.value))

  function showComponent(component, componentProps = {}) {
    modal.value = component
    props.value = componentProps
  }

  return {
    showNetworksMismatchDialog,
    close,
    closePersistent,
    isShown,
    modal: computed(() => modal.value),
    props: computed(() => props.value),
    showComponent,
    showAssetBox,
  }
}
