#!/usr/bin/env bun
import { Command } from "commander";
import pkg from "./package.json";
import PMB from "./src/process/pmb";

const pmb = new PMB();
const program = new Command();

program
  .name("PMB")
  .description("P(rocess) M(anager) for B(un)")
  .version(pkg.version);

program
  .command("start")
  .description("Start a bun service from the input entry")
  .argument("<entry>", "start a bun service from the entry file")
  .option("-n, --name <process-name>", "create a name for the service")
  .action((entry, options) => {
    pmb.start(entry, options?.name);
  });

program
  .command("stop")
  .description("Stop a bun service from the pid or name")
  .option("-p, --pid <process-id>", "stop a bun service from the process id")
  .option(
    "-n, --name <process-name>",
    "stop a bun service from the process name"
  )
  .action((str, options) => {
    console.log(str, options);
  });

program
  .command("ls")
  .description("Show list of bun service")
  .action(() => {
    pmb.list();
  });

program.parse();
