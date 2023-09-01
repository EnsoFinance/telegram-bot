import { fetch } from "cross-fetch";
import axios from "axios";

/*
TODO:
1. pass inside the params into one call instead of constantly rewriting the query
*/

export async function getRoute(toToken: string, amountIn: BigInt) {
  const response = await fetch(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&amountIn=${amountIn.toString()}&slippage=300&tokenIn=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&tokenOut=${toToken}`
  );
  console.log("Single response:", response);
  if (response.status !== axios.HttpStatusCode.Ok) throw "Route failed!";
  return response.json();
}

export async function getRouteBundle(toTokens: string[], amountIn: BigInt) {
  const query = `https://api.enso.finance/api/v1/shortcuts/bundle?chainId=1&fromAddress=0xd8da6bf26964af9d7eed9e03e53415d37aa96045`;
  const amountSplit = (
    BigInt(amountIn.toString()) / BigInt(toTokens.length)
  ).toString();
  const data = toTokens.map((token) => ({
    protocol: "enso",
    action: "route",
    args: {
      tokenIn: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      tokenOut: token,
      amountIn: amountSplit,
    },
  }));
  const response = await axios.post(query, data, {
    headers: {
      Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
    },
  });

  console.log("Batch response: ", response);
  if (response.status !== axios.HttpStatusCode.Ok) throw "Route failed!";
  return response.data;
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
  const data = `https://api.enso.finance/api/v1/defiTokens?protocol=${project}`;
  const json = await (await fetch(data)).json();

  // limit to 50 pools due to telegram message limit.  You can still console.log the full list here before array if you want more details
  for (let i = 0; i < 50; i++) {
    pools.push([
      json[i].subtitle,
      json[i].apy,
      json[i].tvl,
      json[i].poolAddress,
    ]);
  }
  return pools;
}

export async function getPoolApy(poolAddress: string) {
  const data = `https://api.enso.finance/api/v1/defiTokens?tokenAddress=${poolAddress}`;
  const response = await fetch(data);
  const apy = (await response.json())[0].apy;
  return apy;
}

export async function getDefiTokens() {
  const data = `https://api.enso.finance/api/v1/defiTokens`;
  const response = await fetch(data);
  return await response.json();
}

export async function getDefiBalance(walletAddress: string) {
  const data = `https://api.enso.finance/api/v1/wallet/balances?chainId=1&eoaAddress=${walletAddress}&tokenType=defiTokens`;
  const response = await fetch(data);
  return await response.json();
}

function uniqueArray(unparsedArray: string[]) {
  return unparsedArray.filter(
    (value, index, array) => array.indexOf(value) === index
  );
}
