# DeFi telegram bot 
This project is a "fun project" built on-top of Enso used within workshops, and the full guidelines for the workshop can be viewed at [./workshop.md](./workshop.md)

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


### Resources
ENSO API offers metadata  
[swagger](https://api.enso.finance/api#/)
[official docs](https://docs.enso.finance/)