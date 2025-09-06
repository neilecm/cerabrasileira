import fs from "fs"
import path from "path"

const envExamplePath = path.resolve(process.cwd(), ".env.example")

const content = fs.readFileSync(envExamplePath, "utf-8")
const required = content
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split("=")[0])

const missing = required.filter((key) => !process.env[key])

if (missing.length) {
  console.error(
    `Missing environment variables: ${missing.join(", ")}`
  )
  process.exit(1)
}

console.log("All required environment variables are set.")
