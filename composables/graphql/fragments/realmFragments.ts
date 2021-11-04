import { gql } from 'graphql-request'

export const RealmFragment = gql`
  fragment RealmData on Realm {
    id
    tokenURI
  }
`
export const SRealmFragment = gql`
  fragment SRealmData on SRealm {
    id
    ageSettled
    ageClaimed
    name
    resources {
      id
      level
      resourceUpgrades {
        id
      }
    }
    traits {
      name
      value
      buildings {
        name
        value
        buildingUpgrades {
          id
          address {
            id
          }
        }
      }
    }
    wonder
    order
    currentOwner {
      address
    }
  }
`
