/* eslint-disable max-depth */
import {
  computed,
  reactive,
  onMounted,
  useContext,
  watch,
} from '@nuxtjs/composition-api'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { activeNetwork } from './useNetwork'
import { useBigNumber } from './useBigNumber'
import balanceABI from '~/abi/balance.json'
import erc20Tokens from '~/constant/erc20Tokens'

const balances = reactive({
  user: null,
})

const prices = reactive({
  mainnet: {},
})

export function useBalances() {
  const { times, plus, ensureValue } = useBigNumber()
  const { account } = useWeb3()

  const fetchBalances = async (refresh = false) => {
    console.log(activeNetwork.value.id)
    if (!balances.user || refresh) {
      if (!account.value) return
      balances.user = {
        mainnet:
          activeNetwork.value.id === 'mainnet'
            ? await getBalances(account.value, activeNetwork.value.id, ethers)
            : {},
      }
    }
  }

  /*
  const getBalanceByAddress = (address, network = null, type = 'dsa') => {
    return (
      balances[type]?.[network || networkName.value][address]?.balance || '0'
    );
  };

  const getBalanceByKey = (tokenKey, network = null, type = 'dsa') => {
    return getBalanceByAddress(getTokenByKey(tokenKey)?.address, network, type);
  };

  const getBalanceRawByKey = (tokenKey, network = null, type = 'dsa') => {
    return (
      balances[type]?.[network || networkName.value][
        getTokenByKey(tokenKey)?.address
      ]?.raw || '0'
    );
  };
*/
  watch(ethers, () => {
    fetchBalances(true)
  })
  return {
    balances,
    fetchBalances,

    /*  getBalanceByKey,
    getBalanceRawByKey, */
    prices,
  }
}

async function getBalances(owner, networkName, ethers, additionalTokens = []) {
  try {
    const agldToken = erc20Tokens[networkName].getTokenByKey('agld')

    const tokenContract = new ethers.Contract(agldToken.address, balanceABI)

    console.log(owner)
    const tokenBalances = await tokenContract.methods.balanceOf(owner).call()
    console.log(tokenBalances)

    const tokensBalObj = new BigNumber(tokenBalances)
      .dividedBy(10 ** agldToken.decimals)
      .toFixed()

    return tokensBalObj
  } catch (error) {
    return Promise.reject(error)
  }
}
