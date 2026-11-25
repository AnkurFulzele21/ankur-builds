import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ankurfulzele.in").replace(
    /\/$/,
    ""
  );
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/newsletter", "/newsletter/"],
        disallow: ["/admin", "/admin/", "/login", "/api/", "/write"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
