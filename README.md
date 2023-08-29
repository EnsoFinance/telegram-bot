# ETHWarsaw Workshop: DeFi telegram bot 
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

## Prerequisites
1. Fork this repo
2. copy .env.example into .env
3. Generate [telegram bot key](https://t.me/BotFather)
   1. run `/newbot`
   2. input a unique name
   3. copy you're API key and put inside of [.env](.env)
   4. message your bot `@your_bot_handle`
   5. press `/start`
   

## Bot commands
`/start`: lists all resources and welcome message  
`/help`:  command to query information about projects including, protocol list, pool list and apy  
`/initialize`
`/route`: execute swaps, deposits, farming and so forth
    `single`: route from 1 token to 1 token 
    `batch`: route from 1 token to N
`/projects`: query information about projects including, protocol list, pool list and apy
    `list`: list all projects available through Enso
    `pools`: list all pools for a project with Symbol, APY, TVL, and Address
    `apy`: fetch apy for a specific pool


## Challenges
Let's get going.


### Metadata
ENSO API offers metadata  
[swagger](https://api.enso.finance/api#/metadata/DefiTokensController_defiTokens)  
[official docs](https://docs.enso.finance/metadata-api/introduction)  

#### Fetch all projects
Extend the `getDeFiTokens` inside of [./api/enso.ts](./api/enso.ts)  
```javascript
export async function getDefiTokens() {
    const data = `xxxxxxx`
    const response = await fetch(data)
    return await response.json()

```

#### Fetch pools related to a project
Extend the `getPools` inside of [./api/enso.ts](./api/enso.ts)  
```javascript
export async function getPools(project: string) {
    var pools = [['Pool Name | APY | TVL | Pool Address']]
    const data = `xxxx`
    const json = await (await fetch(data)).json()
    
    // limit to 50 pools due to telegram message limit.  You can still console.log the full list here before array if you want more details
    for (let i = 0; i < 50; i++) {
        pools.push([json[i].subtitle, json[i].apy, json[i].tvl, json[i].poolAddress])
    }    
    return pools
}
```

#### Fetch APY related to a specific pool
Extend the `getPoolApy` inside of [./api/enso.ts](./api/enso.ts)  
```javascript
export async function getPoolApy(poolAddress: string) {
    const data = `xxxx`
    const response = await fetch(data)
    const apy = (await response.json())[0].apy
    return apy
}
```

#### Fetch balance of wallet
ENSO API offers execution known as `shortcuts`  
[swagger](https://api.enso.finance/api#/)  
[official docs: router](https://docs.enso.finance/router-api/introduction)  
[official docs: bundle](https://docs.enso.finance/bundler-api/introduction)  

### Execution

#### Deposit into DeFi farm
Extend the `getRoute` inside of [./api/enso.ts](./api/enso.ts)  
```javascript
export async function getRoute(tokenIn: string, toToken: string, amountIn: number){
    const query = `xxxx`
    const response = await fetch(query)
    return await response.json()
}
```


#### Deposit into many DeFi farms in 1 tx
Extend the `getRouteBundle` inside of [./api/enso.ts](./api/enso.ts)  
```javascript
export async function getRouteBundle(tokenIn: string, toToken: string[], amountIn: number) {
    const query = `xxx`
    const amountSplit = (amountIn / toToken.length).toString()
    var data = 
    [   
        {
        }
    ]
}
```