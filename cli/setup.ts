import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { networkInterfaces } from 'node:os'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import Enquirer from 'enquirer'

const { Input, Confirm, Select } = Enquirer as unknown as {
  Input: new (options: { message: string; initial?: string }) => { run: () => Promise<string> }
  Confirm: new (options: { name: string; message: string; initial?: boolean }) => {
    run: () => Promise<boolean>
  }
  Select: new (options: { name: string; message: string; choices: string[]; initial?: number }) => {
    run: () => Promise<string>
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// ANSI color codes for console output
const colors = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  dim: '\x1B[2m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  cyan: '\x1B[36m',
} as const

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

interface EnvConfig {
  database: {
    user: string
    password: string
    name: string
    host: string
    port: number
  }
  ports: {
    api: number
    maildevSmtp: number
    maildevWeb: number
    pgadmin: number
  }
  betterAuth: {
    secret: string
    trustedOrigins: string
  }
  mobile: {
    localIp: string
  }
}

interface EnvFileInfo {
  from: string
  to: string
  exists: boolean
  missingVars: string[]
}

async function prompt(message: string, initial: string): Promise<string> {
  const input = new Input({
    message,
    initial,
  })
  return input.run()
}

async function confirm(message: string, initial = false): Promise<boolean> {
  const confirmPrompt = new Confirm({
    name: 'confirm',
    message,
    initial,
  })
  return confirmPrompt.run()
}

async function select(message: string, choices: string[], initial = 0): Promise<string> {
  const selectPrompt = new Select({
    name: 'select',
    message,
    choices,
    initial,
  })
  return selectPrompt.run()
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(
      `\n  ${colorize('→', 'cyan')} Running: ${colorize(`${command} ${args.join(' ')}`, 'dim')}\n`,
    )

    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForDatabase(maxRetries = 30, delayMs = 1000): Promise<boolean> {
  console.log(`  ${colorize('⏳', 'yellow')} Waiting for database to be ready...`)

  for (let i = 0; i < maxRetries; i++) {
    try {
      const child = spawn(
        'docker',
        ['compose', 'exec', '-T', 'db', 'pg_isready', '-U', 'postgres'],
        {
          cwd: projectRoot,
          stdio: 'pipe',
          shell: true,
        },
      )

      const exitCode = await new Promise<number>((resolve) => {
        child.on('close', (code) => resolve(code ?? 1))
        child.on('error', () => resolve(1))
      })

      if (exitCode === 0) {
        console.log(`  ${colorize('✓', 'green')} Database is ready!`)
        return true
      }
    } catch {
      // Ignore errors, retry
    }

    await sleep(delayMs)
    process.stdout.write(`  ${colorize('⏳', 'yellow')} Waiting... (${i + 1}/${maxRetries})\r`)
  }

  console.log(`\n  ${colorize('⚠', 'yellow')} Database not ready after ${maxRetries} attempts`)
  return false
}

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {}
  }

  const content = readFileSync(filePath, 'utf-8')
  const vars: Record<string, string> = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim()
        vars[key] = value
      }
    }
  }

  return vars
}

function getMissingVariables(examplePath: string, envPath: string): string[] {
  const exampleVars = parseEnvFile(examplePath)
  const envVars = parseEnvFile(envPath)

  return Object.keys(exampleVars).filter((key) => !(key in envVars) || !envVars[key])
}

function getLocalIpAddress(): string | null {
  const nets = networkInterfaces()

  for (const name of Object.keys(nets)) {
    const netInterfaces = nets[name]
    if (!netInterfaces) continue

    for (const net of netInterfaces) {
      // Skip over non-IPv4 and internal addresses
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal) {
        // Prioritize private network ranges
        if (
          net.address.startsWith('192.168.') ||
          net.address.startsWith('10.') ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(net.address)
        ) {
          return net.address
        }
      }
    }
  }

  return null
}

function generateBetterAuthSecret(): string {
  return randomBytes(32).toString('base64')
}

function updateEnvFile(
  filePath: string,
  replacements: Record<string, string>,
  onlyMissing = false,
): void {
  if (!existsSync(filePath)) {
    console.log(`  ${colorize('⚠', 'yellow')} File not found: ${colorize(filePath, 'dim')}`)
    return
  }

  let content = readFileSync(filePath, 'utf-8')
  const existingVars = parseEnvFile(filePath)
  let updated = false

  for (const [key, value] of Object.entries(replacements)) {
    if (onlyMissing && key in existingVars && existingVars[key]) {
      continue
    }

    const regex = new RegExp(`^${key}=.*$`, 'm')
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`)
      updated = true
    } else {
      content += `\n${key}=${value}`
      updated = true
    }
  }

  if (updated) {
    writeFileSync(filePath, content, 'utf-8')
  }
}

function checkEnvFiles(): EnvFileInfo[] {
  const envFiles: Array<{ from: string; to: string }> = [
    { from: '.env.example', to: '.env' },
    { from: 'apps/api/.env.example', to: 'apps/api/.env' },
    { from: 'apps/web/.env.example', to: 'apps/web/.env' },
    { from: 'apps/mobile/.env.example', to: 'apps/mobile/.env' },
  ]

  return envFiles.map(({ from, to }) => {
    const fromPath = join(projectRoot, from)
    const toPath = join(projectRoot, to)
    const exists = existsSync(toPath)
    const missingVars = exists ? getMissingVariables(fromPath, toPath) : []

    return { from, to, exists, missingVars }
  })
}

function copyEnvFiles(envFilesInfo: EnvFileInfo[]): void {
  console.log(`\n${colorize('📋 Checking .env files', 'cyan')}\n`)

  for (const { from, to, exists, missingVars } of envFilesInfo) {
    const fromPath = join(projectRoot, from)
    const toPath = join(projectRoot, to)

    if (exists) {
      if (missingVars.length > 0) {
        console.log(
          `  ${colorize('⚠', 'yellow')} ${colorize(to, 'dim')} exists but missing variables: ${colorize(missingVars.join(', '), 'yellow')}`,
        )
      } else {
        console.log(`  ${colorize('✓', 'green')} ${colorize(to, 'dim')} exists and is complete`)
      }
      continue
    }

    if (existsSync(fromPath)) {
      copyFileSync(fromPath, toPath)
      console.log(
        `  ${colorize('✓', 'green')} Copied ${colorize(from, 'dim')} → ${colorize(to, 'dim')}`,
      )
    } else {
      console.log(`  ${colorize('⚠', 'yellow')} File not found: ${colorize(from, 'dim')}`)
    }
  }
}

async function promptDatabaseConfig(): Promise<EnvConfig['database']> {
  const rootEnvPath = join(projectRoot, '.env')
  const rootExamplePath = join(projectRoot, '.env.example')
  const envExists = existsSync(rootEnvPath)
  const existingVars = envExists ? parseEnvFile(rootEnvPath) : {}
  const exampleVars = parseEnvFile(rootExamplePath)
  const missingVars = envExists
    ? getMissingVariables(rootExamplePath, rootEnvPath)
    : Object.keys(exampleVars)

  const dbVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST', 'DB_PORT']
  const needsDbConfig = dbVars.some((v) => missingVars.includes(v))

  if (!needsDbConfig) {
    console.log(`\n${colorize('📊 Database Configuration', 'cyan')}`)
    console.log(`  ${colorize('✓', 'green')} Database variables already configured`)
    return {
      user: existingVars.DB_USER || 'postgres',
      password: existingVars.DB_PASSWORD || 'example',
      name: existingVars.DB_NAME || 'dropit',
      host: existingVars.DB_HOST || 'localhost',
      port: Number.parseInt(existingVars.DB_PORT || '5432', 10),
    }
  }

  console.log(`\n${colorize('📊 Database Configuration', 'cyan')}\n`)

  const user = missingVars.includes('DB_USER')
    ? await prompt('Database user', existingVars.DB_USER || exampleVars.DB_USER || 'postgres')
    : existingVars.DB_USER || 'postgres'

  const password = missingVars.includes('DB_PASSWORD')
    ? await prompt(
        'Database password',
        existingVars.DB_PASSWORD || exampleVars.DB_PASSWORD || 'example',
      )
    : existingVars.DB_PASSWORD || 'example'

  const name = missingVars.includes('DB_NAME')
    ? await prompt('Database name', existingVars.DB_NAME || exampleVars.DB_NAME || 'dropit')
    : existingVars.DB_NAME || 'dropit'

  const host = missingVars.includes('DB_HOST')
    ? await prompt('Database host', existingVars.DB_HOST || exampleVars.DB_HOST || 'localhost')
    : existingVars.DB_HOST || 'localhost'

  const portStr = missingVars.includes('DB_PORT')
    ? await prompt('Database port', existingVars.DB_PORT || exampleVars.DB_PORT || '5432')
    : existingVars.DB_PORT || '5432'
  const port = Number.parseInt(portStr, 10) || 5432

  return { user, password, name, host, port }
}

async function promptPortsConfig(): Promise<EnvConfig['ports']> {
  const apiEnvPath = join(projectRoot, 'apps/api/.env')
  const apiExamplePath = join(projectRoot, 'apps/api/.env.example')
  const envExists = existsSync(apiEnvPath)
  const existingVars = envExists ? parseEnvFile(apiEnvPath) : {}
  const exampleVars = parseEnvFile(apiExamplePath)
  const missingVars = envExists
    ? getMissingVariables(apiExamplePath, apiEnvPath)
    : Object.keys(exampleVars)

  const portsVars = ['API_PORT', 'MAILDEV_SMTP_PORT', 'MAILDEV_WEB_PORT', 'PGADMIN_PORT']
  const needsPortsConfig = portsVars.some((v) => missingVars.includes(v))

  if (!needsPortsConfig) {
    console.log(`\n${colorize('🔌 Ports Configuration', 'cyan')}`)
    console.log(`  ${colorize('✓', 'green')} Ports already configured`)
    return {
      api: Number.parseInt(existingVars.API_PORT || '3000', 10),
      maildevSmtp: Number.parseInt(existingVars.MAILDEV_SMTP_PORT || '1025', 10),
      maildevWeb: Number.parseInt(existingVars.MAILDEV_WEB_PORT || '1080', 10),
      pgadmin: Number.parseInt(existingVars.PGADMIN_PORT || '5050', 10),
    }
  }

  console.log(`\n${colorize('🔌 Ports Configuration', 'cyan')}\n`)

  const apiPortStr = missingVars.includes('API_PORT')
    ? await prompt('API port', existingVars.API_PORT || exampleVars.API_PORT || '3000')
    : existingVars.API_PORT || '3000'
  const apiPort = Number.parseInt(apiPortStr, 10) || 3000

  const maildevSmtpPortStr = missingVars.includes('MAILDEV_SMTP_PORT')
    ? await prompt(
        'MailDev SMTP port',
        existingVars.MAILDEV_SMTP_PORT || exampleVars.MAILDEV_SMTP_PORT || '1025',
      )
    : existingVars.MAILDEV_SMTP_PORT || '1025'
  const maildevSmtpPort = Number.parseInt(maildevSmtpPortStr, 10) || 1025

  const maildevWebPortStr = missingVars.includes('MAILDEV_WEB_PORT')
    ? await prompt(
        'MailDev Web port',
        existingVars.MAILDEV_WEB_PORT || exampleVars.MAILDEV_WEB_PORT || '1080',
      )
    : existingVars.MAILDEV_WEB_PORT || '1080'
  const maildevWebPort = Number.parseInt(maildevWebPortStr, 10) || 1080

  const pgadminPortStr = missingVars.includes('PGADMIN_PORT')
    ? await prompt(
        'PgAdmin port',
        existingVars.PGADMIN_PORT || exampleVars.PGADMIN_PORT || '5050',
      )
    : existingVars.PGADMIN_PORT || '5050'
  const pgadminPort = Number.parseInt(pgadminPortStr, 10) || 5050

  return {
    api: apiPort,
    maildevSmtp: maildevSmtpPort,
    maildevWeb: maildevWebPort,
    pgadmin: pgadminPort,
  }
}

async function promptLocalIpForMobile(apiPort: number): Promise<string> {
  const mobileEnvPath = join(projectRoot, 'apps/mobile/.env')
  const mobileExamplePath = join(projectRoot, 'apps/mobile/.env.example')
  const envExists = existsSync(mobileEnvPath)
  const existingVars = envExists ? parseEnvFile(mobileEnvPath) : {}

  // Check if already configured
  if (
    existingVars.EXPO_PUBLIC_API_URL &&
    !existingVars.EXPO_PUBLIC_API_URL.includes('192.168.1.XXX')
  ) {
    console.log(`\n${colorize('📱 Mobile Configuration', 'cyan')}`)
    console.log(`  ${colorize('✓', 'green')} Mobile API URL already configured`)
    // Extract IP from existing URL
    const match = existingVars.EXPO_PUBLIC_API_URL.match(/http:\/\/([^:]+)/)
    return match ? match[1] : getLocalIpAddress() || '192.168.1.1'
  }

  console.log(`\n${colorize('📱 Mobile Configuration', 'cyan')}\n`)
  console.log(
    `  ${colorize('ℹ', 'blue')} The mobile app needs your local IP address to connect to the API`,
  )

  const detectedIp = getLocalIpAddress()
  if (detectedIp) {
    console.log(`  ${colorize('✓', 'green')} Detected IP: ${colorize(detectedIp, 'bright')}`)
    const localIp = await prompt('Local IP address for mobile app', detectedIp)
    return localIp
  }

  console.log(
    `  ${colorize('⚠', 'yellow')} Could not detect local IP automatically. Please enter manually.`,
  )
  const localIp = await prompt('Local IP address for mobile app', '192.168.1.1')
  return localIp
}

function updateAllEnvFiles(config: EnvConfig): void {
  console.log(`\n${colorize('✏️  Updating .env files', 'cyan')}\n`)

  // Root .env
  const rootUpdates: Record<string, string> = {
    DB_USER: config.database.user,
    DB_PASSWORD: config.database.password,
    DB_NAME: config.database.name,
    DB_PORT: config.database.port.toString(),
    DB_HOST: config.database.host,
    DB_USER_TEST: config.database.user,
    DB_PASSWORD_TEST: config.database.password,
    DB_NAME_TEST: `${config.database.name}_test`,
    DB_PORT_TEST: '5433',
    DB_HOST_TEST: config.database.host,
    MAILDEV_HOST: 'localhost',
    MAILDEV_SMTP_PORT: config.ports.maildevSmtp.toString(),
    MAILDEV_WEB_PORT: config.ports.maildevWeb.toString(),
    PGADMIN_DEFAULT_EMAIL: 'admin@admin.com',
    PGADMIN_DEFAULT_PASSWORD: 'admin',
    PGADMIN_PORT: config.ports.pgadmin.toString(),
  }
  updateEnvFile(join(projectRoot, '.env'), rootUpdates, false)
  console.log(`  ${colorize('✓', 'green')} Updated ${colorize('.env', 'dim')}`)

  // API .env
  const apiUpdates: Record<string, string> = {
    DB_USER: config.database.user,
    DB_PASSWORD: config.database.password,
    DB_NAME: config.database.name,
    DB_PORT: config.database.port.toString(),
    DB_HOST: config.database.host,
    DB_USER_TEST: config.database.user,
    DB_PASSWORD_TEST: config.database.password,
    DB_NAME_TEST: `${config.database.name}_test`,
    DB_PORT_TEST: '5433',
    DB_HOST_TEST: config.database.host,
    NODE_ENV: 'development',
    API_PORT: config.ports.api.toString(),
    BETTER_AUTH_SECRET: config.betterAuth.secret,
    BETTER_AUTH_URL: `http://localhost:${config.ports.api}`,
    TRUSTED_ORIGINS: config.betterAuth.trustedOrigins,
    VITE_API_URL: `http://localhost:${config.ports.api}`,
    BREVO_API_KEY: '',
    EMAIL_FROM_EMAIL: '',
    EMAIL_FROM_NAME: '',
    MAILDEV_HOST: 'localhost',
    MAILDEV_SMTP_PORT: config.ports.maildevSmtp.toString(),
    MAILDEV_WEB_PORT: config.ports.maildevWeb.toString(),
    PGADMIN_DEFAULT_EMAIL: 'admin@admin.com',
    PGADMIN_DEFAULT_PASSWORD: 'admin',
    PGADMIN_PORT: config.ports.pgadmin.toString(),
  }
  updateEnvFile(join(projectRoot, 'apps/api/.env'), apiUpdates, false)
  console.log(`  ${colorize('✓', 'green')} Updated ${colorize('apps/api/.env', 'dim')}`)

  // Web .env
  const webUpdates: Record<string, string> = {
    VITE_API_URL: `http://localhost:${config.ports.api}`,
  }
  updateEnvFile(join(projectRoot, 'apps/web/.env'), webUpdates, false)
  console.log(`  ${colorize('✓', 'green')} Updated ${colorize('apps/web/.env', 'dim')}`)

  // Mobile .env
  const mobileUpdates: Record<string, string> = {
    EXPO_PUBLIC_API_URL: `http://${config.mobile.localIp}:${config.ports.api}`,
  }
  updateEnvFile(join(projectRoot, 'apps/mobile/.env'), mobileUpdates, false)
  console.log(`  ${colorize('✓', 'green')} Updated ${colorize('apps/mobile/.env', 'dim')}`)
}

async function main(): Promise<void> {
  console.log(`\n${colorize('🚀 DropIt Development Environment Setup', 'bright')}\n`)

  try {
    // Check .env files
    const envFilesInfo = checkEnvFiles()

    // Copy .env files if they don't exist
    copyEnvFiles(envFilesInfo)

    // Prompt for configuration
    const databaseConfig = await promptDatabaseConfig()
    const portsConfig = await promptPortsConfig()
    const localIp = await promptLocalIpForMobile(portsConfig.api)

    // Generate or get existing Better Auth secret
    const apiEnvPath = join(projectRoot, 'apps/api/.env')
    const existingApiVars = parseEnvFile(apiEnvPath)
    const betterAuthSecret =
      existingApiVars.BETTER_AUTH_SECRET || generateBetterAuthSecret()
    const trustedOrigins = `http://localhost:${portsConfig.api},http://localhost:5173`

    const config: EnvConfig = {
      database: databaseConfig,
      ports: portsConfig,
      betterAuth: {
        secret: betterAuthSecret,
        trustedOrigins,
      },
      mobile: {
        localIp,
      },
    }

    // Update all .env files
    updateAllEnvFiles(config)

    console.log(`\n${colorize('✅ Configuration completed successfully!', 'green')}`)
    console.log(`\n${colorize('📝 Configuration Summary:', 'cyan')}`)
    console.log(
      `  ${colorize('Database:', 'bright')} ${colorize(`${config.database.user}@${config.database.host}:${config.database.port}/${config.database.name}`, 'dim')}`,
    )
    console.log(
      `  ${colorize('API:', 'bright')} ${colorize(`http://localhost:${config.ports.api}`, 'blue')}`,
    )
    console.log(
      `  ${colorize('Web:', 'bright')} ${colorize('http://localhost:5173', 'blue')} ${colorize('(Vite default)', 'dim')}`,
    )
    console.log(
      `  ${colorize('Mobile:', 'bright')} ${colorize(`http://${config.mobile.localIp}:${config.ports.api}`, 'blue')}`,
    )
    console.log(
      `  ${colorize('MailDev:', 'bright')} ${colorize(`http://localhost:${config.ports.maildevWeb}`, 'blue')} ${colorize(`(SMTP: ${config.ports.maildevSmtp})`, 'dim')}`,
    )
    console.log(
      `  ${colorize('PgAdmin:', 'bright')} ${colorize(`http://localhost:${config.ports.pgadmin}`, 'blue')}`,
    )

    // Ask to start Docker
    let dockerStarted = false
    console.log(`\n${colorize('🐳 Docker Services', 'cyan')}`)
    const shouldStartDocker = await confirm('Start Docker services (database, maildev, pgadmin)?')

    if (shouldStartDocker) {
      try {
        await runCommand('docker', ['compose', 'up', '-d'])
        console.log(`\n  ${colorize('✓', 'green')} Docker services started`)
        dockerStarted = true

        // Wait for database to be ready
        const dbReady = await waitForDatabase()

        if (dbReady) {
          console.log(`\n${colorize('🗄️  Database Setup', 'cyan')}`)

          // Check for pending migrations
          console.log(`  ${colorize('→', 'cyan')} Checking for pending migrations...`)
          let hasPendingMigrations = false

          try {
            const checkChild = spawn(
              'pnpm',
              ['--filter', 'api', 'db:migration:check'],
              {
                cwd: projectRoot,
                stdio: 'pipe',
                shell: true,
              },
            )

            const output: string[] = []
            checkChild.stdout?.on('data', (data) => {
              output.push(data.toString())
            })
            checkChild.stderr?.on('data', (data) => {
              output.push(data.toString())
            })

            const checkExitCode = await new Promise<number>((resolve) => {
              checkChild.on('close', (code) => resolve(code ?? 0))
              checkChild.on('error', () => resolve(1))
            })

            const outputStr = output.join('')
            hasPendingMigrations = outputStr.includes('pending') || checkExitCode !== 0
          } catch {
            // If check fails, assume migrations might be needed
            hasPendingMigrations = true
          }

          if (hasPendingMigrations) {
            console.log(`  ${colorize('ℹ', 'blue')} Pending migrations detected`)
            const dbChoice = await select(
              'How do you want to set up the database?',
              [
                'Apply migrations (db:migration:up)',
                'Create database + migrate + seed (db:create + db:seed)',
                'Skip',
              ],
              0,
            )

            if (dbChoice.includes('Apply migrations')) {
              try {
                await runCommand('pnpm', ['--filter', 'api', 'db:migration:up'])
                console.log(`\n  ${colorize('✓', 'green')} Migrations applied successfully`)
              } catch (error) {
                console.error(`\n  ${colorize('⚠', 'yellow')} Migration failed:`, error)
                console.log(
                  `  ${colorize('You can run migrations manually later with:', 'dim')} ${colorize('pnpm --filter api db:migration:up', 'bright')}`,
                )
              }
            } else if (dbChoice.includes('Create database')) {
              try {
                await runCommand('pnpm', ['--filter', 'api', 'db:create'])
                await runCommand('pnpm', ['--filter', 'api', 'db:seed'])
                console.log(
                  `\n  ${colorize('✓', 'green')} Database created, migrated, and seeded successfully`,
                )
              } catch (error) {
                console.error(
                  `\n  ${colorize('⚠', 'yellow')} db:create + db:seed failed:`,
                  error,
                )
                console.log(
                  `  ${colorize('You can run setup manually later with:', 'dim')} ${colorize('pnpm --filter api db:create && pnpm --filter api db:seed', 'bright')}`,
                )
              }
            } else {
              console.log(
                `  ${colorize('→', 'cyan')} Skipped database setup. Run manually with: ${colorize('pnpm --filter api db:create && pnpm --filter api db:seed', 'bright')} or ${colorize('pnpm --filter api db:migration:up', 'bright')}`,
              )
            }
          } else {
            console.log(`  ${colorize('✓', 'green')} No pending migrations`)
            const shouldSeed = await confirm('Run database seeder to add test data?')

            if (shouldSeed) {
              try {
                await runCommand('pnpm', ['--filter', 'api', 'db:seed'])
                console.log(`\n  ${colorize('✓', 'green')} Database seeded successfully`)
              } catch (error) {
                console.error(`\n  ${colorize('⚠', 'yellow')} Seeding failed:`, error)
              }
            }
          }
        } else {
          console.log(
            `  ${colorize('→', 'cyan')} Database not ready. Run migrations manually with: ${colorize('pnpm --filter api db:migration:up', 'bright')}`,
          )
        }
      } catch (error) {
        console.error(`\n  ${colorize('⚠', 'yellow')} Failed to start Docker:`, error)
        console.log(
          `  ${colorize('You can start Docker manually with:', 'dim')} ${colorize('docker compose up -d', 'bright')}`,
        )
      }
    } else {
      console.log(
        `  ${colorize('→', 'cyan')} Skipped Docker. Start manually with: ${colorize('docker compose up -d', 'bright')}`,
      )
    }

    // Final summary
    console.log(`\n${colorize('🎉 Setup complete!', 'green')}`)
    console.log(`\n${colorize('Next steps:', 'cyan')}`)

    let step = 1
    if (!dockerStarted) {
      console.log(
        `  ${colorize(`${step}.`, 'bright')} Start Docker services: ${colorize('docker compose up -d', 'blue')}`,
      )
      step++
      console.log(
        `  ${colorize(`${step}.`, 'bright')} Run database setup: ${colorize('pnpm --filter api db:create && pnpm --filter api db:seed', 'blue')}`,
      )
      step++
    }
    console.log(`  ${colorize(`${step}.`, 'bright')} Start development: ${colorize('pnpm dev', 'blue')}\n`)
  } catch (error) {
    console.error(`\n${colorize('❌ Error during setup:', 'red')}`, error)
    process.exit(1)
  }
}

main()
