import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
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
