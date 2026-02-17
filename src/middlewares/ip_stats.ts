import { MiddlewareHandler } from "hono";
import { Client } from "pg";

export const ipStatsMiddleware: MiddlewareHandler = async (c, next) => {
  const ip =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    "0.0.0.0";

  const client = new Client({
    connectionString: c.env.HYPERDRIVE.connectionString,
  });

  try {
    await client.connect();

    await client.query(
      `
      INSERT INTO ip_visit_stats(ip) VALUES($1)
      ON CONFLICT(ip)
      DO UPDATE SET
        visit_count = ip_visit_stats.visit_count + 1,
        last_visit_at = NOW()
      `,
      [ip]
    );
  } catch (err) {
    console.error("IP统计失败:", err);
  }

  await next();
};

