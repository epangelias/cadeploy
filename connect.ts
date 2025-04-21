#!/usr/bin/env -S deno -A

const conn = await Deno.connect({ path: "/tmp/deno.sock", transport: "unix" });

conn.write(new TextEncoder().encode("Hello"));
