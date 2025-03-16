"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import Script from "next/script";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
      amount: 100,
    },
  });

  const { watch, getValues } = form;
  const isFormValid = watch("name") && watch("email") && watch("message");

  const handlePayment = async () => {
    setIsProcessing(true);
    const amount = Number(getValues("amount")) || 1; 

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // amount in paise
        currency: "INR",
        name: "Eco Swachh",
        description:
          "Donation for supporting us to create a healthy environment",
        order_id: data.orderId,
        handler: function (response: any) {
          console.log("Payment Successful", response);
          // Submit the form programmatically after payment success.
          if (formRef.current) {
            formRef.current.submit();
          }
        },
        theme: {
          color: "#3399c",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment Failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  function onSubmit(values: any) {
    console.log(values);
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8 rounded-lg shadow-lg bg-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Donate Us</h2>
        <p className="text-muted-foreground">
          Please fill in your details to proceed with the payment.
        </p>
      </div>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          action="https://api.web3forms.com/submit"
          method="POST"
        >
          {/* Ensure the hidden value is defined */}
          <input
            type="hidden"
            name="access_key"
            value={process.env.NEXT_PUBLIC_CONTACT_FORM || ""}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>
                    Name
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error.message}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              rules={{ required: "Email is required" }}
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>
                    Email
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error.message}</p>
                  )}
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="message"
            rules={{ required: "Message is required" }}
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>
                  Message
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your message"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error.message}</p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (INR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing || !isFormValid}
            className="w-full md:w-auto"
          >
            Pay ₹{watch("amount")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
