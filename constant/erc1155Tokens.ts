import { createTokenUtils } from '~/utils/create-token-utils'

export default {
  arbitrumRinkeby: createTokenUtils([
    {
      key: 'resourceTokens',
      type: 'erc1155',
      symbol: 'resourceTokens',
      name: 'Realms Resource Tokens',
      address: '0x1BeB505670cF846af44Fae915e8b218eDff2E16D',
    },
    {
      key: 'resourceExchange',
      type: 'erc1155',
      symbol: 'resourceExchange',
      name: 'Resource Token Exchange',
      address: '0xB0176CD9225bE3977e28092585aE74A142c30c3E',
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
    {
      key: 'resourceExchange',
      type: 'exchange',
      symbol: 'resourceExchange',
      name: 'Resource Token Exchange',
      address: '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
    },
  ]),
}
