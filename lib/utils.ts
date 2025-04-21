import * as Text from "jsr:@std/text";
import * as Path from "jsr:@std/path";
import * as Color from "jsr:@std/fmt/colors";

export async function cloneRepo(url: string, dir?: string) {
  const cmd = new Deno.Command("git", {
    args: ["clone", url, dir!],
    stderr: "piped",
  });
  const output = await cmd.output();
  if (!output.success) throw new TextDecoder().decode(output.stderr);
}

export async function createService(options: {
  name: string;
  description: string;
  execStart: string;
  execStartPre: string[];
  workingDirectory: string;
  environment: string[];
}) {
  const environments = options.environment.map((env) => `Environment=${env}`)
    .join("\n");
  const execPreStarts = options.execStartPre.map((cmd) => `ExecStartPre=${cmd}`)
    .join("\n");

  const service = `[Unit]
Description=${options.description}
After=network.target

[Service]
ExecStart=${options.execStart}
${execPreStarts.length ? execPreStarts : ""}
WorkingDirectory=${options.workingDirectory}
${environments.length ? environments : ""}
Restart=always
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target`;

  const homeDir = Deno.env.get("HOME")!;
  const serviceName = Text.toKebabCase(options.name!);
  const servicePath = Path.resolve(
    homeDir,
    `.config/systemd/user/${serviceName}.service`,
  );
  await Deno.mkdir(Path.resolve(homeDir, `.config/systemd/user`), {
    recursive: true,
  });
  await Deno.writeTextFile(servicePath, service);
  await new Deno.Command("systemctl", {
    args: "--user daemon-reload".split(" "),
    stderr: "inherit",
  }).output();
  await new Deno.Command("systemctl", {
    args: ["--user", "enable", serviceName],
    stderr: "inherit",
  }).output();
  await new Deno.Command("systemctl", {
    args: ["--user", "start", serviceName],
    stderr: "inherit",
  }).output();
}

export function isURL(url: unknown) {
  try {
    new URL(url as string);
    return true;
  } catch (_e) {
    return false;
  }
}

export async function parseSystemdService(service: string) {
  const output = await new Deno.Command("systemctl", {
    args: ["show", service, "--user", "--no-pager"],
    stdout: "piped",
  }).output();
  const text = new TextDecoder().decode(output.stdout);

  const result: Record<string, string> = {};

  for (const line of text.split("\n")) {
    const [key, ...values] = line.split("=");
    const value = values ? values.join('=') : '';
    if (key && values.length) result[key] = value;
  }

  if (result.LoadError) {
    throw `Service ${service} not loaded: ${result.LoadError}`;
  }

  return result;
}

export async function $(...args: string[]) {
  const cmd = new Deno.Command(args[0], {
    args: args.slice(1),
    stderr: "piped",
    stdout: "piped",
  });

  const output = await cmd.output();

  if (!output.success) {
    const error = new TextDecoder().decode(output.stderr);
    console.error(
      `${args.join(" ")} failed with error: ${error.split("\n").map((l) => "  " + l).join("\n")
      }`,
    );
    return { error, ok: false };
  } else {
    const result = new TextDecoder().decode(output.stdout);
    return { result, ok: true };
  }
}
