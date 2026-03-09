import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/license/verify
 * Validates a license key and binds it to a device.
 * 
 * In production, this should query MongoDB for license records.
 * For now, this is a working skeleton that can be extended.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { licenseKey, deviceId } = body;

        if (!licenseKey || !deviceId) {
            return NextResponse.json(
                { valid: false, message: 'License key and device ID are required.' },
                { status: 400 }
            );
        }

        // TODO: Replace with actual MongoDB lookup
        // Example: const license = await db.collection('licenses').findOne({ key: licenseKey });

        // ------- DEMO VALIDATION -------
        // Accept any key matching the format DTS-XXXX-XXXX-XXXX for testing
        const keyPattern = /^DTS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

        if (!keyPattern.test(licenseKey)) {
            return NextResponse.json({
                valid: false,
                message: 'Invalid license key format. Expected: DTS-XXXX-XXXX-XXXX',
            });
        }

        // In production: check if key exists, is active, check device binding, etc.
        // For now, return a successful activation for any valid-format key

        // Calculate expiry based on dummy plan logic
        const now = new Date();
        let plan = 'starter';
        let expiryDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

        // Simple plan detection from key prefix (demo only)
        if (licenseKey.startsWith('DTS-ENT')) {
            plan = 'enterprise';
            expiryDate = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
        } else if (licenseKey.startsWith('DTS-GRO')) {
            plan = 'growth';
            expiryDate = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
        }

        // Map plan to max users
        let maxUsers = 1;
        if (plan === 'enterprise') maxUsers = 5;
        else if (plan === 'growth') maxUsers = 2;

        return NextResponse.json({
            valid: true,
            plan,
            maxUsers,
            expiryDate: expiryDate.toISOString().split('T')[0],
            message: 'License activated successfully.',
        });

    } catch (error: any) {
        console.error('License verification error:', error);
        return NextResponse.json(
            { valid: false, message: 'Internal server error.' },
            { status: 500 }
        );
    }
}
