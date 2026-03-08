// scripts/create-e2e-users.ts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const TEST_USERS = [
    { email: process.env.E2E_ADMIN_EMAIL!, role: 'admin' },
    { email: process.env.E2E_USER_EMAIL!, role: 'user' },
]

async function getOrCreateAuthUser(email: string) {
    // 1. Try to create the user fresh
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name: `E2E ${email.split('@')[0]}` },
    })

    if (created?.user) {
        console.log(`🆕 Created auth user: ${email}`)
        return created.user
    }

    // 2. User already exists in auth.users — find them by email filter
    if (error?.message?.includes('already been registered')) {
        console.log(`🔍 User exists in auth, looking up: ${email}`)

        const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000, // adjust if you have more users
        })

        if (listError) throw new Error(`listUsers failed: ${listError.message}`)

        const found = list.users.find(u => u.email === email)
        if (!found) throw new Error(`❌ User not found in auth.users despite "already registered": ${email}`)

        console.log(`✅ Found existing auth user: ${email} (id: ${found.id})`)
        return found
    }

    throw new Error(`❌ Unexpected error creating ${email}: ${error?.message}`)
}

async function syncProfiles() {
    for (const { email, role } of TEST_USERS) {
        const authUser = await getOrCreateAuthUser(email)

        // upsert = insert if not exists, update if exists — handles all states safely
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert(
                { id: authUser.id, email, role },
                { onConflict: 'id' } // use 'email' if your profiles PK is email
            )

        if (profileError) {
            console.error(`❌ profiles upsert failed for ${email}:`, profileError.message)
        } else {
            console.log(`✅ Profile synced → ${email} as [${role}]`)
        }
    }

    console.log('\n🎉 Done. Run your E2E tests now.')
}

syncProfiles()
