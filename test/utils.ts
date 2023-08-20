import { L } from "../utils";

L.success("start ok!", "yes", "123");

L.warn("please upgrade your local pmb version!", "no", "456");

L.color(
  ["  a  ", "  b  ", "  c  ", "  d  "],
  ["black", "blue", "cyan", "gray"]
);

L.color(
  ["  abcdef  ", "  abcdef  ", "  abcdef  ", "  abcdef  "],
  ["rainbow", "dim", "italic", "strikethrough"],
  [, , "bgMagenta", "bgCyan"]
);

L.color(
  ["  a  ", "  b  ", "  c  ", "  d  "],
  ["bgWhite", "bgBlue", "bgCyan", "bgCyan"]
);
