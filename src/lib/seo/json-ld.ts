import type { FaqItem } from "./faq";

/** One schema.org node. */
export interface JsonLdNode {
  readonly "@type": string;
  readonly "@id": string;
  readonly [key: string]: unknown;
}

/** A JSON-LD document with every node in one `@graph`. */
export interface JsonLdGraph {
  readonly "@context": "https://schema.org";
  readonly "@graph": readonly JsonLdNode[];
}

/** Input for building the landing page JSON-LD graph. */
export interface LandingJsonLdInput {
  readonly siteUrl: string;
  readonly name: string;
  readonly description: string;
  readonly language: string;
  readonly features: readonly string[];
  readonly faq: readonly FaqItem[];
}

const nodeRef = (siteUrl: string, fragment: string) => ({ "@id": `${siteUrl}/#${fragment}` });

/** Builds the landing page JSON-LD graph: WebSite, Organization, WebApplication, FAQPage. */
export function buildLandingJsonLd(input: LandingJsonLdInput): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        ...nodeRef(input.siteUrl, "website"),
        url: input.siteUrl,
        name: input.name,
        inLanguage: input.language,
        publisher: nodeRef(input.siteUrl, "organization"),
      },
      {
        "@type": "Organization",
        ...nodeRef(input.siteUrl, "organization"),
        name: input.name,
        url: input.siteUrl,
      },
      {
        "@type": "WebApplication",
        ...nodeRef(input.siteUrl, "app"),
        name: input.name,
        url: input.siteUrl,
        description: input.description,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any",
        inLanguage: input.language,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        featureList: [...input.features],
        publisher: nodeRef(input.siteUrl, "organization"),
      },
      {
        "@type": "FAQPage",
        ...nodeRef(input.siteUrl, "faq"),
        url: input.siteUrl,
        mainEntity: input.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}

/** Serializes JSON-LD for inline script, escaping `<` to prevent XSS. */
export function serializeJsonLd(data: unknown): string {
  return (JSON.stringify(data) ?? "null").replace(/</g, "\\u003c");
}
