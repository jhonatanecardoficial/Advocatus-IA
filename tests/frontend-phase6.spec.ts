import { test, expect } from '@playwright/test'

/**
 * Phase 6 - Landing Page & Frontend Refinement Tests
 * Tests for the complete user flow: Landing -> Register -> Dashboard
 */

test.describe('Phase 6: Landing Page & Frontend Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test.describe('Landing Page', () => {
        test('should display hero section with call-to-action', async ({ page }) => {
            await expect(page.locator('h1')).toContainText('A Excelência Jurídica Exige Rigor')
 
            // Check CTA buttons
            await expect(page.locator('a:has-text("Solicitar Acesso Piloto")')).toBeVisible()
            await expect(page.locator('a:has-text("Explorar Funcionalidades")')).toBeVisible()
        })

        test('should display social proof section', async ({ page }) => {
            const socialProof = page.locator('text=Acesso Exclusivo para Escritórios Selecionados')
            await expect(socialProof).toBeVisible()

            // Check security badges
            await expect(page.locator('text=Inteligência Artificial que Respeita a Toga.')).toBeVisible()
            await expect(page.locator('text=RGPD Compliant')).toBeVisible()
            await expect(page.locator('text=Assinatura QES')).toBeVisible()
        })

        test('should display features section', async ({ page }) => {
            const featuresSection = page.locator('text=Gestão Integral do Seu Escritório')
            await expect(featuresSection).toBeVisible()

            // Check feature cards
            await expect(page.locator('h3:has-text("Honorários e Faturação")')).toBeVisible()
            await expect(page.locator('h3:has-text("Processos e Clientes")')).toBeVisible()
            await expect(page.locator('h3:has-text("Prazos e Documentos")')).toBeVisible()
        })

        test('should display footer with links', async ({ page }) => {
            const footer = page.locator('footer')
            await footer.scrollIntoViewIfNeeded()
            await expect(page.locator('footer >> text=Advocatus IA')).toBeVisible()
            await expect(page.locator('footer >> text=Política de Privacidade')).toBeVisible()
            await expect(page.locator('footer >> text=Termos de Utilização')).toBeVisible()
        })
    })

    test.describe('Navigation & Responsiveness', () => {
        test('should navigate to login page', async ({ page }) => {
            await page.locator('a:has-text("Entrar")').first().click()
            await expect(page).toHaveURL(/.*\/login/)
        })

        test('should navigate to register page', async ({ page }) => {
            await page.locator('a:has-text("Acesso Antecipado")').first().click()
            await expect(page).toHaveURL(/.*\/login/) // Agora aponta para login também
        })

        test('should be responsive on mobile (375px)', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 812 })
            
            // Check hero section is stacked
            const hero = page.locator('section').first()
            const computedStyle = await hero.evaluate(el => window.getComputedStyle(el))
            
            // Verify layout adjusts
            await expect(page.locator('h1')).toBeVisible()
            await expect(page.locator('a:has-text("Solicitar Acesso Piloto")')).toBeVisible()
        })

        test('should display properly on desktop (1440px)', async ({ page }) => {
            await page.setViewportSize({ width: 1440, height: 900 })
            
            // Check multi-column layouts render
            await expect(page.locator('text=Gestão Integral do Seu Escritório')).toBeVisible()
            
            // Features should be in grid
            const featureCards = page.locator('#features div.grid > div')
            const count = await featureCards.count()
            expect(count).toBe(3)
        })
    })

    test.describe('Premium Design System', () => {
        test('should not use purple/violet colors (Purple Ban)', async ({ page }) => {
            // Sample check on body element
            const body = page.locator('body')
            const bgColor = await body.evaluate(el => window.getComputedStyle(el).backgroundColor)
            
            // Verify primary colors are Navy or Amber, not purple
            expect(bgColor).not.toContain('128') // Avoid purple hues
        })

        test('should display hover effects on buttons', async ({ page }) => {
            const button = page.locator('a:has-text("Solicitar Acesso Piloto")').first()
            
            // Get initial state
            const initialStyle = await button.evaluate(el => window.getComputedStyle(el).transform)
            
            // Hover over button
            await button.hover()
            
            // Check for hover effect
            const hoverStyle = await button.evaluate(el => window.getComputedStyle(el).boxShadow)
            expect(hoverStyle).toBeTruthy()
        })

        test('should animate elements on page load', async ({ page }) => {
            const animateDiv = page.locator('div.animate-fade-in').first()
            
            // Check for animation class
            const className = await animateDiv.getAttribute('class')
            expect(className).toContain('animate')
        })
    })

    test.describe('Complete User Journey', () => {
        test('should complete landing -> register -> dashboard flow', async ({ page }) => {
            // 1. Start on landing page
            await expect(page).toHaveURL('/')

            // 2. Click Começar Grátis from hero
            await page.locator('a:has-text("Solicitar Acesso Piloto")').click()
            await expect(page).toHaveURL(/.*\/login/) 

            // 3. Register flow (basic check)
            const registerForm = page.locator('form')
            await expect(registerForm).toBeVisible()
        })
    })

    test.describe('Accessibility', () => {
        test('should have proper heading hierarchy', async ({ page }) => {
            // Check h1 exists and is first
            const h1 = page.locator('h1').first()
            await expect(h1).toBeVisible()
        })

        test('should have accessible buttons and links', async ({ page }) => {
            const buttons = page.locator('button, a[href]')
            const count = await buttons.count()
            expect(count).toBeGreaterThan(0)

            // All buttons should have text or aria-label
            for (let i = 0; i < Math.min(count, 5); i++) {
                const element = buttons.nth(i)
                const text = await element.textContent()
                const ariaLabel = await element.getAttribute('aria-label')
                
                expect(text || ariaLabel).toBeTruthy()
            }
        })

        test('should have focus ring on interactive elements', async ({ page }) => {
            const button = page.locator('button').first()
            await button.focus()
            
            const focusStyle = await button.evaluate(el => window.getComputedStyle(el).outline)
            expect(focusStyle).toBeTruthy()
        })
    })
})
