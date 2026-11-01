import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SkipLink } from "@/components/skip-link";
import { PauseAnimations } from "@/components/pause-animations";
import { rootMetadata } from "@/lib/seo/metadata";
import { BRAND, BRAND_COLORS, SITE_URL } from "@/lib/site";
import { buildLandingJsonLd, serializeJsonLd } from "@/lib/seo/json-ld";
import { SEO_COPY, FEATURES } from "@/lib/seo/copy";
import { FAQ } from "@/lib/seo/faq";

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  themeColor: BRAND_COLORS.primary,
  width: "device-width",
  initialScale: 1,
};

const jsonLd = buildLandingJsonLd({
  siteUrl: SITE_URL,
  name: BRAND.name,
  description: SEO_COPY.description,
  language: SEO_COPY.language,
  features: [...FEATURES],
  faq: [...FAQ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </head>
      <body>
        <SkipLink />
        <PauseAnimations />
        {children}
      </body>
    </html>
  );
}
