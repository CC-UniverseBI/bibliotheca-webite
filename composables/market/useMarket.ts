import { computed, reactive, ref, Ref } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { useNetwork, activeNetwork } from '../web3/useNetwork'
import { useResources } from '../resources/useResources'
import { useBigNumber } from '../web3/useBigNumber'
import {
  getAddLiquidityData,
  getBuyTokenData,
  getRemoveLiquidityData,
  getSellTokenData,
} from './encoders'
import { useNotification } from '~/composables/useNotification'

// ABI
import TheLordsTokenAbi from '~/abi/TheLordsToken.json'
import ResourceTokensAbi from '~/abi/ResourceTokens.json'
import ResourceExchangeAbi from '~/abi/NiftyswapExchange20.json'

// ADDRESS CONSTS

import erc1155Tokens from '~/constant/erc1155Tokens'
import erc20Tokens from '~/constant/erc20Tokens'

const { BigNumber } = ethers
const selectedResources = ref([])
const lordsPrice = ref(null)
export function useMarket() {
  const { plus } = useBigNumber()
  const { showError } = useNotification()
  const { allUsersResources, resourceListOrdered } = useResources()
  const error = reactive({
    market: null,
  })

  const loading = reactive({
    market: false,
  })
  const result = reactive({ resources: null })
  const output = ref()
  const allUserTokenValues = ref(
    allUsersResources.value
      .filter((e) => e.value > 1)
      .map((e) => {
        return { id: e.id, value: '0' }
      })
  )
  const allTokenPrices = ref(
    allUsersResources.value
      .filter((e) => e.value > 1)
      .map((e) => {
        return { id: e.id, price: '0' }
      })
  )

  const fetchUserTokenValues = async () => {
    try {
      const resourcesWithBalance = allUsersResources.value.filter((e) => {
        return e.value > 1 && e.balance > 0
      })
      const prices = await fetchBulkResourcePrices(
        resourcesWithBalance.map((e) => e.id),
        resourcesWithBalance.map((e) => e.balance)
      )
      resourcesWithBalance.forEach((e, i) => {
        const index = allUsersResources.value.map((e) => e.id).indexOf(e.id)
        allUserTokenValues.value[index].value = BigNumber.from(prices[i])
          .mul(e.balance as number)
          .toString()
      })
    } catch (e) {
      console.log(e)
    } finally {
      console.log('ss')
    }
  }

  const fetchAllTokenPrices = async () => {
    try {
      const resourceIds = allUsersResources.value
        .filter((e) => {
          return e.value > 1
        })
        .map((e) => e.id)
      const prices = await fetchBulkResourcePrices(
        resourceIds,
        resourceIds.map(() => 1)
      )
      resourceIds.forEach((e, i) => {
        allTokenPrices.value[i].price = prices[i].toString()
      })
    } catch (e) {
      console.log(e)
    } finally {
      console.log('ss')
    }
  }

  const fetchResourceReserve = async (resourceId) => {
    try {
      error.market = null
      // loading.market = true
      return await getResourceReserve(activeNetwork.value.id, resourceId)
    } catch (e) {
      console.log(e)
      error.market = e.message
    } finally {
      // loading.market = false
    }
  }

  const fetchLiquidityTokenSupply = async (resourceId) => {
    try {
      error.market = null
      // loading.resources = true
      return await getLiquidityTokenSupply(activeNetwork.value.id, resourceId)
    } catch (e) {
      console.log(e)
      error.market = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchCurrencyReserve = async (resourceId) => {
    return await fetchCurrencyReserves([resourceId])
  }

  const fetchCurrencyReserves = async (resourceIds) => {
    try {
      error.market = null
      // loading.resources = true
      return await getCurrencyReserves(activeNetwork.value.id, resourceIds)
    } catch (e) {
      console.log(e)
      error.market = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchResourcePrice = async (
    resourceId,
    amount = 1,
    getSellPrice = true
  ) => {
    console.log('price')
    try {
      error.market = null
      // loading.resources = true
      return (
        await fetchBulkResourcePrices([resourceId], [amount], getSellPrice)
      )[0]
    } catch (e) {
      console.log(e)
      error.market = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchBulkResourcePrices = async (
    resourceIds,
    amounts,
    getSellPrice = true
  ) => {
    try {
      error.market = null
      // loading.resources = true
      const prices = await getPrices(
        activeNetwork.value.id,
        resourceIds,
        amounts,
        getSellPrice
      )
      return prices
    } catch (e) {
      console.log(e)
      error.market = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchLiquidityBalance = async (resourceId) => {
    try {
      error.market = null
      // loading.resources = true
      return await getLiquidityBalance(activeNetwork.value.id, resourceId)
    } catch (e) {
      console.log(e)
      error.market = e.message
    } finally {
      // loading.resources = false
    }
  }

  const buyTokens = async (resourceIds, resourceAmounts) => {
    try {
      loading.market = true
      return await sendBulkBuyResources(
        activeNetwork.value.id,
        resourceIds,
        resourceAmounts
      )
    } catch (e) {
      console.log(e)
      await showError(e.data.message)
    } finally {
      loading.market = false
    }
  }
  const sellTokens = async (resourceIds, resourceAmounts) => {
    console.log(resourceIds)
    try {
      loading.market = true
      return await sendBulkSellResources(
        activeNetwork.value.id,
        resourceIds,
        resourceAmounts
      )
    } catch (e) {
      await showError(e.data.message)
    } finally {
      loading.market = false
    }
  }
  const addLiquidity = async (resourceIds, resourceAmounts) => {
    try {
      loading.market = true
      return await sendAddLiquidity(
        activeNetwork.value.id,
        resourceIds,
        resourceAmounts
      )
    } catch (e) {
      console.log(e)
      // await showError(e.data)
    } finally {
      loading.market = false
    }
  }
  const removeLiquidity = async (resourceIds, poolTokenAmounts) => {
    try {
      error.market = null
      // loading.resources = true
      return await sendRemoveLiquidity(
        activeNetwork.value.id,
        resourceIds,
        poolTokenAmounts
      )
    } catch (e) {
      console.log(e)
      // await showError(e.data)
    } finally {
      loading.market = false
    }
  }

  const addToMarket = (resource) => {
    const i = selectedResources.value.map((e) => e.id).indexOf(resource.id)
    if (i === -1) {
      selectedResources.value.push(resource)
      updateLordsPrice()
    } else {
      selectedResources.value.splice(i, 1)
      updateLordsPrice()
    }
  }

  const onAmountChanged = (resource, amount) => {
    console.log(amount)
    const i = selectedResources.value.map((e) => e.id).indexOf(resource.id)
    selectedResources.value[i].amount = amount

    updateLordsPrice()
  }

  const updateLordsPrice = async () => {
    const filtered = selectedResources.value.filter((e) => e.amount > 0)

    const ids = filtered.map((e) => e.id)
    const amounts = filtered.map((e) => e.amount)
    if (ids.length) {
      const prices = await fetchBulkResourcePrices(ids, amounts)

      const total = prices.reduce((a, b) => a.add(b))

      lordsPrice.value = parseInt(ethers.utils.formatEther(total)).toFixed(2)
    } else {
      lordsPrice.value = 0
    }
  }
  return {
    addToMarket,
    onAmountChanged,
    fetchUserTokenValues,
    fetchAllTokenPrices,
    fetchCurrencyReserve,
    fetchCurrencyReserves,
    fetchResourceReserve,
    fetchLiquidityTokenSupply,
    fetchResourcePrice,
    fetchBulkResourcePrices,
    fetchLiquidityBalance,
    buyTokens,
    sellTokens,
    addLiquidity,
    removeLiquidity,
    updateLordsPrice,
    selectedResources,
    error,
    loading,
    result,
    output,
    allUserTokenValues,
    allTokenPrices,
    lordsPrice,
  }
}

// GETTERS

async function getCurrencyReserves(network, resourceIds) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const exAddr = erc1155Tokens[network].allTokens[1].address
  const signer = provider.getSigner()
  const exchange = new ethers.Contract(exAddr, ResourceExchangeAbi.abi, signer)
  console.log(resourceIds)
  const reserves = await exchange.getCurrencyReserves(resourceIds)
  return reserves
}

async function getResourceReserve(network, resourceId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const exAddr = erc1155Tokens[network].allTokens[1].address
  const resourceAddr = erc1155Tokens[network].allTokens[0].address
  const signer = provider.getSigner()

  const resources = new ethers.Contract(
    resourceAddr,
    ResourceExchangeAbi.abi,
    signer
  )
  const reserve = await resources.balanceOf(exAddr, resourceId)
  return reserve
}

async function getLiquidityTokenSupply(network, resourceId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokensArr = erc1155Tokens[network].allTokens
  const signer = provider.getSigner()
  const tokensAddrArr = tokensArr.map((a) => a.address)
  const exchange = new ethers.Contract(
    tokensAddrArr[1],
    ResourceExchangeAbi.abi,
    signer
  )

  const supply = await exchange.getTotalSupply(resourceId)
  return supply
}

async function getLiquidityBalance(network, resourceId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokensArr = erc1155Tokens[network].allTokens
  const signer = provider.getSigner()
  const tokensAddrArr = tokensArr.map((a) => a.address)
  const exchange = new ethers.Contract(
    tokensAddrArr[1],
    ResourceExchangeAbi.abi,
    signer
  )

  const liquidityBal = await exchange.balanceOf(await signer.getAddress(), [
    resourceId,
  ])
  return liquidityBal
}

async function getPrices(network, resourceIds, amounts, getSellPrice) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const tokensArr = erc1155Tokens[network].allTokens
  const tokensAddrArr = tokensArr.map((a) => a.address)
  const exchange = new ethers.Contract(
    tokensAddrArr[1],
    ResourceExchangeAbi.abi,
    signer
  )

  const sortedIds = resourceIds.sort((a, b) => a - b)

  const reserves = await getCurrencyReserves(network, sortedIds)
  const filteredAmounts = []
  const withReserves = []
  reserves.forEach((e, i) => {
    if (!e.gt(0)) return
    filteredAmounts.push(e.gt(amounts[i]) ? amounts[i] : e)
    withReserves.push(resourceIds[i])
  })
  const priceFunction = getSellPrice
    ? exchange.getPrice_tokenToCurrency
    : exchange.getPrice_currencyToToken
  const prices = await priceFunction(withReserves, filteredAmounts)

  return sortedIds.map((e, i) => {
    if (withReserves.includes(e)) {
      return prices[withReserves.indexOf(e)]
    } else return 0
  })
}

// MARKET OPERATIONS

async function sendBulkBuyResources(
  network,
  resourceIds,
  resourceAmounts,
  deadline = Math.floor(Date.now() / 1000) + 100000
) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const exAddr = erc1155Tokens[network].allTokens[1].address
  const exchange = new ethers.Contract(exAddr, ResourceExchangeAbi.abi, signer)

  // PRICES
  const prices = await exchange.getPrice_currencyToToken(
    resourceIds,
    resourceAmounts
  )
  const totalCost = prices.reduce((a, b) => a.add(b))

  // APPROVE
  await validateAndApproveERC20(network, 'LordsToken', exAddr, totalCost)

  await exchange.buyTokens(
    resourceIds,
    resourceAmounts,
    totalCost,
    deadline,
    await signer.getAddress()
  )
}

async function sendBulkSellResources(
  network,
  resourceIds,
  resourceAmounts,
  deadline = Math.floor(Date.now() / 1000) + 100000
) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const exAddr = erc1155Tokens[network].allTokens[1].address
  const exchange = new ethers.Contract(exAddr, ResourceExchangeAbi.abi, signer)

  const prices = await exchange.getPrice_tokenToCurrency(
    resourceIds,
    resourceAmounts
  )

  await validateAndApproveERC1155(network, 'resourceExchange', exAddr)

  const data = getSellTokenData(
    await signer.getAddress(),
    prices.reduce((a, b) => a.add(b)),
    deadline
  )

  const resourceAddr = erc1155Tokens[network].allTokens[0].address
  const resources = new ethers.Contract(
    resourceAddr,
    ResourceExchangeAbi.abi,
    signer
  )
  return await resources.safeBatchTransferFrom(
    await signer.getAddress(),
    exAddr,
    resourceIds,
    resourceAmounts,
    data
  )
}

async function sendAddLiquidity(
  network,
  resourceIds,
  resourceAmounts,
  deadline = Math.floor(Date.now() / 1000) + 100000
) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const exAddr = erc1155Tokens[network].allTokens[1].address
  const resourceAddr = erc1155Tokens[network].allTokens[0].address

  const currencyAmounts = []
  const currency = await getCurrencyReserves(network, resourceIds)

  for (let i = 0; i < resourceIds.length; i++) {
    const token = await getResourceReserve(network, resourceIds[i])

    const decimalsToken = ethers.utils.parseUnits(token.toString(), 'ether')

    console.log(currency[i].toString())
    console.log(resourceAmounts[i].toString())
    console.log(decimalsToken)
    const maxCurrency = currency[i].gt(0)
      ? currency[i]
          .mul(resourceAmounts[i])
          .div(decimalsToken.sub(resourceAmounts[i]))
      : BigNumber.from(1 ** 18)

    currencyAmounts.push(maxCurrency)
  }

  console.log(
    currencyAmounts.reduce((a, b) => a.add(b)),
    'currency amounts'
  )

  await validateAndApproveERC1155(network, 'resourceExchange', exAddr)
  await validateAndApproveERC20(
    network,
    'LordsToken',
    exAddr,
    currencyAmounts.reduce((a, b) => a.add(b))
  )
  console.log(currencyAmounts)
  const data = getAddLiquidityData(currencyAmounts, deadline)

  const resources = new ethers.Contract(
    resourceAddr,
    ResourceTokensAbi.abi,
    signer
  )
  console.log(data)
  return await resources.safeBatchTransferFrom(
    await signer.getAddress(),
    exAddr,
    resourceIds,
    resourceAmounts,
    data
  )
}

async function sendRemoveLiquidity(
  network,
  resourceIds,
  poolTokenAmounts,
  deadline = Math.floor(Date.now() / 1000) + 100000
) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const exAddr = erc1155Tokens[network].allTokens[1].address

  const currencyAmounts = []
  const resourceAmounts = []

  const supply = await getLiquidityTokenSupply(network, resourceIds)
  const currency = await getCurrencyReserves(network, resourceIds)

  for (let i = 0; i < resourceIds.length; i++) {
    const token = await getResourceReserve(network, resourceIds[i])
    const minCurrency = currency[i].mul(poolTokenAmounts[i]).div(supply[i])

    const minTokens = token.mul(poolTokenAmounts[i]).div(supply[i])

    currencyAmounts.push(minCurrency)
    resourceAmounts.push(minTokens)
  }

  await validateAndApproveERC1155(network, 'resourceExchange', exAddr)

  const data = getRemoveLiquidityData(
    currencyAmounts,
    resourceAmounts,
    deadline
  )

  const exchange = new ethers.Contract(exAddr, ResourceExchangeAbi.abi, signer)
  return await exchange.safeBatchTransferFrom(
    await signer.getAddress(),
    exAddr,
    resourceIds,
    poolTokenAmounts,
    data
  )
}

// APPROVALS

async function validateAndApproveERC20(network, key, spender, amount) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const address = erc20Tokens[network].getTokenByKey(key).address
  const erc20 = new ethers.Contract(address, TheLordsTokenAbi.abi, signer)

  const balance = await erc20.balanceOf(await signer.getAddress())
  console.log(balance)
  console.log(amount)
  if (balance.lt(amount)) throw new Error('ERC20: INSUFFICIENT BALANCE')

  const allowance = await erc20.allowance(await signer.getAddress(), spender)
  if (allowance.lt(amount)) await erc20.approve(spender, amount)
}

async function validateAndApproveERC1155(network, key, spender) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const address = erc1155Tokens[network].getTokenByKey(key).address
  const erc1155 = new ethers.Contract(address, ResourceTokensAbi.abi, signer)

  const isAllowed = await erc1155.isApprovedForAll(
    await signer.getAddress(),
    spender
  )
  if (!isAllowed) await erc1155.setApprovalForAll(spender, true)
}
