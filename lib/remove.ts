import { CadeployOptions } from "./types.ts";
import { parseSystemdService } from "./utils.ts";

export async function RemoveDeploy(options: CadeployOptions) {
  const serviceName = options.args._[1].toString();
  const service = await parseSystemdService(serviceName);

  await new Deno.Command('systemctl', { args: ["--user", "stop", serviceName], stderr: 'inherit' }).output();
  await new Deno.Command('systemctl', { args: ["--user", "disable", serviceName], stderr: 'inherit' }).output();
  await Deno.remove(service.FragmentPath, { recursive: true });
  await Deno.remove(service.WorkingDirectory, { recursive: true });
}