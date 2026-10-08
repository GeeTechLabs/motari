import { handle as nodeHandle } from "@hono/node-server/vercel";
import { handle as edgeHandle } from "hono/vercel";
import app from "./boot";

const nodeHandler = nodeHandle(app);
const edgeHandler = edgeHandle(app);

export default async function handler(req: any, res?: any) {
  // If invoked by Node.js Serverless runtime (req is IncomingMessage, res is ServerResponse)
  if (res && typeof res.setHeader === "function") {
    // When Vercel rewrites /api/(.*) -> /api, it stores the original request path in x-matched-path
    if (req.headers && req.headers["x-matched-path"]) {
      req.url = req.headers["x-matched-path"] as string;
    }
    return nodeHandler(req, res);
  }

  // If invoked by Edge / Fetch runtime (req is standard Request)
  let request = req as Request;
  const matchedPath = request.headers.get("x-matched-path");
  if (matchedPath) {
    const url = new URL(request.url);
    url.pathname = matchedPath;
    request = new Request(url.toString(), request);
  }
  return edgeHandler(request);
}
