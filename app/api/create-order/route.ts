import { NextRequest, NextResponse } from "next/server";
import arcjet, { tokenBucket } from "@arcjet/next";
import Razorpay from "razorpay";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip"], // Track requests based on the client's IP address
  rules: [
    tokenBucket({
      mode: "LIVE", // Will block requests. Use "DRY_RUN" to log only
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket maximum capacity of 10 tokens
    }),
  ],
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for");
  if (!ipAddress) {
    return NextResponse.json(
      { error: "Unable to detect IP address" },
      { status: 400 }
    );
  }
  const decision = await aj.protect(request, { ip: ipAddress, requested: 5 }); // Deduct 5 tokens from the bucket
  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Too Many Requests", reason: decision.reason },
      { status: 429 }
    );
  }

  console.log("Arcjet decision", decision);
  try {
    const { amount } = await request.json();
    // Use the provided amount or fallback to 1
    const orderAmount = (Number(amount) || 1) * 100;

    const order = await razorpay.orders.create({
      amount: orderAmount,
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });
    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error(`Error Creating Order : ${error}`);
    return NextResponse.json(
      { error: "Error Creating Order" },
      { status: 500 }
    );
  }
}
