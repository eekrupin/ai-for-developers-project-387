const chromePath = process.env.CHROME_PATH;

module.exports = {
  ci: {
    collect: {
      url: ["http://127.0.0.1:3000/"],
      numberOfRuns: 1,
      chromePath,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage --disable-gpu --headless",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lighthouse-report",
    },
  },
};
