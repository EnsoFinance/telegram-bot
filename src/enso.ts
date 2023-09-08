import axios, { AxiosError } from "axios";
import { BigNumber } from "ethers";
import { ETH, SAFE_WALLET } from "./constants";

const AUTH_HEADER = {
  headers: {
    Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
  },
};

/*
TODO:
1. pass inside the params into one call instead of constantly rewriting the query
*/

export async function getRoute(toToken: string, amountIn: BigNumber) {
  try {
    const response = (
      await axios.get(
        `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${SAFE_WALLET}&amountIn=${amountIn.toString()}&tokenIn=${ETH}&tokenOut=${toToken}`,
        AUTH_HEADER
      )
    ).data;
    console.log("Single response:", response);
    return response;
  } catch (e: any) {
    if (e instanceof AxiosError) throw `Route failed: ${e.response?.data}`;
    else throw e;
  }
}

export async function getRouteBundle(toTokens: string[], amountIn: BigNumber) {
  const query = `https://api.enso.finance/api/v1/shortcuts/bundle?chainId=1&fromAddress=${SAFE_WALLET}`;
  const amountSplit = amountIn.div(toTokens.length).toString();
  const data = toTokens.map((token) => ({
    protocol: "enso",
    action: "route",
    args: {
      tokenIn: ETH,
      tokenOut: token,
      amountIn: amountSplit,
    },
  }));
  try {
    const response = (await axios.post(query, data, AUTH_HEADER)).data;
    console.log("Batch response: ", response);
    return response;
  } catch (e) {
    if (e instanceof AxiosError)
      throw `Bundle failed: ${JSON.stringify(e.response?.data)}`;
    else throw e;
  }
}

export async function getProjects() {
  let unparsedArray: string[] = [];
  const json = await getDefiTokens();
  for (let i = 0; i < json.length; i++) {
    unparsedArray.push(json[i].project);
  }
  const uniqueProjects = uniqueArray(unparsedArray);
  return uniqueProjects;
}

// hacky; no validation of project name exists fyi :)
export async function getPools(project: string) {
  var pools = [["Pool Name | APY | TVL | Pool Address"]];
  const response = (
    await axios.get(
      `https://api.enso.finance/api/v1/defiTokens?protocol=${project}`,
      AUTH_HEADER
    )
  ).data;

  // limit to 50 pools due to telegram message limit.  You can still console.log the full list here before array if you want more details
  for (let i = 0; i < (response.length < 50 ? response.length : 50); i++) {
    pools.push([
      response[i].subtitle,
      response[i].apy,
      response[i].tvl,
      response[i].poolAddress,
    ]);
  }
  return pools;
}

export async function getPoolApy(poolAddress: string) {
  const url = `https://api.enso.finance/api/v1/defiTokens?tokenAddress=${poolAddress}`;
  const apy = (await axios.get(url, AUTH_HEADER)).data[0].apy;
  return apy;
}

export async function getDefiTokens() {
  const url = `https://api.enso.finance/api/v1/defiTokens`;
  const tokens = (await axios.get(url, AUTH_HEADER)).data;
  return tokens;
}

export async function getDefiBalance(walletAddress: string) {
  const url = `https://api.enso.finance/api/v1/wallet/balances?chainId=1&eoaAddress=${walletAddress}&tokenType=defiTokens`;
  const balance = (await axios.get(url, AUTH_HEADER)).data;
  return balance;
}

function uniqueArray(unparsedArray: string[]) {
  return unparsedArray.filter(
    (value, index, array) => array.indexOf(value) === index
  );
}
