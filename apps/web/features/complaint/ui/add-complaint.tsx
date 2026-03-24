"use client";

import { useTRPC } from "@/dal/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Spinner } from "@workspace/ui/components/spinner";
import { Textarea } from "@workspace/ui/components/textarea";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(2, "Title is too short").max(50, "Title is too long"),
  description: z
    .string()
    .min(5, "Description is too short")
    .max(200, "Description is too long"),
});

export function AddComplaint() {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const mutation = useMutation(
    trpc.complaints.create.mutationOptions({
      onSuccess: () => {
        toast.success("Complaint Added Successfully");
        form.reset();
        setIsOpen(false);
      },
      onError: (ctx) => {
        toast.error(ctx.message ?? "Failed to submit complaint");
      },
    }),
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate({ ...values });
  }

  return (
    <Dialog open={isOpen || mutation.isPending} onOpenChange={setIsOpen}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="complaint-form">
        <DialogTrigger asChild>
          <Button className="font-normal">Add Complaint</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New complaint submission</DialogTitle>
            <DialogDescription>
              Please provide accurate details about your concern so it can be
              reviewed by the appropriate authority.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Complaint Title</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="Enter the title"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">
                    Complaint Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="description"
                    placeholder="Describe your issue here"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild disabled={mutation.isPending}>
              <Button
                variant="outline"
                onClick={() => form.reset()}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="complaint-form"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Spinner />}
              {mutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
