import type { NextConfig } from "next";

/**
 * The URL path the site is served from, without a trailing slash.
 *
 * Every stylesheet, script and font URL is written with this prefix and inlined
 * into the bundles at build time, so it has to match the deployed URL exactly.
 * Get it wrong and the browser asks for assets that aren't there: the HTML loads
 * but nothing else does, and the page renders as unstyled markup.
 *
 * The default targets the technical address, where the document root is the
 * account home — so public_html, normally the web root itself, is part of the
 * public URL:
 *
 *   https://kruszy.ssd-linuxpl.com/public_html/risk-calc/
 *
 * Override it per build rather than editing this file. Once a real domain
 * points at public_html the prefix shrinks, and at a domain root it disappears:
 *
 *   BASE_PATH=/risk-calc npm run build     # https://domena.pl/risk-calc/
 *   BASE_PATH= npm run build               # https://domena.pl/
 */
const basePath = process.env.BASE_PATH ?? "/public_html/risk-calc";

const nextConfig: NextConfig = {
  /*
   * A static export for plain FTP hosting: `next build` writes the whole site
   * to out/, which gets uploaded as-is. There is no Node process in production.
   */
  output: "export",

  basePath,

  /*
   * Emit every route as a directory with its own index.html, which is what a
   * dumb static host can serve without any rewrite rules.
   */
  trailingSlash: true,
};

export default nextConfig;
