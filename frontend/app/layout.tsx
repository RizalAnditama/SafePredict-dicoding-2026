import type { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

const baseMetadata: Metadata = {
  title: "SafePredict Dashboard",
  description: "Predictive workplace safety for manufacturing operations.",
};

export const metadata: Metadata = {
  ...baseMetadata,
  other: {
    "dicoding:email": "anditamarizal@gmail.com",
  },
};



export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
