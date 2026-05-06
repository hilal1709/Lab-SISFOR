const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

function parseEnvFile(content) {
  const values = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const equalsIndex = line.indexOf('=')
    if (equalsIndex === -1) continue

    const key = line.slice(0, equalsIndex).trim()
    let value = line.slice(equalsIndex + 1).trim()

    if (!key) continue

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    values[key] = value
  }

  return values
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const parsed = parseEnvFile(fs.readFileSync(filePath, 'utf8'))
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

const rootDir = path.resolve(__dirname, '..')
loadEnvFile(path.join(rootDir, '.env.local'))
loadEnvFile(path.join(rootDir, '.env'))
loadEnvFile(path.join(rootDir, '.env.example'))

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    ''
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Create .env.local or update .env.example before building.')
  process.exit(1)
}

for (const command of [
  { cmd: 'npx', args: ['prisma', 'db', 'push'] },
  { cmd: 'npx', args: ['prisma', 'generate'] },
  { cmd: 'npx', args: ['next', 'build'] },
]) {
  const result = spawnSync(command.cmd, command.args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}