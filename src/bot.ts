import dotenv from "dotenv";
import { Bot, Context, session, SessionFlavor } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { BigNumber, utils } from "ethers";
import * as enso from "./enso";
import * as safe from "./safe";
import { TENDERLY_FORK_ID } from "./constants";

dotenv.config();
const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) throw "No BOT_TOKEN env var found!";

const bot = new Bot<MyContext>(BOT_TOKEN);
type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData>;
type MyConversation = Conversation<MyContext>;

interface SessionData {
  routes: Route[];
}

interface Route {
  routeFrom: string;
  amountFrom: string;
  routeTo: string;
}

bot.use(session({ initial: (): SessionData => ({ routes: [] }) }));
bot.use(conversations());

async function route(conversation: MyConversation, ctx: MyContext) {
  // ask for amount
  await ctx.reply("💵 Ether amount in?", {
    reply_markup: { force_reply: true },
  });
  let amountIn: string = "";
  let parsedAmountIn: BigNumber = BigNumber.from(0);
  while (!parsedAmountIn.gt(0))
    try {
      amountIn = (await conversation.wait()).message!.text!;
      parsedAmountIn = utils.parseEther(amountIn);
    } catch (e) {
      await ctx.reply(
        `🚨 Invalid Ether amount _${amountIn}_, please respond with a valid amount`,
        { parse_mode: "Markdown" }
      );
    }

  // ask for type
  await ctx.reply(
    "📝 OPTIONS: \n- *single*: route from Ether to 1 token \n- *batch*: route from Ether to N tokens",
    {
      reply_markup: { force_reply: true },
      parse_mode: "Markdown",
    }
  );
  let type;
  while (!type) {
    type = (await conversation.wait()).message?.text!;
    if (!["single", "batch"].includes(type)) {
      await ctx.reply(
        `🚨 Invalid option _${type}_, please respond with "single" or "batch"`,
        { parse_mode: "Markdown" }
      );
      type = undefined;
    }
  }

  let response;
  // single token route
  if (type === "single") {
    await ctx.reply("↪ Token to route to?", {
      reply_markup: { force_reply: true },
    });
    const tokenOut = await conversation.wait();
    await ctx.reply("⏳ Fetching route...");
    try {
      response = await conversation.external(() =>
        enso.getRoute(tokenOut.message!.text!, parsedAmountIn)
      );
      // Reply to user with api response
      await ctx.reply(
        `- Ether amount in: *${amountIn}*
- Token out: *${tokenOut.message?.text}*
- Raw amount out: *${response.amountOut}*`,
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      console.log("ERROR 🚨", e);
      await ctx.reply(
        `🚨 Route failed for:
- Ether amount in: *${amountIn}*
- Token out: *${tokenOut.message?.text}*

Please try /route command again`,
        { parse_mode: "Markdown" }
      );
      return;
    }
  }

  // multi token route
  else {
    await ctx.reply("↪ Tokens to route to? (separate by comma)", {
      reply_markup: { force_reply: true },
    });
    const tokensOut = await conversation.wait();
    const tokensOutArray = tokensOut
      .message!.text!.replace(/ /g, "")
      .split(",");
    const tokensOutArrayPrettyString = tokensOutArray
      .map((out) => `\n\t\t-> <b>${out}</b>`)
      .join("");
    await ctx.reply("⏳ Fetching route...");
    try {
      response = await conversation.external(() =>
        enso.getRouteBundle(tokensOutArray, parsedAmountIn)
      );
      // Reply to user with api response
      await ctx.reply(
        `- Ether amount in: <b>${amountIn}</b>
- Tokens out: ${tokensOutArrayPrettyString}
- Route:
<pre language="json">${JSON.stringify(response.bundle, null, 2)}</pre>`,
        { parse_mode: "HTML" }
      );
    } catch (e) {
      console.log("ERROR 🚨", e);
      await ctx.reply(
        `🚨 Route failed for:
- Ether amount in: <b>${amountIn}</b>
- Tokens out: ${tokensOutArrayPrettyString}

Please try /route command again`,
        { parse_mode: "HTML" }
      );
      return;
    }
  }

  // execute shortcut
  setTimeout(
    async () => await ctx.reply("⏳ Executing on a test network..."),
    1000
  );
  try {
    const { hash, success } = await safe.executeEnsoShortcut(
      response.tx.to,
      response.tx.data,
      response.tx.value
    );
    await ctx.reply(
      `${
        success ? "🎉 Success" : "🚨 Failure"
      }: *${hash}*\n\nTo inspect, search for it here https://dashboard.tenderly.co/shared/fork/${TENDERLY_FORK_ID}/transactions`,
      { parse_mode: "Markdown" }
    );
  } catch (e: any) {
    console.log("ERROR 🚨", e);
    if (e.toString().includes("Not enough Ether funds"))
      await ctx.reply(`🚨 Not enough Ether funds!

Please try /route command again with a lower Ether amount`);
    else
      await ctx.reply(`Execution failed!

Please try /route command again`);
    return;
  }
}

async function projects(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply(
    "📝 OPTIONS: \n list: list all projects available through enso \n pools: list all pools for a project with APY \n apy: list for 1 pool",
    {
      reply_markup: { force_reply: true },
    }
  );
  const type = await conversation.wait();
  if (type.message?.text === "list") {
    const response = await enso.getProjects();
    await ctx.reply(response.join("\n"));
  } else if (type.message?.text === "pools") {
    await ctx.reply("Enter project name:", {
      reply_markup: { force_reply: true },
    });
    const project = await conversation.wait();
    const projectPools = await enso.getPools(project.message!.text!);
    await ctx.reply(projectPools.join("\n"));
  } else if (type.message?.text === "apy") {
    await ctx.reply("Enter pool address:", {
      reply_markup: { force_reply: true },
    });
    const poolAddress = await conversation.wait();
    await ctx.reply(await enso.getPoolApy(poolAddress.message!.text!));
  } else {
    await ctx.reply("not an option, try: list, pools, apy");
  }
}

bot.use(createConversation(route));
bot.use(createConversation(projects));

bot.command("route", async (ctx) => {
  await ctx.conversation.enter("route");
});

bot.command("projects", async (ctx) => {
  await ctx.conversation.enter("projects");
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Enso here to help you 🚀 \n\n /start : lists all resources and welcome message \n /projects : command to query information about projects including, protocol list, pool list and apy \n /route : execute swaps, deposits, farming and so forth"
  );
});

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Welcome to the Enso Workshop 🚀, we're happy you're here☺️ \n\n ------Resources------\n  Github: \n API Docs: https://docs.enso.finance/ \n Swagger: https://api.enso.finance/api#/ \n Examples Repo: https://github.com/EnsoFinance/shortcuts-api-examples \n\n ------Assistance------ \n just call us over we don't bite🤓"
  );
});

bot.start();
console.log("Bot is running...");
