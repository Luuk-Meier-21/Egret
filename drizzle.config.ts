import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  driver: "libsql",
  dbCredentials: {
    url: ":memory:",
  },
  verbose: true,
  strict: true,
  out: "./src-tauri/migrations",
});
