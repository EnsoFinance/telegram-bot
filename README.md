# Enso Workshop: DeFi telegram bot 
Today we will be leveraging the Enso API for building a DeFi telegram information and execution bot.

## Enso Overview
The Enso API not only offers you all metadata such as apy, tvl, addresses, underlying tokens, logos, urls, and so forth.  It also offers you execution into DeFi protocols for actions like:  

1. farming  
2. lending  
3. borrowing  
4. liquidity provisioning  
5. farming  
6. and much more

You can do native transaction bundling as well, i.e. enter 50 defi positions in one transaction.  
Compatible with gnosis safe, and any smart wallet that enables delegatecall..

## Docs
- [API Docs](https://docs.enso.finance/)
- [Swagger](https://api.enso.finance/api#/)
- [Examples Repo](https://github.com/EnsoFinance/shortcuts-api-examples)

## Setup
1. Fork this repo
2. Install dependencies with `npm install`
3. Copy .env.example into .env
4. Generate [telegram bot key](https://t.me/BotFather)  
   1. Run `/newbot`  
   2. Input a unique name  
   3. Copy you're API key and put inside of [.env](.env)
5. Start the bot with `npm run bot`
6. Send your bot `@your_bot_handle` the message `/help` 

## Bot commands
- `/help`:  command to query information about projects including, protocol list, pool list and apy  
- `/start`: lists all resources and welcome message  
- `/route`: execute swaps, deposits, farming and so forth  
  - `single`: route from 1 token to 1 token  
  - `batch`: route from 1 token to N  
- `/projects`: query information about projects including, protocol list, pool list and apy  
  - `list`: list all projects available through Enso  
  - `pools`: list all pools for a project with Symbol, APY, TVL, and Address  
  - `apy`: fetch apy for a specific pool  


## Challenges

### Execution

#### 1. Deposit into DeFi farm
Add the correct API URL in `getRoute` inside of [./src/enso.ts](./src/enso.ts)  
```javascript
export async function getRoute(toToken: string, amountIn: BigNumber) {
  const url = "XXX";

  try {
    const response = (
      await axios.get(
        `${url}?chainId=1&fromAddress=${SAFE_WALLET}&amountIn=${amountIn.toString()}&tokenIn=${ETH}&tokenOut=${toToken}`,
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
```

#### 2. Deposit into many DeFi farms in 1 tx
Add the correct API URL in `getRouteBundle` inside of [./src/enso.ts](./src/enso.ts)  
```javascript
export async function getRouteBundle(toTokens: string[], amountIn: BigNumber) {
  const url = "XXX";

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
    const response = (
      await axios.post(
        `${url}?chainId=1&fromAddress=${SAFE_WALLET}`,
        data,
        AUTH_HEADER
      )
    ).data;
    console.log("Batch response: ", response);
    return response;
  } catch (e) {
    if (e instanceof AxiosError)
      throw `Bundle failed: ${JSON.stringify(e.response?.data)}`;
    else throw e;
  }
}
```

### Metadata

#### 1. Fetch all projects
Add the correct API URL in `getProjects` inside of [./src/enso.ts](./src/enso.ts)  
```javascript
export async function getProjects() {
  const url = "XXX";

  let projects: any = [];
  const standards = (await axios.get(url, AUTH_HEADER)).data;
  standards.forEach((standard: any) => {
    if (standard.protocol) projects.push(standard.protocol.slug);
    if (standard.forks)
      projects.push(...standard.forks.map((fork: any) => fork.slug));
  });
  return projects;
}
```

#### 2. Fetch pools related to a project
Add the correct API URL in `getPools` inside of [./src/enso.ts](./src/enso.ts)  
```javascript
export async function getPools(project: string) {
  const url = "XXX";

  let pools = [["*Pool Name | APY | TVL | Pool Address*"]];
  const response = (await axios.get(`${url}?protocol=${project}`, AUTH_HEADER))
    .data;
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
```

#### 3. Fetch APY related to a specific pool
Add the correct API URL in `getPoolApy` inside of [./src/enso.ts](./src/enso.ts)  
```javascript
export async function getPoolApy(poolAddress: string) {
  const url = "XXX";

  const apy = (
    await axios.get(`${url}?tokenAddress=${poolAddress}`, AUTH_HEADER)
  ).data[0].apy;
  return apy;
}
```

## Extra challenges

### Metadata

#### 1. Enable symbol querying
Not knowing addresses is common.  
Enable interaction within `getRoute`, `getRouteBundle`, and `getPoolApy`.. and if there is any more.  
For example
```json
    "eth": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "stecrv": "0x06325440D014e39736583c165C2963BA99fAf14E"
```

#### 2. Top 10 APY per underlying
1. Fetch all the underlying tokens, and then enable users to define the tokens they want exposure to.  
   1. You can view this as an information intent: `Find me the top 10 best APY with exposure to stETH, and ETH`
2. Enable execution

### Execution

#### 1. Emergency withdrawal
Enable one call to withdraw all funds from the Smart Wallet to designated address passed in.
