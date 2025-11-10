const fs = require("fs");
const path = require("path");

exports.default = async function (context) {
  const { appOutDir, electronPlatformName } = context;

  if (electronPlatformName === "darwin") {
    // Make sure the next binary is executable on macOS
    const nextBinPath = path.join(
      appOutDir,
      "dehive-frontend.app",
      "Contents",
      "Resources",
      "app",
      "node_modules",
      ".bin",
      "next"
    );
    if (fs.existsSync(nextBinPath)) {
      fs.chmodSync(nextBinPath, "755");
    }
  }
};
