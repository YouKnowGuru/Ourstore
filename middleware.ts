import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (Note: This is reset on server restarts/deployments)
// For a production-ready solution, consider using Redis or a dedicated service.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_THRESHOLD = 60; // Max requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = request.ip || 'anonymous';

    // 1. Basic Application-Level Firewall: Filter suspicious request patterns
    const suspiciousPatterns = [
        '../',
        '/etc/passwd',
        'sql-dump',
        'phpmyadmin',
        '.sql',
        '.env',
        '<script',
        'javascript:',
    ];

    if (suspiciousPatterns.some((pattern) => pathname.toLowerCase().includes(pattern))) {
        console.warn(`[Firewall Blocked] Suspicious path detected: ${pathname} from IP: ${ip}`);
        return new NextResponse(null, { status: 403, statusText: 'Forbidden' });
    }

    // 2. Simple Rate Limiting for API routes
    if (pathname.startsWith('/api/')) {
        const now = Date.now();
        const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

        if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
            rateData.count = 1;
            rateData.lastReset = now;
        } else {
            rateData.count++;
        }

        rateLimitMap.set(ip, rateData);

        if (rateData.count > RATE_LIMIT_THRESHOLD) {
            console.warn(`[Firewall Throttled] Rate limit exceeded for IP: ${ip} on path: ${pathname}`);
            return new NextResponse(
                JSON.stringify({ message: 'Too many requests, please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 3. Security Headers reinforcement
    const response = NextResponse.next();

    // Ensure all security headers are set (redundant with next.config.ts but good for reinforcement)
    // CSP is handled by Next.js automatically if configured, but we can add or tweak here if needed.

    return response;
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (api routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images/ (public images)
         */
        '/((?!_next/static|_next/image|favicon.ico|images/).*)',
    ],
};
