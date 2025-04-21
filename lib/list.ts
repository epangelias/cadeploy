import { CadeployOptions } from "./types.ts";
import { parseSystemdService } from "./utils.ts";
import * as Color from "jsr:@std/fmt/colors";

export async function ListDeployments(options: CadeployOptions) {
  const entries = Deno.readDir(`${options.homeDir}/.config/systemd/user`);

  for await (const entry of entries) {
    console.log();
    try {
      if (!entry.isFile || !entry.name.endsWith(".service")) continue;
      const service = await parseSystemdService(entry.name);
      console.log(
        `${Color.green(entry.name.slice(0, -8))} ${Color.gray(service.Description)
        }
\t${service.WorkingDirectory}
\t${service.Environment ? service.Environment.split("\n") + '\n' : ""}`,
      );
    } catch (_e) { }
  }
}
