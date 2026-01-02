import { Hono } from 'hono'
import { VersionInfo } from '../types/version'

const app = new Hono<{ Bindings: Env }>();

// 获取最新版本号
app.get("/", async (c) => {
  const code = await c.env.KV.get("latest");
  if (!code) {
    c.status(400);
    return c.json({ "message": "Error: latest version code not found." });
  }
  return c.json(Number(code));
})

// 获取最新版本详细信息
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

// 根据版本号获取版本详细信息
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

// 新建KV中的键值对
app.post("/kv", async (c) => {
  const { key, value, type } = await c.req.json();
  
  if (!key) {
    c.status(400);
    return c.json({ "message": "Error: key is required." });
  }
  
  try {
    if (type === 'json') {
      await c.env.KV.put(key, JSON.stringify(value));
    } else {
      await c.env.KV.put(key, value);
    }
    return c.json({ "message": "Key-value pair saved successfully." });
  } catch (e) {
    c.status(500);
    return c.json({ "message": `Error saving key-value pair: ${e instanceof Error ? e.message : 'Unknown error'}` });
  }
})

// 更新KV中的值
app.put("/kv/:key", async (c) => {
  const key = c.req.param("key");
  const { value, type } = await c.req.json();
  
  if (!key) {
    c.status(400);
    return c.json({ "message": "Error: key is required." });
  }
  
  try {
    // 检查键是否存在
    const existingValue = await c.env.KV.get(key);
    if (!existingValue) {
      c.status(404);
      return c.json({ "message": "Error: key does not exist." });
    }
    
    if (type === 'json') {
      await c.env.KV.put(key, JSON.stringify(value));
    } else {
      await c.env.KV.put(key, value);
    }
    return c.json({ "message": "Key-value pair updated successfully." });
  } catch (e) {
    c.status(500);
    return c.json({ "message": `Error updating key-value pair: ${e instanceof Error ? e.message : 'Unknown error'}` });
  }
})

// 删除KV中的键值对
app.delete("/kv/:key", async (c) => {
  const key = c.req.param("key");
  
  if (!key) {
    c.status(400);
    return c.json({ "message": "Error: key is required." });
    }
    
    try {
      // 检查键是否存在
      const existingValue = await c.env.KV.get(key);
      if (!existingValue) {
        c.status(404);
        return c.json({ "message": "Error: key does not exist." });
      }
      
      await c.env.KV.delete(key);
      return c.json({ "message": "Key deleted successfully." });
    } catch (e) {
      c.status(500);
      return c.json({ "message": `Error deleting key: ${e instanceof Error ? e.message : 'Unknown error'}` });
    }
})

export default app;