import { Hono } from 'hono'
import { cors } from 'hono/cors'

import dgnoteUpdate from './routes/dgnoteUpdate';

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors())

app.route("/dgnote-update", dgnoteUpdate)

export default app;
