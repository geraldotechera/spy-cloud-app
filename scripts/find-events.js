import { readdirSync, statSync } from "fs"
import { join } from "path"

function findFile(dir, target, depth = 0) {
  if (depth > 4) return null
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      if (entry === "node_modules" || entry === ".git") continue
      const full = join(dir, entry)
      if (entry === target) {
        console.log("[v0] Found:", full)
        return full
      }
      try {
        if (statSync(full).isDirectory()) {
          const found = findFile(full, target, depth + 1)
          if (found) return found
        }
      } catch {}
    }
  } catch {}
  return null
}

console.log("[v0] Searching from /home/user ...")
findFile("/home/user", "events.ts")
console.log("[v0] Searching from /vercel ...")
findFile("/vercel", "events.ts")
console.log("[v0] Done searching")
