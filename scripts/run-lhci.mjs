import { spawn } from "node:child_process";
import os from "node:os";
import { chromium } from "playwright";

const isLinux = process.platform === "linux";
const tempDir = os.tmpdir();

const child = spawn(
  "npx",
  ["lhci", "autorun", "--config=.lighthouserc.cjs"],
  {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      CHROME_PATH: process.env.CHROME_PATH || chromium.executablePath(),
      APPDATA: isLinux ? tempDir : process.env.APPDATA,
      LOCALAPPDATA: isLinux ? tempDir : process.env.LOCALAPPDATA,
      TEMP: isLinux ? tempDir : process.env.TEMP,
      TMP: isLinux ? tempDir : process.env.TMP,
      TMPDIR: isLinux ? tempDir : process.env.TMPDIR,
    },
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
