
import { findOpenPort } from "./caddy.ts";
import { CadeployOptions } from "./types.ts";
import { cloneRepo, createService } from "./utils.ts";
import * as Path from "jsr:@std/path";

export async function Deploy(options: CadeployOptions) {
  const url = options.args._[0].toString();
  const projectName = options.args.name || url.match(/([^\/]+)\.git/)?.at(1)!;
  const domain = options.args.domain || `${projectName}.${Deno.hostname()}`;
  const dir = options.args.dir ? Path.resolve(options.args.dir) : Path.resolve(options.homeDir, `apps/${projectName}`);
  const entry = options.args.entry ? Path.resolve(dir, options.args.entry) : Path.resolve(dir, 'main.ts');
  const build = options.args.build === true ? Path.resolve(dir, 'tasks/build.ts') : (options.args.build ? Path.resolve(dir, options.args.build) : undefined);

  const port = await findOpenPort(5000, 6000);

  const execStartPre = [
    'git pull',
    `${Deno.execPath()} -Ar ${options.scriptURL} proxy ${domain}:${port}`
  ];
  if (build) execStartPre.push(build);

  await cloneRepo(url, dir);

  await Deno.readFile(entry);

  await createService({
    name: projectName,
    description: projectName,
    environment: [`DOMAIN=${domain}`, `PORT=${port}`],
    execStart: entry,
    workingDirectory: dir,
    execStartPre,
  });
}