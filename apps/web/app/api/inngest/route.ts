import { serve } from "inngest/next";
import { inngest } from "../../../jobs/client";
import { processReport } from "../../../jobs/process-report";
import { mintEcoTokens } from "@/jobs/mint-tokens";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processReport, mintEcoTokens],
});
