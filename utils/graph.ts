// import {
//   ApolloClient,
//   InMemoryCache,
//   ApolloProvider,
//   gql,
// } from '@apollo/client'
// import { BigNumber } from '@ethersproject/bignumber'
// import { L2ToL1EventResult } from 'arb-ts'
// import axios from 'axios'
// import { AssetType } from '../hooks/arbTokenBridge.types'

// const apolloL1Mainnetlient = new ApolloClient({
//   uri: 'https://api.thegraph.com/subgraphs/name/fredlacs/arb-bridge-eth',
//   cache: new InMemoryCache(),
// })

// const apolloL2Mainnetlient = new ApolloClient({
//   uri: 'https://api.thegraph.com/subgraphs/name/fredlacs/arb-builtins',
//   cache: new InMemoryCache(),
// })

// const apolloL1RinkebyClient = new ApolloClient({
//   uri: 'https://api.thegraph.com/subgraphs/name/fredlacs/arb-bridge-eth-rinkeby',
//   cache: new InMemoryCache(),
// })

// const apolloL2RinkebyClient = new ApolloClient({
//   uri: 'https://api.thegraph.com/subgraphs/name/fredlacs/arb-builtins-rinkeby',
//   cache: new InMemoryCache(),
// })

// const apolloL2GatewaysRinkebyClient = new ApolloClient({
//   uri: 'https://api.thegraph.com/subgraphs/name/fredlacs/layer2-token-gateway-rinkeby',
//   cache: new InMemoryCache(),
// })

// const apolloL2GatewaysClient = new ApolloClient({
//   uri: 'https://api.thegraph.com/subgraphs/name/fredlacs/layer2-token-gateway',
//   cache: new InMemoryCache(),
// })

// const networkIDAndLayerToClient = (networkID: string, layer: 1 | 2) => {
//   switch (networkID) {
//     case '1':
//       return layer === 1 ? apolloL1Mainnetlient : apolloL2Mainnetlient
//     case '4':
//       return layer === 1 ? apolloL1RinkebyClient : apolloL2RinkebyClient
//     default:
//       throw new Error('Unsupported network')
//   }
// }

// export const getLatestOutboxEntryIndex = async (networkID: string) => {
//   const client = networkIDAndLayerToClient(networkID, 1)
//   const res = await client.query({
//     query: gql`
//       {
//         outboxEntries(
//           orderBy: outboxEntryIndex
//           orderDirection: desc
//           first: 1
//         ) {
//           outboxEntryIndex
//         }
//       }
//     `,
//   })
//   return res.data.outboxEntries?.[0]?.outboxEntryIndex as number
// }

// export const messageHasExecuted = async (
//   path: BigNumber,
//   batchNumber: BigNumber,
//   networkID: string
// ) => {
//   const client = networkIDAndLayerToClient(networkID, 1)
//   const res = await client.query({
//     query: gql`{
//         outboxOutputs(where: {path:${path.toNumber()}, outboxEntry:"${batchNumber.toHexString()}", spent:true }) {
//           id,
//         }
//       }`,
//   })
//   return res.data.outboxOutputs.length > 0
// }

// interface GetTokenWithdrawalsResult {
//   l2ToL1Event: L2ToL1EventResult
//   otherData: {
//     value: BigNumber
//     tokenAddress: string
//     type: AssetType
//   }
// }

// export const getTokenWithdrawals = async (
//   sender: string,
//   fromBlock: number,
//   toBlock: number,
//   l1NetworkID: string
// ): Promise<GetTokenWithdrawalsResult[]> => {
//   const client = ((l1NetworkID: string) => {
//     switch (l1NetworkID) {
//       case '1':
//         return apolloL2GatewaysClient
//       case '4':
//         return apolloL2GatewaysRinkebyClient
//       default:
//         throw new Error('Unsupported network')
//     }
//   })(l1NetworkID)

//   const res = await client.query({
//     query: gql`{
//         withdrawals(
//           where: { from:"${sender}", l2BlockNum_gte: ${fromBlock}, l2BlockNum_lt: ${toBlock}}
//           orderBy: l2BlockNum
//           orderDirection: desc
//         ) {
//           l2ToL1Event {
//             id,
//             caller,
//             destination,
//             batchNumber,
//             indexInBatch,
//             arbBlockNum,
//             ethBlockNum,
//             timestamp,
//             callvalue,
//             data
//           },
//           amount,
//           exitInfo {
//             token {
//               id
//             }
//           }
//         }
//       }
//       `,
//   })
//   return res.data.withdrawals.map((eventData: any) => {
//     const {
//       amount: value,
//       exitInfo: {
//         token: { id: tokenAddress },
//       },
//       l2ToL1Event: {
//         id,
//         caller,
//         destination,
//         batchNumber,
//         indexInBatch,
//         arbBlockNum,
//         ethBlockNum,
//         timestamp,
//         callvalue,
//         data,
//       },
//     } = eventData
//     const l2ToL1Event = {
//       destination,
//       timestamp,
//       data,
//       caller,
//       uniqueId: BigNumber.from(id),
//       batchNumber: BigNumber.from(batchNumber),
//       indexInBatch: BigNumber.from(indexInBatch),
//       arbBlockNum: BigNumber.from(arbBlockNum),
//       ethBlockNum: BigNumber.from(ethBlockNum),
//       callvalue: BigNumber.from(callvalue),
//     } as L2ToL1EventResult
//     return {
//       l2ToL1Event,
//       otherData: {
//         value: BigNumber.from(value),
//         tokenAddress,
//         type: AssetType.ERC20,
//       },
//     }
//   })
// }

// const getLatestIndexedBlockNumber = async (subgraphName: string) => {
//   try {
//     const res = await axios.post(
//       'https://api.thegraph.com/index-node/graphql',
//       {
//         query: `{ indexingStatusForCurrentVersion(subgraphName: "${subgraphName}") {  chains { network latestBlock { number }  } } }`,
//       }
//     )
//     return res.data.data.indexingStatusForCurrentVersion.chains[0].latestBlock
//       .number
//   } catch (err) {
//     console.warn('Error getting graph status:', err)

//     return 0
//   }
// }

// export const getBuiltInsGraphLatestBlockNumber = (l1NetworkID: string) => {
//   const subgraphName = ((l1NetworkID: string) => {
//     switch (l1NetworkID) {
//       case '1':
//         return 'fredlacs/arb-builtins'
//       case '4':
//         return 'fredlacs/arb-builtins-rinkeby'
//       default:
//         throw new Error('Unsupported netwowk')
//     }
//   })(l1NetworkID)

//   return getLatestIndexedBlockNumber(subgraphName)
// }

// export const getL2GatewayGraphLatestBlockNumber = (l1NetworkID: string) => {
//   const subgraphName = ((l1NetworkID: string) => {
//     switch (l1NetworkID) {
//       case '1':
//         return 'fredlacs/layer2-token-gateway'
//       case '4':
//         return 'fredlacs/layer2-token-gateway-rinkeby'
//       default:
//         throw new Error('Unsupported netwowk')
//     }
//   })(l1NetworkID)

//   return getLatestIndexedBlockNumber(subgraphName)
// }
