# ETHWarsaw Workshop: DeFi telegram bot 
Today we will be leveraging the Enso API for building a DeFi telegram information and execution bot.

## Enso Overview
The Enso API not only offers you all metadata such as apy, tvl, addresses, underlying tokens, logos, urls, and so forth.  It also offers you execution into DeFi protocols for actions like:  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. farming  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. lending  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. borrowing  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4. liquidity provisioning  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5. farming  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6. and much more  

You can do native transaction bundling as well, i.e. enter 50 defi positions in one transaction.  
Compatible with gnosis safe, and any smart wallet that enables delegatecall..

## Prerequisites
1. Fork this repo
2. copy .env.example into .env
3. Generate [telegram bot key](https://t.me/BotFather)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. run `/newbot`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. input a unique name  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. copy you're API key and put inside of [.env](.env)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4. message your bot `@your_bot_handle`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5. press `/start`  
   
## FAQ
1. We will be using the Enso Smart wallet today, and all funds will be stored inside of this... unless you reach the extra challenges
2. 

## Bot commands
`/start`: lists all resources and welcome message  
`/help`:  command to query information about projects including, protocol list, pool list and apy  
`/initialize`  
`/route`: execute swaps, deposits, farming and so forth  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`single`: route from 1 token to 1 token  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`batch`: route from 1 token to N  
`/projects`: query information about projects including, protocol list, pool list and apy  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`list`: list all projects available through Enso  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`pools`: list all pools for a project with Symbol, APY, TVL, and Address  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`apy`: fetch apy for a specific pool  


## Challenges
Let's get going.


### Metadata
ENSO API offers metadata  
[swagger](https://api.enso.finance/api#/metadata/DefiTokensController_defiTokens)  
[official docs](https://docs.enso.finance/metadata-api/introduction)  

#### 1. Fetch all projects
Extend the `getDeFiTokens` inside of [./api/enso.ts](./api/enso.ts)  
```javascript
export async function getDefiTokens() {
    const data = `xxxxxxx`
    const response = await fetch(data)
    return await response.json()

```

#### 2. Fetch pools related to a project
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

#### 3. Fetch APY related to a specific pool
Extend the `getPoolApy` inside of [./api/enso.ts](./api/enso.ts)  
```javascript
export async function getPoolApy(poolAddress: string) {
    const data = `xxxx`
    const response = await fetch(data)
    const apy = (await response.json())[0].apy
    return apy
}
```

#### 4. Fetch balance of wallet
ENSO API offers execution known as `shortcuts`  
[swagger](https://api.enso.finance/api#/)  
[official docs: router](https://docs.enso.finance/router-api/introduction)  
[official docs: bundle](https://docs.enso.finance/bundler-api/introduction)  

### Execution

#### 1. Deposit into DeFi farm
Extend the `getRoute` inside of [./api/enso.ts](./api/enso.ts)  
```javascript
export async function getRoute(tokenIn: string, toToken: string, amountIn: number){
    const query = `xxxx`
    const response = await fetch(query)
    return await response.json()
}
```

#### 2. Deposit into many DeFi farms in 1 tx
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

### Gigabrain 
If you do this within this dedicated workshop... wow.. impressive srsly.

#### 1. Full cycle deployment
Other "defi bots" have a centralization risk of exposing private keys and so forth.  Time to crack open that second beer and lets harness the full power of Smart Wallets, account abstraction and so forth.

1. When `/start` enable user to click link to url
   1. user enter eoa public address
   2. link to external ui
      1. button to deploy Enso Smart Wallet
      2. enable user to sign unique data from bot
   3. event list for deployment of Enso Smart Wallet
      1. [factory contract](https://etherscan.io/address/0x7fea6786d291a87fc4c98afccc5a5d3cfc36bc7b)
      2. factory event
        ```javascript
            event Deployed(IEnsoWallet instance, string label, address deployer);
        ```
      3. [factory proxy](https://etherscan.io/address/0x66fc62c1748e45435b06cf8dd105b73e9855f93e#code)
   4. user submit signed data in bot
      1. bot locked only usable by this telegram username
   5. bot returns with unique public key
      1. user enters unique metadata or information 
      2. bot generates signature from data
   6. user submits tx on UI with signature with tx to add bot as executor


You can extend this to add role permissions, remove roles, grant only particular access to the telegram bot and so forth.

**GO PROD**