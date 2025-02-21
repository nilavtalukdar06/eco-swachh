"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PaymentForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
      amount: 100,
    },
  });

  function onSubmit(values: any) {
    console.log(values);
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8 border rounded-lg shadow-lg bg-background">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Donate Us</h2>
        <p className="text-muted-foreground">
          Please fill in your details to proceed with the payment.
        </p>
      </div>
      <Form {...form}>
        <form
          className="space-y-6"
          action="https://api.web3forms.com/submit"
          method="POST"
        >
          {/* Ensure the hidden value is defined */}
          <input
            type="hidden"
            name="access_key"
            value={process.env.NEXT_PUBLIC_CONTACT_FORM}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your message"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
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
          <Button type="submit" className="w-full md:w-auto">
            Pay ₹{form.watch("amount")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
