We provide components to make uploading easier. We highly recommend re-exporting them with the types assigned, but you CAN import the components individually from @uploadthing/react instead.

src/utils/uploadthing.ts
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

Copy
Copied!
Add UploadThing's Styles
Tailwind v3
Tailwind v4
Not Tailwind
If you're using Tailwind v4 with CSS configuration, you can use our plugin like this:

@import "tailwindcss";
@import "uploadthing/tw/v4";
@source "../node_modules/@uploadthing/react/dist"; /** <-- depends on your project structure */

Copy
Copied!
You can learn more about our Tailwind helper in the "Theming" page

Mount A Button And Upload!
Don't forget to add the "use client"; directive at the top of your file, since the UploadButton component needs to run on the client-side.

app/example-uploader/page.tsx
"use client";
import { UploadButton } from "~/utils/uploadthing";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </main>
  );
}
