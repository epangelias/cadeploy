import { CadeployOptions } from "./types.ts";
import { parseSystemdService } from "./utils.ts";
import * as Color from 'jsr:@std/fmt/colors';

export async function ListDeployments(options: CadeployOptions) {
  const entries = Deno.readDir(`${options.homeDir}/.config/systemd/user`)

  for await (const entry of entries) {
    try {
      if (!entry.isFile || !entry.name.endsWith('.service')) continue;
      const service = await parseSystemdService(entry.name);
      console.log(`${Color.green(entry.name)}
\t${service.Description}
\t${service.ExecStart}
\t${service.WorkingDirectory}
\t${service.Environment}\n`);
    } catch (_e) { }
  }
}