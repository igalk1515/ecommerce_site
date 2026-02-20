import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Missing command");
  process.exit(1);
}

const child = spawn(command, args, { stdio: "inherit", shell: true, env: process.env });
child.on("exit", (code) => process.exit(code ?? 1));

