import { createTokenUtils } from '~/utils/create-token-utils'

export default {
  arbitrumRinkeby: createTokenUtils([
    {
      key: 'realm-resources',
      type: 'erc1155',
      symbol: 'resourceTokens',
      name: 'Realms Resource Tokens',
      address: '0x1BeB505670cF846af44Fae915e8b218eDff2E16D',
    },
  ]),
  localDevelopment: createTokenUtils([
    {
      key: 'resourceTokens',
      type: 'erc1155',
      symbol: 'resourceTokens',
      name: 'Realms Resource Tokens',
      address: '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
    },
  ]),
}
