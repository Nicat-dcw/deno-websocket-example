import { serve } from "https://deno.land/std/http/server.ts";
import { acceptWebSocket, acceptable, WebSocket } from "https://deno.land/std/ws/mod.ts";

const server = serve({ port: 8000 });
console.log("Listening on 0.0.0.0:8000");

for await (const req of server) {
  if (req.method === "GET" && req.url === "/") {
    const headers = new Headers();
    headers.set("Content-Type", "text/html");
    req.respond({
      status: 200,
      headers,
      body: `
        <html>
          <body>
            <h1>Websocket Server</h1>
            <script>
              var socket = new WebSocket("ws://localhost:8000/ws");
              socket.addEventListener("open", (event) => {
                socket.send("Hello Server!");
              });
              socket.addEventListener("message", (event) => {
                console.log("Message from server: ", event.data);
              });
            </script>
          </body>
        </html>
      `,
    });
  } else if (req.method === "GET" && req.url === "/ws") {
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      })
        .then(async (socket: WebSocket) => {
          console.log("WebSocket connection established");
          for await (const message of socket) {
            console.log("Received: ", message);
            socket.send("Hello Client!");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}
