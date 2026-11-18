import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// Run on all pages except API routes, Next internals, static assets and files with an extension.
export const config = { matcher: "/((?!api|_next|_vercel|images|frames|.*\\..*).*)" };
