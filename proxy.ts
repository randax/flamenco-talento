import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/i18n";

const NORWEGIAN_PREFIXES = ["no", "nb", "nn"];

const SKIP_PREFIXES = ["/studio", "/api", "/_next"];

function hasFileExtension(pathname: string): boolean {
  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.includes(".");
}

function shouldSkip(pathname: string): boolean {
  if (pathname === "/favicon.ico") return true;
  if (SKIP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  if (hasFileExtension(pathname)) return true;
  return false;
}

function detectLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;

  const entries = acceptLanguage
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = rawTag.trim().toLowerCase();
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1;
      return { tag, q: Number.isNaN(q) ? 0 : q };
    })
    .filter((entry) => entry.tag.length > 0);

  const primary = (tag: string) => tag.split("-")[0];

  const englishQ = Math.max(
    0,
    ...entries.filter((e) => primary(e.tag) === "en").map((e) => e.q)
  );
  const norwegianQ = Math.max(
    0,
    ...entries.filter((e) => NORWEGIAN_PREFIXES.includes(primary(e.tag))).map((e) => e.q)
  );

  return englishQ > norwegianQ ? "en" : DEFAULT_LANG;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1] ?? "";

  if (isLang(firstSegment)) {
    return NextResponse.next();
  }

  const detected = detectLang(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname}`;

  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!studio|api|_next|favicon.ico|.*\\..*).*)"],
};
