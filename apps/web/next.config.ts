import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone", // needed for the Docker / Azure Container Apps deploy
};

export default config;
