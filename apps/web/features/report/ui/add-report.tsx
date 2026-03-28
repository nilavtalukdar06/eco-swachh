"use client";

import { useTRPC } from "@/dal/client";
import { upload } from "@imagekit/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Image from "next/image";
import { MapPin, Check, X, Image as ImageIcon } from "@phosphor-icons/react";
import * as z from "zod";

const formSchema = z.object({
  userDescription: z
    .string()
    .min(3, "Description is too short")
    .max(500, "Description is too long"),
  manualLocation: z.string().optional(),
});

const authenticator = async () => {
  const response = await fetch("/api/upload-auth");
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Auth request failed with status ${response.status}: ${errorText}`,
    );
  }
  const data = await response.json();
  const { signature, expire, token, publicKey, urlEndpoint } = data;
  return { signature, expire, token, publicKey, urlEndpoint };
};

export function AddReport() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userDescription: "",
      manualLocation: "",
    },
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (isOpen && locationStatus === "idle") {
      requestLocation();
    }
  }, [isOpen, locationStatus, requestLocation]);

  const mutation = useMutation(
    trpc.reports.submit.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.reports.getAll.queryKey(),
        });
        toast.success("Report submitted for processing");
        resetForm();
        setIsOpen(false);
      },
      onError: (ctx) => {
        toast.error(ctx.message ?? "Failed to submit report");
      },
    }),
  );

  function resetForm() {
    form.reset();
    setImageUrl(null);
    setIsUploading(false);
    setUploadProgress(0);
    setLatitude(null);
    setLongitude(null);
    setLocationStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log(file);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 4MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { signature, expire, token, publicKey } = await authenticator();
      console.log("uploading...");
      const uploadResponse = await upload({
        file,
        fileName: `waste-report-${Date.now()}.${file.name.split(".").pop()}`,
        signature,
        expire,
        token,
        publicKey,
        folder: "/waste-reports",
        onProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      console.log(uploadResponse);
      if (uploadResponse?.url) {
        setImageUrl(uploadResponse.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload did not return a URL");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!imageUrl) {
      toast.error("Please upload an image first");
      return;
    }

    if (locationStatus === "denied" && !values.manualLocation?.trim()) {
      toast.error("Please enter a location");
      return;
    }

    mutation.mutate({
      imageUrl,
      userDescription: values.userDescription,
      latitude,
      longitude,
      manualLocation: values.manualLocation?.trim() || null,
    });
  }

  return (
    <Dialog
      open={isOpen || mutation.isPending}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="font-normal">Submit Report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>New waste report</DialogTitle>
            <DialogDescription>
              Upload an image of the waste and provide a brief description. Our
              AI will analyze it and generate a detailed report.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <Field>
              <FieldLabel>Waste Image</FieldLabel>
              {imageUrl ? (
                <div className="relative w-full h-48 rounded-none overflow-hidden border">
                  <Image
                    src={imageUrl}
                    alt="Uploaded waste"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                    onClick={() => {
                      setImageUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X weight="bold" />
                  </Button>
                </div>
              ) : (
                <div
                  className="relative w-full border-2 border-dashed p-6 transition-colors hover:border-primary/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <div className="flex flex-col items-center gap-2 text-center">
                    {isUploading ? (
                      <>
                        <Spinner />
                        <p className="text-sm text-muted-foreground">
                          Uploading... {uploadProgress}%
                        </p>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-full bg-muted p-3">
                          <ImageIcon
                            weight="duotone"
                            className="w-6 h-6 text-muted-foreground"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Click to upload image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP up to 4MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Field>
            <Controller
              name="userDescription"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="userDescription">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="userDescription"
                    aria-invalid={fieldState.invalid}
                    placeholder="Briefly describe the waste you found..."
                    rows={3}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <FieldLabel>Location</FieldLabel>
              {locationStatus === "requesting" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border">
                  <Spinner />
                  <span>Requesting location access...</span>
                </div>
              )}
              {locationStatus === "granted" && latitude && longitude && (
                <div className="flex items-center gap-2 text-sm p-2 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                  <Check weight="bold" />
                  <MapPin weight="fill" />
                  <span>
                    Location captured ({latitude.toFixed(4)},{" "}
                    {longitude.toFixed(4)})
                  </span>
                </div>
              )}
              {locationStatus === "denied" && (
                <Controller
                  name="manualLocation"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">
                        Location access was denied. Please enter the location
                        manually.
                      </p>
                      <Input
                        {...field}
                        placeholder="e.g., Near Main Street Park, Block 5"
                      />
                    </div>
                  )}
                />
              )}
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose asChild disabled={mutation.isPending || isUploading}>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={mutation.isPending || isUploading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={mutation.isPending || !imageUrl || isUploading}
            >
              {mutation.isPending && <Spinner />}
              {mutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
