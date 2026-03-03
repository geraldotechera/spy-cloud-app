import { readFileSync, writeFileSync, existsSync } from "fs"

// Try multiple possible paths
const candidates = [
  "/vercel/share/v0-project/lib/events.ts",
  "/vercel/share/v0-next-shadcn/lib/events.ts",
  "/home/user/v0-project/lib/events.ts",
]

let filePath = null
for (const p of candidates) {
  if (existsSync(p)) {
    filePath = p
    break
  }
}

if (!filePath) {
  console.error("[v0] ERROR: Could not find events.ts in any candidate path")
  process.exit(1)
}

console.log("[v0] Found file at:", filePath)
const content = readFileSync(filePath, "utf8")
const lines = content.split("\n")
console.log("[v0] Total lines before:", lines.length)

// Find the FIRST occurrence of "export { budget }"
let firstExportLine = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "export { budget }") {
    firstExportLine = i
    break
  }
}

if (firstExportLine === -1) {
  console.error("[v0] ERROR: Could not find 'export { budget }' in file")
  process.exit(1)
}

console.log("[v0] First export { budget } at line:", firstExportLine + 1)

// Keep only up to and including the first "export { budget }"
const cleanLines = lines.slice(0, firstExportLine + 1)
writeFileSync(filePath, cleanLines.join("\n") + "\n")

console.log("[v0] Written", cleanLines.length, "lines")
console.log("[v0] Last 3 lines:")
console.log(cleanLines.slice(-3).join("\n"))
console.log("[v0] Done!")
