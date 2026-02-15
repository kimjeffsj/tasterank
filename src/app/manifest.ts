import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TasteRank — Record the taste of your travels",
    short_name: "TasteRank",
    description:
      "Rate and rank your travel food experiences together with friends.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f6",
    theme_color: "#ec7f13",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
