import { glob } from "glob";
import { resolve } from "path";

const a = await glob(resolve(import.meta.dir, "*.ts"));

console.log(a);
