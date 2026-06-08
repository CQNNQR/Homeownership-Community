const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const listResponse = await fetch(`${url}/auth/v1/admin/users?per_page=50`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
  },
})

if (!listResponse.ok) {
  const err = await listResponse.text()
  console.error('Failed to list users:', listResponse.status, err)
  process.exit(1)
}

const listData = await listResponse.json()
const users = listData.users || []

console.log(`Found ${users.length} user(s).`)
for (const u of users) {
  console.log(`- ${u.email} | id=${u.id} | role=${u.app_metadata?.role || '(none)'}`)
}

const adminEmails = ['admin@hoc.com', 'brandon@hocmortgage.com']
const targets = users.filter(u => adminEmails.includes((u.email || '').toLowerCase()))

if (targets.length === 0) {
  console.error(`\nNo matching admin user found. Looked for: ${adminEmails.join(', ')}`)
  process.exit(2)
}

for (const target of targets) {
  console.log(`\nTargeting ${target.email} (${target.id}).`)
  console.log('Current app_metadata:', JSON.stringify(target.app_metadata || {}))

  const newMetadata = { ...(target.app_metadata || {}), role: 'admin' }

  const updateResponse = await fetch(`${url}/auth/v1/admin/users/${target.id}`, {
    method: 'PUT',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ app_metadata: newMetadata }),
  })

  if (!updateResponse.ok) {
    const err = await updateResponse.text()
    console.error(`Failed to update ${target.email}:`, updateResponse.status, err)
    continue
  }

  const updated = await updateResponse.json()
  console.log('Updated app_metadata:', JSON.stringify(updated.app_metadata))
  console.log(`Success. ${target.email} is now role=admin.`)
}

console.log('\nAll done. Affected users must sign out and back in once to refresh their JWT.')
