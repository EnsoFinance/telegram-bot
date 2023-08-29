import { Bot, Context, session, SessionFlavor, InlineKeyboard, Composer } from 'grammy'
import { Menu, MenuRange } from '@grammyjs/menu'
import { type Conversation, type ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { addReplyParam } from "@roziscoding/grammy-autoquote";
import * as enso from "./api/enso";
import { ethers } from "ethers";

const bot = new Bot<MyContext>('6471643694:AAFiGlShs8NMTc6pH21u9ahdWIkXDm9RrVk')
type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData>
type MyConversation = Conversation<MyContext>;

interface SessionData {
    routes: Route[]
}

interface Route {
    routeFrom: string,
    amountFrom: string,
    routeTo: string
}

bot.use(session({ initial }))
bot.use(conversations());


async function route(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("📝 OPTIONS: \n single: route from 1 token to 1 token \n batch: route from 1 token to N", {
        reply_markup: { force_reply: true },
    });
    // Ask user for input on token in and token out
    const type = await conversation.wait();
    await ctx.reply("Token to route from?", {
        reply_markup: { force_reply: true },
    })
    const tokenIn = await conversation.wait();
    await ctx.reply("Amount token from?", {
        reply_markup: { force_reply: true },
    });
    const amountIn = await conversation.wait();
    // Single token route
    if(type.message?.text === "single"){
        await ctx.reply("Token to route to?",{
            reply_markup: { force_reply: true },
        });
        const tokenOut = await conversation.wait();
        // Make api call to enso, abstractions inside of ./api/enso.ts
        const response = await conversation.external(() => enso.getRoute(tokenIn.message?.text, tokenOut.message?.text, Number(amountIn.message?.text)));
        // Reply to user with api response
        await ctx.reply(
            "Token in: " + tokenIn.message?.text + "\n Amount in: "+ amountIn.message?.text + "\n Token out: " + tokenOut.message?.text + " \n Amount out:" + response.amountOut);
    } else if(type.message?.text === "batch"){
        await ctx.reply("Tokens to route to? (separate by comma)", {
            reply_markup: { force_reply: true },
        });
        const tokenOut = await conversation.wait();
        const response = await conversation.external(() => enso.getRouteBundle(tokenIn.message?.text, tokenOut.message?.text.split(","), Number(amountIn.message?.text)));
    } else {   
        await ctx.reply("not an option");
    }
    await ctx.reply("Execute? yes OR no", {
        reply_markup: { force_reply: true },
    });
    const execute = await conversation.wait();
    if (await execute.message?.text === "yes" || await execute.message?.text === "y" || await execute.message?.text === "Yes" || await execute.message?.text === "Y") {
        await ctx.reply("executed");
    } else {
        await ctx.reply("cancelled");
    }
}

async function projects(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("📝 OPTIONS: \n list: list all projects available through enso \n pools: list all pools for a project with APY \n apy: list for 1 pool", {
        reply_markup: { force_reply: true },
    });
    const type = await conversation.wait();
    if(type.message?.text === "list"){
        const response = await enso.getProjects()
        await ctx.reply(response.join("\n"))
    } else if(type.message?.text === "pools"){
        await ctx.reply("Enter project name:", {
            reply_markup: { force_reply: true },
        })
        const project = await conversation.wait();
        const projectPools = await enso.getPools(project.message?.text)
        // console.log(projectPools)
        // await ctx.reply(projectPools.length.toString())
        await ctx.reply(projectPools.join("\n"))
    } else if(type.message?.text === "apy"){
        await ctx.reply("Enter pool address:", {
            reply_markup: { force_reply: true },
        })
        const poolAddress = await conversation.wait();
        await ctx.reply(await enso.getPoolApy(poolAddress.message?.text))
    } else {
        await ctx.reply("not an option, try: list, pools, apy");
    }
}

async function dontlookatthisfunction(conversation: MyConversation, ctx: MyContext) {
    // Don't look at this code, it's not for you
    await ctx.reply("📝 OPTIONS: \n beer \n sticker \n hack", {
        reply_markup: { force_reply: true },
    });
    // Wait what you're still looking?
    const type = await conversation.wait();
    // Ok fine, you can look at this code, but don't tell anyone
    if(type.message?.text === "beer"){
        await ctx.reply("nice, you can get a beer - let us know");
    } else if(type.message?.text === "sticker"){
        await ctx.reply("nice, you can get a sticker - let us know");
    } else if(type.message?.text === "hack"){
        await ctx.reply("if you want to use enso api in the hackathon, you can let us know and we will support you!");
    } else if(type.message?.text === "enso"){
        await ctx.reply("nice you can get a beer and sticker!!!");
    } else if(type.message?.text === "3301"){
        // Since you're still reading... here's a secret
        await ctx.reply("decode this: zeyd ekh udie qfy whekf(xjjfi://j.cu/udie_qfy)");
        // Do you remember the initial clues? Beer, Hack, Enso, 3301, and Caesar?
    }
    else {
        await ctx.reply("ahhh that's no fun, try again");
    }
}

bot.use(createConversation(route));
bot.use(createConversation(projects));
bot.use(createConversation(dontlookatthisfunction));

bot.command("route", async (ctx) => {
    await ctx.conversation.enter("route");
});

bot.command("projects", async (ctx) => {
    await ctx.conversation.enter("projects");
});

bot.command("easteregg", async (ctx) => {
    await ctx.conversation.enter("youwerentmeanttofindthis");
});


bot.command("help", async (ctx) => {
    await ctx.reply("Enso here to help you 🚀 \n\n /start : lists all resources and welcome message \n /projects : command to query information about projects including, protocol list, pool list and apy \n /route : execute swaps, deposits, farming and so forth");
});

bot.command("start", async (ctx) => { 
    await ctx.reply("Welcome to the ETHWarsaw Enso Workshop 🚀, we're happy you're here☺️ \n\n ------Resources------\n  Github: \n API Docs: https://docs.enso.finance/ \n Swagger: https://api.enso.finance/api#/ \n Examples Repo: https://github.com/EnsoFinance/shortcuts-api-examples \n\n ------Assistance------ \n Telegram support: https://t.me/+JcHXYLOMDUo4NWQ0 \n In person: just call us over we don't bite🤓");

    /*
        TODO:
            - Initialize wallet
            - Initialize tenderly fork
    */
});

bot.start();

function initial(): SessionData {
    console.log('initial')
    return { routes: [] };
}