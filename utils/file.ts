import { mkdirSync, writeFileSync } from "node:fs";
import { glob } from "glob";
import { resolve } from "path";

export { existsSync, unlinkSync } from "node:fs";

export const ROOT_DIR = resolve(import.meta.dir, "..");

export function pathJoin(
  prevPath: string | number | (string | number)[],
  nextPath: string | number | (string | number)[],
  separator = "/"
) {
  const handleSinglePath = (singlePath: string | number) => {
    return `${singlePath}`.endsWith(separator)
      ? `${singlePath}`.substring(0, `${singlePath}`.length - 1)
      : `${singlePath}`;
  };
  const pp = Array.isArray(prevPath)
    ? prevPath.map(handleSinglePath).join(separator)
    : handleSinglePath(prevPath);
  const np = Array.isArray(nextPath)
    ? nextPath.map(handleSinglePath).join(separator)
    : handleSinglePath(nextPath);
  if (!pp) {
    return `${np}`;
  }
  return `${pp}${separator}${np}`;
}

export function createPathSync(
  type: "file" | "dir",
  path: string,
  content: string = ""
) {
  if (type === "dir") {
    mkdirSync(path, { recursive: true });
    return;
  }
  const paths = path.split("/");
  paths.pop();
  const dirPath = paths.join("/");
  mkdirSync(dirPath, { recursive: true });
  writeFileSync(path, content);
}

export function getFilesFromDir(dir: string, fileType = "*") {
  return glob(resolve(dir, fileType));
}
