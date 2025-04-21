import * as Color from "jsr:@std/fmt/colors";

export function Help() {
  helpCLI({
    name: "cadeploy",
    description: "One step deployments",
    usage: `cadeploy <git-url> [options]
\tcadeploy proxy <host:port>
\tcadeploy rm <service>
\tcadeploy list`,
    options: [
      { flag: "--help", usage: "Show this help message" },
      { flag: "--entry", usage: "Path to the entry file" },
      { flag: "--build", usage: "Path to build task" },
      {
        flag: "--dir",
        usage: "Directory to deploy (default ~/apps/<project-name>)",
      },
      { flag: "--domain", usage: "Domain name for the service" },
      { flag: "--name", usage: "Name of the service" },
      { flag: "--port", usage: "Port to expose the service" },
      { flag: "--rm", usage: "Remove the service" },
    ],
  });
}

export function helpCLI(options: {
  name: string;
  description?: string;
  usage?: string;
  options?: {
    flag: string;
    usage?: string;
  }[];
}) {
  const helpMessage = `
${Color.magenta(options.name)}${
    options.description ? `: ${options.description}` : ""
  }

${options.usage ? Color.red("Usage:\t") + options.usage : ""}

${
    options.options
      ? Color.red("Options:\n") +
        options.options.map((opt) => `  ${opt.flag}\t${opt.usage || ""}`).join(
          "\n",
        )
      : ""
  }
`;

  console.log(helpMessage);
}
