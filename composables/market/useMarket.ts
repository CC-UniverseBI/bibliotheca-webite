import { reactive, ref, Ref } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { useNetwork, activeNetwork } from '../web3/useNetwork'
import {
  getAddLiquidityData,
  getBuyTokenData,
  getRemoveLiquidityData,
  getSellTokenData,
} from './encoders'

// ABI
import TheLordsTokenAbi from '~/abi/TheLordsToken.json'
import ResourceTokensAbi from '~/abi/ResourceTokens.json'
import ResourceExchangeAbi from '~/abi/NiftyswapExchange20.json'

// ADDRESS CONSTS

import resourceTokens from '~/constant/erc1155Tokens'
import erc1155Tokens from '~/constant/erc1155Tokens'
import erc20Tokens from '~/constant/erc20Tokens'

const { BigNumber } = ethers

export function useMarket() {
  const error = reactive({
    resources: null,
  })

  const loading = reactive({
    resources: false,
    fetchingResources: false,
  })

  const result = reactive({ resources: null })
  const output = ref()

  const fetchResourceReserve = async (resourceId) => {
    try {
      error.resources = null
      // loading.resources = true
      return await getResourceReserve(activeNetwork.value.id, resourceId)
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchLiquidityTokenSupply = async (resourceId) => {
    try {
      error.resources = null
      // loading.resources = true
      return await getLiquidityTokenSupply(activeNetwork.value.id, resourceId)
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchCurrencyReserve = async (resourceId) => {
    try {
      error.resources = null
      // loading.resources = true
      return await getCurrencyReserve(activeNetwork.value.id, resourceId)
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchResourcePrice = async (resourceId, amount = 1) => {
    try {
      error.resources = null
      // loading.resources = true
      return (await fetchBulkResourcePrices([resourceId], [amount]))[0]
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchBulkResourcePrices = async (resourceIds, amounts) => {
    try {
      error.resources = null
      // loading.resources = true
      return await getBuyPrices(activeNetwork.value.id, resourceIds, amounts)
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  const fetchLiquidityBalance = async (resourceId) => {
    try {
      error.resources = null
      // loading.resources = true
      return await getLiquidityBalance(activeNetwork.value.id, resourceId)
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  const buyTokens = async (resourceIds, resourceAmounts) => {
    try {
      error.resources = null
      // loading.resources = true
      return await sendBulkBuyResources(
        activeNetwork.value.id,
        resourceIds,
        resourceAmounts
      )
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }
  const sellTokens = async (resourceIds, resourceAmounts) => {
    try {
      error.resources = null
      // loading.resources = true
      return await sendBulkSellResources(
        activeNetwork.value.id,
        resourceIds,
        resourceAmounts
      )
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }
  const addLiquidity = async (resourceIds, resourceAmounts) => {
    try {
      error.resources = null
      // loading.resources = true
      return await sendAddLiquidity(
        activeNetwork.value.id,
        resourceIds,
        resourceAmounts
      )
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }
  const removeLiquidity = async (resourceIds, poolTokenAmounts) => {
    try {
      error.resources = null
      // loading.resources = true
      return await sendRemoveLiquidity(
        activeNetwork.value.id,
        resourceIds,
        poolTokenAmounts
      )
    } catch (e) {
      console.log(e)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  return {
    fetchCurrencyReserve,
    fetchResourceReserve,
    fetchLiquidityTokenSupply,
    fetchResourcePrice,
    fetchBulkResourcePrices,
    fetchLiquidityBalance,
    buyTokens,
    sellTokens,
    addLiquidity,
    removeLiquidity,
    error,
    loading,
    result,
    output,
  }
}

async function getCurrencyReserve(network, resourceId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokensArr = erc1155Tokens[network].allTokens
  const signer = provider.getSigner()
  const tokensAddrArr = tokensArr.map((a) => a.address)
  const exchange = new ethers.Contract(
    tokensAddrArr[1],
    ResourceExchangeAbi.abi,
    signer
  )

  const reserve = await exchange.getCurrencyReserves([resourceId])
  return reserve[0]
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

  const supply = await exchange.getTotalSupply([resourceId])
  return parseInt(ethers.utils.formatEther(supply[0])).toFixed(2)
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
  return parseInt(ethers.utils.formatEther(liquidityBal)).toFixed(2)
}

async function getBuyPrices(network, resourceIds, amounts) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const tokensArr = erc1155Tokens[network].allTokens
  const tokensAddrArr = tokensArr.map((a) => a.address)
  const exchange = new ethers.Contract(
    tokensAddrArr[1],
    ResourceExchangeAbi.abi,
    signer
  )

  const prices = await exchange.getPrice_currencyToToken(resourceIds, amounts)
  return ethers.utils.formatEther(prices)
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

  await validateAndApproveERC1155(network, 'erc1155Tokens', exAddr)

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
  for (let i = 0; i < resourceIds.length; i++) {
    const currency = await getCurrencyReserve(network, resourceIds[i])
    const tokens = await getResourceReserve(network, resourceIds[i])
    const maxCurrency = currency.gt(0)
      ? currency.mul(resourceAmounts[i]).div(tokens.sub(resourceAmounts[i]))
      : BigNumber.from(10).pow(18).mul(resourceIds[i]).mul(resourceAmounts[i])
    currencyAmounts.push(maxCurrency)
  }

  await validateAndApproveERC1155(network, 'erc1155Tokens', exAddr)
  await validateAndApproveERC20(
    network,
    'LordsToken',
    exAddr,
    currencyAmounts.reduce((a, b) => a.add(b))
  )

  const data = getAddLiquidityData(currencyAmounts, deadline)

  const resources = new ethers.Contract(
    resourceAddr,
    ResourceTokensAbi.abi,
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
  for (let i = 0; i < resourceIds.length; i++) {
    const supply = await getLiquidityTokenSupply(network, resourceIds[i])
    const currency = await getCurrencyReserve(network, resourceIds[i])
    const tokens = await getResourceReserve(network, resourceIds[i])
    const minCurrency = currency.mul(poolTokenAmounts[i]).div(supply)
    const minTokens = tokens.mul(poolTokenAmounts[i]).div(supply)
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
  if (balance.lt(amount)) throw new Error('ERC20: INSUFFICIENT BALANCE')

  const allowance = await erc20.allowance(await signer.getAddress(), spender)
  if (allowance.lt(amount)) await erc20.approve(spender, amount)
}

async function validateAndApproveERC1155(network, key, spender) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const address = resourceTokens[network].getTokenByKey(key).address
  const erc1155 = new ethers.Contract(address, ResourceTokensAbi.abi, signer)

  const isAllowed = await erc1155.isApprovedForAll(
    await signer.getAddress(),
    spender
  )
  if (!isAllowed) await erc1155.setApprovalForAll(spender, true)
}
