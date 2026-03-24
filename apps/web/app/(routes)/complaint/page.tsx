import { AddComplaint } from "@/features/complaint/ui/add-complaint";

export default function ComplaintPage() {
  return (
    <div className="w-full p-4">
      <p className="text-lg">Submit a complaint</p>
      <p className="text-xs text-muted-foreground font-light max-w-lg">
        Please describe your concerns in detail so we can forward them to the
        appropriate authority.
      </p>
      <div className="my-2">
        <AddComplaint />
      </div>
    </div>
  );
}
