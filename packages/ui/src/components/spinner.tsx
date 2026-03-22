import { cn } from "@workspace/ui/lib/utils";
import { CircleNotchIcon } from "@phosphor-icons/react/dist/icons/CircleNotch";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <CircleNotchIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
