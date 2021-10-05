import { gql } from 'graphql-request'
import { WalletFragment } from './fragments/wallet'
import { RealmFragment } from './fragments/realmFragments'
import { BagFragment, defaultLoot } from './fragments/loot'
import { TreasureFragment } from './fragments/treasure'
import { ManaFragment } from './fragments/mana'
import { GAdventurerFragment } from './fragments/gadventurer'

const usersSRealms = gql`
  query usersSRealms($address: String!) {
    srealms(first: 100, where: { currentOwner: $address }) {
      id
    }
  }
`

const usersRealms = gql`
  query usersRealms($address: String!) {
    realms(first: 100, where: { currentOwner: $address }) {
      id
      tokenURI
      currentOwner {
        address
        joined
      }
    }
  }
`
const l1AdventurerQuery = gql`
  ${WalletFragment}
  ${RealmFragment}
  ${BagFragment}
  ${TreasureFragment}
  ${defaultLoot}
  ${ManaFragment}
  ${GAdventurerFragment}

  query adventurer($address: String!) {
    wallet(id: $address) {
      id
      realmsHeld
      realms(first: 30) {
        ...RealmData
      }
      bagsHeld
      bags(first: 30) {
        ...BagData
      }
      treasuresHeld
      treasures(first: 30) {
        ...TreasureData
      }
      mLoot(first: 30) {
        ...DefaultBagData
      }
      manasHeld
      manas(first: 30) {
        ...ManaData
      }
      gAdventurers(first: 30) {
        ...DefaultBagData
        ...GAdventurerData
      }
    }
  }
`
const l2AdventurerQuery = gql`
  ${RealmFragment}
  query adventurer($address: String!) {
    wallet(id: $address) {
      id
      realmsHeld
      realms(first: 30) {
        ...RealmData
      }
    }
  }
`

const mintedRealmsQuery = gql`
  query mintedRealmsQuery($lastID: String) {
    realms(
      first: 1000
      where: { id_gt: $lastID }
      orderBy: id
      orderDirection: asc
    ) {
      id
    }
  }
`
export {
  usersRealms,
  mintedRealmsQuery,
  usersSRealms,
  l1AdventurerQuery,
  l2AdventurerQuery,
}
