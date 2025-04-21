#!/usr/bin/env -S deno -A

import { parseArgs } from "jsr:@std/cli";
import { CadeployArgs, CadeployOptions } from "./lib/types.ts";
import { Deploy } from "./lib/deploy.ts";
import { isURL } from "./lib/utils.ts";
import { ReverseProxy } from "./lib/caddy.ts";
import { RemoveDeploy } from "./lib/remove.ts";
import { Help } from "./lib/help.ts";
import { ListDeployments } from "./lib/list.ts";

const args = parseArgs<CadeployArgs>(Deno.args);

const homeDir = Deno.env.get("HOME")!;

const scriptURL = import.meta.url;
const task = args._[0];

const options: CadeployOptions = { homeDir, args, scriptURL };

if (task == "proxy") await ReverseProxy(options);
else if (task == "rm") await RemoveDeploy(options);
else if (task == "list") await ListDeployments(options);
else if (isURL(task)) await Deploy(options);
else Help();
