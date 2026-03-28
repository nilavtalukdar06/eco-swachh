import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@workspace/ui/lib/utils";
import { TRPCReactProvider } from "@/dal/client";
import { Toaster } from "@workspace/ui/components/sonner";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EcoSwachh | Management Portal",
  description:
    "Administrative dashboard for monitoring waste reports and community impact.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        jetbrainsMono.variable,
      )}
    >
      <TRPCReactProvider>
        <body>
          <ThemeProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </ThemeProvider>
          <Toaster />
        </body>
      </TRPCReactProvider>
    </html>
  );
}
