import { resolve } from "path";

const CONST_FILE_PATH = resolve(
  import.meta.dir,
  "../src/shared/const/index.ts"
);

const env = process.argv.slice(2)[0];

async function setEnv(env: string) {
  const bunFile = Bun.file(CONST_FILE_PATH);
  const content = await bunFile.text();
  const next = content.replace(
    /export const __DEV__ = (\w{4,5});/,
    `export const __DEV__ = ${env === "dev"};`
  );
  await Bun.write(CONST_FILE_PATH, next);
}

await setEnv(env);
