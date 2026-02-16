import { Hono } from 'hono'

const app = new Hono<{ Bindings: Env }>();

app.get("/test", async (c) => {
  return c.text("Hello World!");
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