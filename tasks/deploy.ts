#!/usr/bin/env -S deno -A

import { parseArgs } from "@std/cli";
import * as Path from "@std/path";
import { cloneRepo, createService } from "../lib/utils.ts";
import { findOpenPort, getCaddyRoutes } from "../lib/caddy.ts";

const args = parseArgs<{ entry?: string, build?: string | boolean, dir?: string, domain?: string }>(Deno.args);

const homeDir = Deno.env.get('HOME')!;
const url = args._[0]?.toString();
let projectName = url.match(/([^\/]+)\.git/)?.at(1)!;
const domain = args.domain || `${projectName}.${Deno.hostname()}`;
const dir = args.dir || Path.resolve(homeDir, `apps/${projectName}`);
const entryPoint = args.entry || Path.resolve(dir, 'main.ts');
const build = args.build === true ? Path.resolve(dir, 'tasks/build.ts') : args.build;

if (!url) throw "You must provide a url";
if (!projectName) projectName = prompt("Enter project name")!;

async function init() {
  const port = await findOpenPort(5000, 6000);

  await cloneRepo(url, dir);
  await createService({
    name: projectName,
    description: projectName,
    environment: [`DOMAIN=${domain}`, `PORT=${port}`],
    execStart: entryPoint,
    workingDirectory: dir,
    execStartPre: [`${build}`],
  });
}

console.log(await getCaddyRoutes());

await init();