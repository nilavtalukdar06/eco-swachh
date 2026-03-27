import { serve } from "inngest/next";
import { inngest } from "../../../jobs/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
