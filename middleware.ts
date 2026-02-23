import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (Note: This is reset on server restarts/deployments)
// For a production-ready solution, consider using Redis or a dedicated service.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_THRESHOLD = 60; // Max requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // Use request.headers.get('x-forwarded-for') as a fallback for IP detection
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';

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

    // 3. Security Headers Enforcement
    const response = NextResponse.next();

    // Content Security Policy (Adjusted to be functional yet secure)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.googleapis.com https://unpkg.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
        connect-src 'self' https://unpkg.com;
        img-src 'self' data: https: http:;
        font-src 'self' https://fonts.gstatic.com data:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match ALL request paths including /api/
         * Exclude only static assets and favicon
         */
        '/((?!_next/static|_next/image|favicon.ico|images/).*)',
    ],
};
