// e2e/global-setup.ts
import { chromium, type FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

// Admin client uses service_role — only safe server-side
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function saveAuthState(email: string, outputPath: string, role: string) {
    // Generate a one-time magic link for this test user
    // Works regardless of Google-only auth setting — admin API bypasses it
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
            redirectTo: `${BASE_URL}/auth/callback`,
        },
    })

    if (error || !data?.properties?.action_link) {
        throw new Error(`❌ generateLink failed for [${email}]: ${error?.message}`)
    }

    // The action_link is: https://xjbxqjbzrgmlgjkfqfnc.supabase.co/auth/v1/verify?token=...
    // Playwright visits it → Supabase redirects to /auth/callback → cookies set
    const magicLink = data.properties.action_link
    console.log(`🔗 Generated magic link for ${role} (${email})`)

    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    // Visit the magic link — this triggers the full auth flow
    await page.goto(magicLink)

    // Your /auth/callback route exchanges the code and redirects to /
    await page.waitForURL(`${BASE_URL}/**`, { timeout: 15_000 })
    await page.waitForLoadState('networkidle')

    // Confirm we're actually authenticated (not redirected to login)
    const currentUrl = page.url()
    if (currentUrl.includes('auth-code-error')) {
        throw new Error(`❌ Auth callback failed for ${email}. Check /auth/callback route.`)
    }

    console.log(`✅ Authenticated as ${role} → landed on ${currentUrl}`)

    // Save cookies to disk — reused by all tests in that role's project
    await context.storageState({ path: outputPath })
    await browser.close()
}

export default async function globalSetup(_config: FullConfig) {
    const authDir = path.join('e2e', '.auth')
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })

    await saveAuthState(
        process.env.E2E_ADMIN_EMAIL!,
        path.join(authDir, 'admin.json'),
        'admin',
    )

    await saveAuthState(
        process.env.E2E_USER_EMAIL!,
        path.join(authDir, 'user.json'),
        'user',
    )

    console.log('🎭 All auth states ready.')
}
