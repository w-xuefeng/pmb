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
  .argument("<entry>", t("cli.start.entry"))
  .option("-n, --name <process-name>", t("cli.start.name"))
  .option("-s, --starter <starter-program>", t("cli.start.starter"))
  .action((entry, options) => {
    pmb.start(entry, options?.name, options?.starter);
  });

program
  .command("restart")
  .description(t("cli.restart.description"))
  .argument("<name-or-pid>", t("cli.restart.nameOrPid"))
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
  .argument("<name-or-pid>", t("cli.stop.nameOrPid"))
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
  .argument("<name-or-pid>", t("cli.rm.nameOrPid"))
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
  .argument("<action>", t("cli.daemon.action"))
  .action((actions) => {
    pmb.daemon(actions);
  });

program
  .command("ui")
  .description(t("cli.ui.description"))
  .option("-e, --enabled", t("cli.ui.enabled"))
  .option("-d, --disabled", t("cli.ui.disabled"))
  .action(({ enabled, disabled }) => {
    pmb.ui(enabled ? true : disabled ? false : void 0);
  });

program
  .command("lang")
  .description(t("cli.lang.description"))
  .action(() => {
    pmb.setLang();
  });

program.parse();
