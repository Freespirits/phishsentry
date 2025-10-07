import { defineConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const target = process.env.TARGET === 'firefox' ? 'firefox' : 'chrome';
const manifestPath = path.resolve(__dirname, `manifest.${target}.json`);

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Manifest file not found for target: ${target}`);
}

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, 'dist', target),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        'background/index': path.resolve(__dirname, 'src/background/index.ts'),
        'content/gmail': path.resolve(__dirname, 'src/content/gmail.ts'),
        'content/social': path.resolve(__dirname, 'src/content/social.ts'),
        'content/web': path.resolve(__dirname, 'src/content/web.ts'),
      },
      output: {
        entryFileNames: (chunk) => `${chunk.name}.js`,
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  define: {
    __TARGET__: JSON.stringify(target),
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: manifestPath,
          dest: '.',
          rename: 'manifest.json',
        },
      ],
    }),
  ],
});
