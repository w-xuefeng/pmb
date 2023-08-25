#!/usr/bin/env bun
import { Command } from "commander";
import pkg from "./package.json";
import PMB from "./src/local/pmb";
import { L } from "./src/shared/utils";
import { useI18n } from "./src/langs/i18n";

const pmb = new PMB();
const program = new Command();
const { t } = await useI18n();

L.Logo();

program.name("PMB").description(t("cli.pmb.description")).version(pkg.version);

program
  .command("start")
  .description(t("cli.start.description"))
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
  .command("restart")
  .description(t("cli.restart.description"))
  .argument("<name-or-pid>", "start a bun service from the name or pid")
  .action((value) => {
    if (isNaN(value)) {
      pmb.restart("name", value);
    } else {
      pmb.restart("pid", value);
    }
  });

program
  .command("stop")
  .description(t("cli.stop.description"))
  .argument("<name-or-pid>", "stop a bun service from the name or pid")
  .action((value) => {
    if (isNaN(value)) {
      pmb.stop("name", value);
    } else {
      pmb.stop("pid", value);
    }
  });

program
  .command("rm")
  .description(t("cli.rm.description"))
  .argument(
    "<name-or-pid>",
    "stop and remove a bun service from the name or pid"
  )
  .action((value) => {
    if (isNaN(value)) {
      pmb.rm("name", value);
    } else {
      pmb.rm("pid", value);
    }
  });

program
  .command("log")
  .description(t("cli.log.description"))
  .argument("<name-or-pid>", t("cli.log.description"))
  .action((value) => {
    if (isNaN(value)) {
      pmb.log("name", value);
    } else {
      pmb.log("pid", value);
    }
  });

program
  .command("ls")
  .description(t("cli.ls.description"))
  .action(() => {
    pmb.list();
  });

program
  .command("daemon")
  .description(t("cli.daemon.description"))
  .argument(
    "<action>",
    "action implemented on the daemon, Eg: status, start, stop, restart"
  )
  .action((actions) => {
    pmb.daemon(actions);
  });

program
  .command("ui")
  .description(t("cli.ui.description"))
  .action(() => {
    pmb.ui();
  });

program
  .command("lang")
  .description(t("cli.lang.description"))
  .action(() => {
    pmb.setLang();
  });

program.parse();
