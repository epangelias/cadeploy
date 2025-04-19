import * as Text from "jsr:@std/text";
import * as Path from "jsr:@std/path";


export async function cloneRepo(url: string, dir?: string) {
  const cmd = new Deno.Command('git', { args: ['clone', url, dir!], stderr: 'piped' })
  const output = await cmd.output();
  if (!output.success) throw new TextDecoder().decode(output.stderr);
}


export async function createService(options: {
  name: string,
  description: string,
  execStart: string,
  execStartPre: string[],
  workingDirectory: string,
  environment: string[],
}) {
  // ${ build ? `\nExecStartPre=${Path.resolve(build)}` : '' }
  const environments = options.environment.map(env => `Environment=${env}`).join('\n');
  const execPreStarts = options.execStartPre.map(cmd => `ExecStartPre=${cmd}`).join('\n');

  const service = `[Unit]
Description=${options.description}
After=network.target

[Service]
ExecStart=${options.execStart}
${execPreStarts}WorkingDirectory=${options.workingDirectory}
${environments}Restart=always
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target`;

  const homeDir = Deno.env.get('HOME')!;
  const serviceName = Text.toKebabCase(options.name!);
  const servicePath = Path.resolve(homeDir, `.config/systemd/user/${serviceName}.service`);
  await Deno.mkdir(Path.resolve(homeDir, `.config/systemd/user`), { recursive: true });
  await Deno.writeTextFile(servicePath, service);
  await new Deno.Command('systemctl', { args: "--user daemon-reload".split(' '), stderr: 'inherit' }).output();
  await new Deno.Command('systemctl', { args: ["--user", "enable", serviceName], stderr: 'inherit' }).output();
  await new Deno.Command('systemctl', { args: ["--user", "start", serviceName], stderr: 'inherit' }).output();
}