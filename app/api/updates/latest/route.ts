import { NextResponse } from 'next/server';

/**
 * GET /api/updates/latest
 * Returns the latest version info for the desktop POS application.
 * 
 * In production, this should query a releases collection or GitHub Releases API.
 * For now, this returns static version info that can be updated manually.
 */
export async function GET() {
    try {
        // TODO: Replace with dynamic version lookup (MongoDB, GitHub Releases, etc.)
        const latestRelease = {
            version: '1.0.0',
            notes: 'Initial release with full accounting, POS, inventory, and GST modules.',
            downloadUrl: 'https://dhisumtseyig.com/download',
            releaseDate: '2026-03-07',
        };

        return NextResponse.json(latestRelease);

    } catch (error: any) {
        console.error('Update check error:', error);
        return NextResponse.json(
            { version: '1.0.0', notes: '', downloadUrl: '' },
            { status: 500 }
        );
    }
}
