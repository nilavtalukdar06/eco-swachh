import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EcoSwachh | Waste Management",
    short_name: "EcoSwachh",
    description:
      "A comprehensive waste management and sustainability platform for a cleaner tomorrow.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
