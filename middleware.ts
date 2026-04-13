// Vercel Edge Middleware — HTTP Basic Auth
// Runs at the network edge before any content is served.
// Credentials are stored in Vercel environment variables:
//   AUTH_USER  (default: "largo")
//   AUTH_PASS  (required — set in Vercel dashboard)

export const config = {
  matcher: '/:path*',
};

export default function middleware(request: Request): Response | undefined {
  const user = process.env.AUTH_USER ?? 'largo';
  const pass = process.env.AUTH_PASS ?? '';

  // If AUTH_PASS is not set, let everyone through (safety fallback)
  if (!pass) return undefined;

  const auth = request.headers.get('Authorization') ?? '';

  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const colon = decoded.indexOf(':');
      const u = decoded.slice(0, colon);
      const p = decoded.slice(colon + 1);
      if (u === user && p === pass) return undefined; // ✓ allow
    } catch {}
  }

  return new Response('Access restricted.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Struction"' },
  });
}
