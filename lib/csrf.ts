import { NextResponse } from "next/server";

const unsafeMethods = new Set(["DELETE", "PATCH", "POST", "PUT"]);

function originFromUrl(value: string | undefined | null) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

type CsrfOriginEnv = {
  APP_BASE_URL?: string;
  NEXTAUTH_URL?: string;
};

export function allowedMutationOrigins(requestUrl: string, env: CsrfOriginEnv = process.env) {
  return new Set([originFromUrl(requestUrl), originFromUrl(env.APP_BASE_URL), originFromUrl(env.NEXTAUTH_URL)].filter((origin): origin is string => Boolean(origin)));
}

export function isSameOriginMutationRequest(
  request: Pick<Request, "headers" | "method" | "url">,
  env: CsrfOriginEnv = process.env,
) {
  if (!unsafeMethods.has(request.method.toUpperCase())) {
    return true;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  return allowedMutationOrigins(request.url, env).has(origin);
}

export function rejectCrossOriginMutation(request: Request) {
  if (isSameOriginMutationRequest(request)) {
    return null;
  }

  return NextResponse.json({ error: "Ongeldige aanvraagherkomst" }, { status: 403 });
}
