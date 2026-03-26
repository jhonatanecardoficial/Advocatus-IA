'use server'

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function getDashboardMetricsAction() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return { success: false, error: 'Unauthorized' };
        }

        const res = await fetch(`${API_URL}/reports/dashboard-metrics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            next: { revalidate: 60 } // Cache por 1 minuto
        });

        if (!res.ok) {
            return { success: false, error: 'Failed to fetch metrics' };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Internal Server Error' };
    }
}
