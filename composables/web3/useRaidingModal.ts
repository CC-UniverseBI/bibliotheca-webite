import { useModal } from '../useModal'
import RaidingModal from '~/components/modal/RaidingModal.vue'

export const useRaidingModal = () => {
  const { showComponent } = useModal()

  return {
    open: (raidedRealm) => showComponent(RaidingModal, { raidedRealm }),
  }
}
