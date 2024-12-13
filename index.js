#!/usr/bin/env bun
import { appendFile } from "node:fs/promises";
const config = await Bun.file("config.json").json();

const server = Bun.serve({
    fetch(req, server) {
        if (server.upgrade(req)) {
            return;
        }
        return new Response(Bun.file("client.html"));
    },
    websocket: {
        open(ws) {
            ws.subscribe("log");
        }
    },
    hostname: "0.0.0.0",
    port: process.env.PORT || config.port || 6161
});

for await (const chunk of Bun.stdin.stream()) {
    await appendFile("log.bak", chunk);
    Bun.stdout.writer().write(chunk);
    server.publish("log", chunk);
}