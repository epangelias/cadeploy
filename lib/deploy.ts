import { findOpenPort } from "./caddy.ts";
import { CadeployOptions } from "./types.ts";
import { cloneRepo, createService } from "./utils.ts";
import * as Path from "jsr:@std/path";

export async function Deploy(options: CadeployOptions) {
  console.log({ options })
  const url = options.args._[0].toString();
  const projectName = url.match(/([^\/]+)\.git/)?.at(1)! || options.args.name;
  const domain = options.args.domain;
  const dir = options.args.dir
    ? Path.resolve(options.args.dir)
    : Path.resolve(options.homeDir, `apps/${projectName}`);
  const entry = options.args.entry
    ? Path.resolve(dir, options.args.entry)
    : Path.resolve(dir, "main.ts");
  const build = options.args.build === true
    ? Path.resolve(dir, "tasks/build.ts")
    : (options.args.build ? Path.resolve(dir, options.args.build) : undefined);

  const environments = [];

  const execStartPre = ["git pull"];
  if (build) execStartPre.push(build);

  if (domain) {
    const port = await findOpenPort(5000, 6000);
    environments.push(`DOMAIN=${domain}`);
    environments.push(`PORT=${port}`);
    execStartPre.push(`${Deno.execPath()} -Ar ${options.scriptURL} proxy ${domain}:${port}`);
  }

  await cloneRepo(url, dir);

  await Deno.readFile(entry);

  await createService({
    name: projectName,
    description: projectName,
    environment: environments,
    execStart: entry,
    workingDirectory: dir,
    execStartPre,
  });
}
