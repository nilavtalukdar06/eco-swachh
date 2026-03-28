import { inngest } from "./client";
import { prisma } from "@workspace/db";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { SPAM_CHECK_PROMPT } from "@/features/report/prompts/spam-check";
import { ANALYZE_WASTE_PROMPT } from "@/features/report/prompts/analyze-waste";

export const processReport: any = inngest.createFunction(
  { id: "process-report", triggers: [{ event: "report/submitted" }] },
  async ({ event, step }) => {
    const { reportId, imageUrl, userDescription, userId } = event.data as {
      reportId: string;
      imageUrl: string;
      userDescription: string;
      userId: string;
    };

    const spamResult = await step.run("spam-check", async () => {
      const { object } = await generateObject({
        model: openai("gpt-5-mini"),
        system: SPAM_CHECK_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `User description: "${userDescription}"`,
              },
              {
                type: "image",
                image: imageUrl,
              },
            ],
          },
        ],
        schema: z.object({
          isSpam: z.boolean(),
          reason: z.string(),
        }),
      });
      return object;
    });

    if (spamResult.isSpam) {
      await step.run("mark-as-spam", async () => {
        await prisma.report.update({
          where: { id: reportId },
          data: { status: "SPAM" },
        });

        await prisma.spamReport.create({
          data: {
            spamReason: spamResult.reason,
            reportId: reportId,
            userId: userId,
          },
        });
      });

      return { status: "spam", reason: spamResult.reason };
    }

    const analysisResult = await step.run("analyze-waste", async () => {
      const { object } = await generateObject({
        model: openai("gpt-5-mini"),
        system: ANALYZE_WASTE_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this waste image. The user described it as: "${userDescription}"`,
              },
              {
                type: "image",
                image: imageUrl,
              },
            ],
          },
        ],
        schema: z.object({
          aiTitle: z.string(),
          aiDescription: z.string(),
          wasteType: z.string(),
          wasteDetails: z.string(),
          estimatedWeight: z.number(),
          disposalInstructions: z.string(),
          warnings: z.string(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
        }),
      });
      return object;
    });

    await step.run("update-report", async () => {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          aiTitle: analysisResult.aiTitle,
          aiDescription: analysisResult.aiDescription,
          wasteType: analysisResult.wasteType,
          wasteDetails: analysisResult.wasteDetails,
          estimatedWeight: analysisResult.estimatedWeight,
          disposalInstructions: analysisResult.disposalInstructions,
          warnings: analysisResult.warnings,
          priority: analysisResult.priority,
          status: "PENDING",
        },
      });
    });

    return { status: "processed", reportId };
  },
);
