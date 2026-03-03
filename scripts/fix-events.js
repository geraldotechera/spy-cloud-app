import { readFileSync, writeFileSync } from "fs"

const filePath = "/vercel/share/v0-project/lib/events.ts"
const content = readFileSync(filePath, "utf8")
const lines = content.split("\n")

console.log("[v0] Total lines before:", lines.length)

// Find the last occurrence of "export { budget }"
let lastExportLine = -1
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === "export { budget }") {
    lastExportLine = i
    break
  }
}

console.log("[v0] Last export { budget } at line:", lastExportLine + 1)

// Keep only up to and including the last "export { budget }"
const cleanLines = lines.slice(0, lastExportLine + 1)
writeFileSync(filePath, cleanLines.join("\n") + "\n")

console.log("[v0] Written", cleanLines.length, "lines")
console.log("[v0] Last 3 lines:")
console.log(cleanLines.slice(-3).join("\n"))
