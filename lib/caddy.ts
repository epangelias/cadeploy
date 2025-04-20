import { CaddyConfig, CadeployOptions, Route } from "./types.ts";


export async function getCaddyRoutes() {
  const res = await fetch('http://localhost:2019/config/')
  if (!res.ok) throw await res.text()
  const config = await res.json() as CaddyConfig;

  if (!config.apps.http.servers.srv0)
    config.apps.http.servers.srv0 = { listen: [":80"], routes: [] };
  if (!config.apps.http.servers.srv0.routes)
    config.apps.http.servers.srv0.routes = [];

  return config;
}

export async function setCaddyConfig(config: CaddyConfig) {
  console.log(config.apps.http.servers.srv0);
  const body = JSON.stringify(config);
  console.log({ body });
  const res = await fetch('http://localhost:2019/load', {
    method: 'POST',
    body,
    headers: { "Content-Type": "application/json" }
  })
  console.log(res);
  if (!res.ok) throw await res.text()
  console.log(await res.text());
}

export async function ReverseProxy(options: CadeployOptions) {
  const [host, port] = options.args._[1].toString().split(':');

  const config = await getCaddyRoutes();

  const route = {
    handle: [
      {
        handler: "reverse_proxy",
        upstreams: [{ "dial": `localhost:${port}` }]
      },
    ],
    match: [{ host: [host] }],
    terminal: true,
  } as Route;

  console.log('new route', route);

  const routes = config.apps.http.servers.srv0.routes;

  const existingRouteIndex = routes.findIndex(
    (route) => route.match?.some((matcher) => matcher.host.includes(host))
  );

  if (existingRouteIndex !== -1) routes[existingRouteIndex] = route;
  else routes.push(route);

  await setCaddyConfig(config);
}

export async function findOpenPort(startPort: number, endPort: number) {
  const config = await getCaddyRoutes()
  const routes = config.apps.http.servers.srv0.routes

  const usedPorts = new Set<number>();
  for (const route of routes) {
    for (const handler of route.handle) {
      if (handler.upstreams) {
        for (const upstream of handler.upstreams) {
          const match = upstream.dial.match(/:(\d+)$/)
          if (match) usedPorts.add(parseInt(match[1]))
        }
      }
    }
  }
  for (let port = startPort; port < endPort; port++) {
    if (usedPorts.has(port)) continue
    try {
      const listener = Deno.listen({ port })
      listener.close()
      console.log("fount port ", port);
      return port
    } catch {
      continue
    }
  }
  throw 'No open ports found in range';
}