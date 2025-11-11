import type { Metadata } from "next";

const SITE_NAME = "Dehive";
const SITE_DESCRIPTION = "Dehive - dehive is the message app for user.";

const SITE_URL =
  process.env.PUBLIC_FRONTEND_URL || "https://dehive.decodenetwork.app";

const SITE_ICON = "/images/tokens/3d_token_nobg.png";

const IS_PROD = process.env.NODE_ENV === "production";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s | Decode Protocol",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Dehive",
    "Web3",
    "Authentication",
    "Identity",
    "Blockchain",
    "Message",
  ],
  icons: {
    icon: [{ url: SITE_ICON, type: "image/png" }],
    shortcut: SITE_ICON,
    apple: [{ url: SITE_ICON, type: "image/png" }],
  },
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/tokens/3d_token_nobg.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/images/tokens/3d_token_nobg.png"],
  },
  robots: {
    index: IS_PROD,
    follow: IS_PROD,
    nocache: false,
    googleBot: {
      index: IS_PROD,
      follow: IS_PROD,
      noimageindex: !IS_PROD,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {},
};

/**
 * Build page-level metadata:
 * - Create canonical and og:url accurately according to `path`
 */
export function buildPageMetadata(
  title?: string,
  description?: string,
  path?: string
): Metadata {
  // Ensure path always has leading slash when passed to URL()
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const url = normalizedPath
    ? new URL(normalizedPath, SITE_URL).toString()
    : SITE_URL;

  return {
    ...defaultMetadata,
    title: title
      ? { default: title, template: "%s | Decode Protocol" }
      : defaultMetadata.title,
    description: description || defaultMetadata.description,
    openGraph: {
      ...defaultMetadata.openGraph,
      url,
      title: title || (defaultMetadata.openGraph?.title as string | undefined),
      description:
        description ||
        (defaultMetadata.openGraph?.description as string | undefined),
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title || (defaultMetadata.twitter?.title as string | undefined),
      description:
        description ||
        (defaultMetadata.twitter?.description as string | undefined),
    },
    alternates: { canonical: url },
  };
}
