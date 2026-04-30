import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: "SafePredict Dashboard",
  description: "Predictive workplace safety for manufacturing operations.",
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
