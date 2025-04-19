import { Route } from "./types.ts";


export async function getCaddyRoutes() {
  const res = await fetch('http://localhost:2019/config/apps/http/servers/srv0/routes')
  if (!res.ok) throw await res.text()
  return await res.json() as Route[]
}

export async function setCaddyRoutes(routes: Route[]) {
  const body = JSON.stringify(routes)
  const res = await fetch('http://localhost:2019/config/apps/http/servers/srv0/routes', {
    method: 'POST',
    body,
    headers: {
      "content-type": "application/json"
    }
  })
  if (!res.ok) throw await res.text()
  return res.json()
}

export async function reverseProxy(host: string, port: number) {
  const routes = await getCaddyRoutes();

  const route = {
    handle: [
      {
        handler: 'reverse_proxy',
        upstreams: [{ dial: `localhost:${port}` }],
      },
    ],
    match: [{ host: [host] }],
    terminal: true,
  } as Route;

  const existingRouteIndex = routes.findIndex(
    (route) => route.match?.some((matcher) => matcher.host.includes(host))
  );

  if (existingRouteIndex !== -1) routes[existingRouteIndex] = route;
  else routes.push(route);

  await setCaddyRoutes(routes);
}

export async function findOpenPort(startPort: number, endPort: number) {
  const routes = await getCaddyRoutes()
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
      return port
    } catch {
      continue
    }
  }
  throw 'No open ports found in range';
}