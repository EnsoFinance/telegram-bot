import dotenv from "dotenv";
import { Bot, Context, session, SessionFlavor } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import * as enso from "./api/enso";
import * as tenderly from "./api/tenderly";

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
  await ctx.reply("Ether amount in?", {
    reply_markup: { force_reply: true },
  });
  const amountIn = await conversation.wait();
  await ctx.reply(
    "📝 OPTIONS: \n single: route from Ether to 1 token \n batch: route from Ether to N tokens",
    {
      reply_markup: { force_reply: true },
    }
  );
  // Ask user for input on amount in and token out
  const type = await conversation.wait();
  // Single token route
  let response;
  if (type.message?.text === "single") {
    await ctx.reply("Token to route to?", {
      reply_markup: { force_reply: true },
    });
    const tokenOut = await conversation.wait();
    let response;
    try {
      response = await conversation.external(() =>
        enso.getRoute(
          tokenOut.message!.text!,
          10n ** 18n * BigInt(amountIn.message?.text!)
        )
      );
      // Reply to user with api response
      await ctx.reply(`- Ether amount in: ${amountIn.message?.text}
- Token out: ${tokenOut.message?.text}
- Raw amount out: ${response.amountOut}`);
    } catch (e) {
      await ctx.reply(`Route failed for:
- Ether amount in: ${amountIn.message?.text}
- Token out: ${tokenOut.message?.text}

Please try /route command again`);
      return;
    }
  } else if (type.message?.text === "batch") {
    await ctx.reply("Tokens to route to? (separate by comma)", {
      reply_markup: { force_reply: true },
    });
    const tokensOut = await conversation.wait();
    const tokensOutArray = tokensOut
      .message!.text!.replace(/ /g, "")
      .split(",");
    const tokensOutArrayPrettyString = tokensOutArray
      .map((out) => `\n\t\t-> ${out}`)
      .join("");
    try {
      response = await conversation.external(() =>
        enso.getRouteBundle(
          tokensOutArray,
          10n ** 18n * BigInt(amountIn.message?.text!)
        )
      );
      // Reply to user with api response
      await ctx.reply(`- Ether amount in: ${amountIn.message?.text}
- Tokens out: ${tokensOutArrayPrettyString}
- Route: ${JSON.stringify(response.bundle, null, 2)}`);
    } catch (e) {
      await ctx.reply(`Route failed for:
- Ether amount in: ${amountIn.message?.text}
- Tokens out: ${tokensOutArrayPrettyString}

Please try /route command again`);
      return;
    }
  } else {
    await ctx.reply("not an option");
    return;
  }
  await ctx.reply("Execute? yes OR no", {
    reply_markup: { force_reply: true },
  });
  const execute = await conversation.wait();
  if (["yes", "y", "Yes", "Y", "YES"].includes(execute.message!.text!)) {
    const tenderlyUrl = await tenderly.simulate(
      1,
      response.tx.from,
      response.tx.to,
      response.tx.data,
      response.tx.value
    );
    await ctx.reply(`executed: ${tenderlyUrl}`);
  } else {
    await ctx.reply("cancelled");
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
    // console.log(projectPools)
    // await ctx.reply(projectPools.length.toString())
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
    "Welcome to the ETHWarsaw Enso Workshop 🚀, we're happy you're here☺️ \n\n ------Resources------\n  Github: \n API Docs: https://docs.enso.finance/ \n Swagger: https://api.enso.finance/api#/ \n Examples Repo: https://github.com/EnsoFinance/shortcuts-api-examples \n\n ------Assistance------ \n Telegram support: https://t.me/+JcHXYLOMDUo4NWQ0 \n In person: just call us over we don't bite🤓"
  );
});

bot.start();
console.log("Bot is running...");
