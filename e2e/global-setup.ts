// e2e/global-setup.ts
import { chromium, type FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

// Admin client uses service_role
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function saveAuthState(email: string, outputPath: string, role: string) {
    console.log(`🔗 Setting up auth for ${role} (${email})`)

    // Create user if doesn't exist
    const { data: userData } = await supabaseAdmin.auth.admin.listUsers()
    let user = userData.users.find(u => u.email === email)

    if (!user) {
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { role }
        })
        if (error) {
            console.log(`   ⚠️ User creation: ${error.message}`)
            const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
            user = existingUser.users.find(u => u.email === email)
            console.log(`   👤 Found existing user`)
        } else {
            user = newUser?.user
            console.log(`   👤 Created user`)
        }
    } else {
        console.log(`   👤 User exists`)
    }

    if (!user) {
        throw new Error(`Failed to get user for ${email}`)
    }

    // Set profile role first
    await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        email: email,
        role: role === 'admin' ? 'admin' : 'user',
    }, { onConflict: 'id' })
    console.log(`   👤 Set profile role to ${role === 'admin' ? 'admin' : 'user'}`)

    // Generate a magic link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
            redirectTo: `${BASE_URL}/auth/callback`,
        },
    })

    if (linkError || !linkData?.properties?.action_link) {
        throw new Error(`Failed to generate link: ${linkError?.message}`)
    }

    const magicLink = linkData.properties.action_link

    // Extract tokens from the magic link URL
    const linkUrl = new URL(magicLink)
    const tokenFromLink = linkUrl.searchParams.get('token')
    const redirectTo = linkUrl.searchParams.get('redirect_to')

    console.log(`   📧 Got magic link, processing...`)

    // Use browser to visit the magic link and process it
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    // Visit the magic link - browser will redirect with tokens in hash
    await page.goto(magicLink, { waitUntil: 'networkidle', timeout: 20000 })

    // Wait for redirect to happen
    await page.waitForTimeout(3000)

    // Get the URL with hash containing tokens
    const currentUrl = page.url()
    const url = new URL(currentUrl)
    const hashParams = new URLSearchParams(url.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    console.log(`   🔑 Access token: ${accessToken ? 'found' : 'not found'}`)

    if (accessToken && refreshToken) {
        // Now visit the callback URL with tokens - this will set cookies server-side
        const callbackUrl = `${BASE_URL}/auth/callback#access_token=${accessToken}&refresh_token=${refreshToken}`
        await page.goto(callbackUrl, { waitUntil: 'networkidle', timeout: 15000 })
        await page.waitForTimeout(2000)
        console.log(`   📄 Visited callback with tokens`)
    }

    // Now navigate to home to verify auth works
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 })
    await page.waitForTimeout(1000)

    // Save the storage state (includes cookies)
    await context.storageState({ path: outputPath })

    await browser.close()

    console.log(`   ✅ Auth state saved for ${role}`)
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
