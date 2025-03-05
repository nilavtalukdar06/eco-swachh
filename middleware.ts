import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});
export default createMiddleware(aj);
