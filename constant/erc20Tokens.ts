import { createTokenUtils } from '~/utils/create-token-utils'

export default {
  mainnet: createTokenUtils([
    {
      key: 'agld',
      type: 'token',
      symbol: 'AGLD',
      name: 'Adventure Gold',
      address: '0x32353A6C91143bfd6C7d363B546e62a9A2489A20',
      decimals: 18,
    },
  ]),
  rinkeby: createTokenUtils([
    {
      key: 'atime',
      type: 'token',
      symbol: 'ATIME',
      decimals: 18,
      name: 'Adventure Time (for Adventurers)',
      address: '0x7D99D9c39CacCFb9EA9598030b328630d8957b36',
    },
  ]),
  arbitrumRinkeby: createTokenUtils([
    {
      key: 'LordsToken',
      type: 'token',
      symbol: 'LORDS',
      decimals: 18,
      name: 'Realm Lords',
      address: '0x9c3Cb08A7C4924B0365D5FE427Df04adD3FA3024',
    },
  ]),
  localDevelopment: createTokenUtils([
    {
      key: 'LootRealms',
      type: 'token',
      symbol: 'LootRealms',
      name: 'Realms (for Adventurers)',
      address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    },
    {
      key: 'LordsToken',
      type: 'token',
      symbol: 'LORDS',
      name: 'LordsToken',
      address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    },
  ]),
}
