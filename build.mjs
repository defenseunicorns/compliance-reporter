/* eslint-disable no-undef */

import { analyzeMetafile, build } from "esbuild";

const buildOpts = {
  bundle: true,
  format: "cjs",
  legalComments: "eof",
  metafile: true,
  platform: "node",
};

async function builder() {
  try {
    // Build the library
    const lib = await build({
      ...buildOpts,
      entryPoints: ["src/index.ts"],
      outfile: "dist/index.js",
      sourcemap: true,
    });

    console.log(await analyzeMetafile(lib.metafile));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

builder();
