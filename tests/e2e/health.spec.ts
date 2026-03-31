import { test, expect } from '@playwright/test';

test.describe('API Health Checks', () => {
    test('should return 200 from local auth health check', async ({ request }) => {
        // Calling the NestJS API health check endpoint that we implemented
        const response = await request.get('http://127.0.0.1:4000/api/v1/auth/health');

        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body).toHaveProperty('status', 'ok');
    });
});
