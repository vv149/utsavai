import type { Metadata } from "next";
import { BRAND, SITE_URL } from "@/lib/site";
import { SEO_COPY } from "./copy";

/** Site-wide metadata defaults for the root layout. */
export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SEO_COPY.title, template: `%s | ${BRAND.name}` },
    description: SEO_COPY.description,
    applicationName: BRAND.name,
    manifest: "/manifest",
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      locale: SEO_COPY.locale,
      title: SEO_COPY.title,
      description: SEO_COPY.description,
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_COPY.title,
      description: SEO_COPY.description,
    },
  };
}

/** Landing page metadata with canonical URL. */
export function homeMetadata(): Metadata {
  return {
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      locale: SEO_COPY.locale,
      title: SEO_COPY.title,
      description: SEO_COPY.description,
      url: "/",
    },
    robots: { index: true, follow: true },
  };
}
