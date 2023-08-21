#!/usr/bin/env bun
import { Command } from "commander";
import pkg from "./package.json";
import PMB from "./src/local/pmb";
import { L } from "./src/shared/utils";

const pmb = new PMB();
const program = new Command();

L.Logo();

program
  .name("PMB")
  .description("P(rocess) M(anager) for B(un)")
  .version(pkg.version);

program
  .command("start")
  .description("Start a bun service from the input entry")
  .argument("<entry>", "start a bun service from the entry file")
  .option("-n, --name <process-name>", "create a name for the service")
  .option(
    "-s, --starter <starter-program>",
    "using the starter to launch service"
  )
  .action((entry, options) => {
    pmb.start(entry, options?.name, options?.starter);
  });

program
  .command("stop")
  .description("Stop a bun service from the pid or name")
  .option("-p, --pid <process-id>", "stop a bun service from the process id")
  .option(
    "-n, --name <process-name>",
    "stop a bun service from the process name"
  )
  .action(({ name, pid }) => {
    if (name) {
      pmb.stop("name", name);
    } else if (pid) {
      pmb.stop("pid", pid);
    }
  });

program
  .command("rm")
  .description("Stop and remove a bun service from the pid or name")
  .option("-p, --pid <process-id>", "by the process id")
  .option("-n, --name <process-name>", "by the process name")
  .action(({ name, pid }) => {
    if (name) {
      pmb.rm("name", name);
    } else if (pid) {
      pmb.rm("pid", pid);
    }
  });

program
  .command("ls")
  .description("Show list of bun service")
  .action(() => {
    pmb.list();
  });

program
  .command("ui")
  .description("Show list of bun service in browser")
  .action(() => {
    pmb.ui();
  });

program.parse();
