#!/usr/bin/env -S deno -A

// const listener = Deno.listen({ path: "/tmp/deno.sock", transport: "unix" });
const listener = Deno.listen({ port: 4321 });

console.log("Listening on http://localhost:4321");

for await (const conn of listener) {
  console.log("new connection");
  console.log(conn);
  const buf = new Uint8Array(1024);
  const n = await conn.read(buf);
  if (n) {
    console.log(new TextDecoder().decode(buf.subarray(0, n)));
  }
  conn.close();
}
