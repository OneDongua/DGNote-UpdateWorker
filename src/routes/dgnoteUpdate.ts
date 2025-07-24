import { Hono } from 'hono'
import { VersionInfo } from '../types/version'

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const code = await c.env.KV.get("latest");
  if (!code) {
    c.status(400);
    return c.json({ "message": "Error: latest version code not found." });
  }
  return c.json(Number(code));
})

app.get("/latest", async (c) => {
  const code = await c.env.KV.get("latest");
  if (!code) {
    c.status(400);
    return c.json({ "message": "Error: latest version code not found." });
  }
  const info = await c.env.KV.get(code, "json");
  if (!info) {
    c.status(400);
    return c.json({ "message": "Error: latest version info not found." });
  }
  return c.json(info as VersionInfo);
})

app.get("/:code", async (c) => {
  const code = c.req.param("code");
  if (Number.isNaN(parseInt(code))) {
    c.status(400);
    return c.json({ "message": "Error: invalid version code." });
  }
  const info = await c.env.KV.get(code, "json");
  if (!info) {
    c.status(400);
    return c.json({ "message": "Error: version info not found." });
  }
  return c.json(info as VersionInfo);
})

export default app;