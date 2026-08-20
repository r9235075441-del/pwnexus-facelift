const ORIGIN = "https://pwnexus.pages.dev";
const ORIGIN_HOST = "pwnexus.pages.dev";

const REPLACEMENTS: Array<[string, string]> = [
  ["PW-MARCO", "EduFreek"],
  ["PW MARCO", "EduFreek"],
  ["PWMARCO", "EduFreek"],
  ["PW-NEXUS", "EduFreek"],
  ["PW NEXUS", "EduFreek"],
  ["PW Nexus", "EduFreek"],
  ["pw nexus", "EduFreek"],
  ["pw-nexus", "EduFreek"],
  ["PWNexuss", "EduFreek"],
  ["PWNexus", "EduFreek"],
  ["PWNEXUS", "EduFreek"],
  ["pwnexus", "EduFreek"],
  [
    "https://i.ibb.co/YBbwNGxz/Logo-pw-removebg-preview.png",
    "https://i.ibb.co/ksRGCJdv/IMG-20260820-152721-928.jpg",
  ],
  ["https://t.me/official_marco_22", "https://t.me/EduFreek"],
  ["official_marco_22", "EduFreek"],
  ["officialmarco22", "EduFreek"],
];

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "accept-encoding",
  "content-length",
]);

const TEXT_TYPES = [
  "text/",
  "application/javascript",
  "application/x-javascript",
  "application/json",
  "application/manifest+json",
  "application/xml",
  "image/svg+xml",
  "application/rsc",
];

function isTextual(contentType: string | null) {
  if (!contentType) return false;
  const ct = contentType.toLowerCase();
  return TEXT_TYPES.some((t) => ct.includes(t));
}

function rewriteText(input: string) {
  let out = input;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  // Absolute origin URLs -> relative so they stay on the proxy
  out = out.split(`${ORIGIN}/`).join("/");
  out = out.split(ORIGIN).join("");
  return out;
}

function rewriteSetCookie(value: string) {
  return value
    .split(/;\s*/)
    .filter((part) => !/^domain=/i.test(part))
    .join("; ");
}

export async function proxyRequest(request: Request): Promise<Response> {
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, ORIGIN);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "origin") {
      headers.set("origin", ORIGIN);
      return;
    }
    if (key.toLowerCase() === "referer") {
      headers.set("referer", value.replace(incoming.origin, ORIGIN));
      return;
    }
    headers.set(key, value);
  });
  headers.set("accept-encoding", "identity");

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : null,
      redirect: "manual",
    });
  } catch {
    return new Response("Upstream unavailable", { status: 502 });
  }

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (
      k === "content-encoding" ||
      k === "content-length" ||
      k === "content-security-policy" ||
      k === "content-security-policy-report-only" ||
      k === "x-frame-options" ||
      k === "set-cookie" ||
      k === "transfer-encoding"
    ) {
      return;
    }
    if (k === "location") {
      let loc = value;
      if (loc.startsWith(ORIGIN)) loc = loc.slice(ORIGIN.length) || "/";
      else if (loc.includes(ORIGIN_HOST)) loc = loc.replace(ORIGIN_HOST, incoming.host);
      outHeaders.set("location", loc);
      return;
    }
    outHeaders.set(key, value);
  });

  const setCookies = (upstream.headers as unknown as { getSetCookie?: () => string[] })
    .getSetCookie?.();
  if (setCookies?.length) {
    for (const cookie of setCookies) outHeaders.append("set-cookie", rewriteSetCookie(cookie));
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) outHeaders.append("set-cookie", rewriteSetCookie(single));
  }

  if (isTextual(upstream.headers.get("content-type"))) {
    const body = rewriteText(await upstream.text());
    return new Response(body, { status: upstream.status, headers: outHeaders });
  }

  return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
}
