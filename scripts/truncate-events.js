import { readFileSync, writeFileSync } from "fs"

const filePath = "/vercel/share/v0-project/lib/events.ts"
const lines = readFileSync(filePath, "utf8").split("\n")

// Keep only lines 1-3399 (0-indexed: 0-3398) plus a final newline
const cleanLines = lines.slice(0, 3399)
writeFileSync(filePath, cleanLines.join("\n") + "\n")
console.log("[v0] File truncated to", cleanLines.length, "lines")
console.log("[v0] Last line:", cleanLines[cleanLines.length - 1])
