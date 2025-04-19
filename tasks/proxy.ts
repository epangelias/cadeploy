import { reverseProxy } from "../lib/caddy.ts";

const [host, port] = Deno.args[0];

await reverseProxy(host, +port);