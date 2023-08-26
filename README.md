<pre>
    ____  __  _______
   / __ \/  |/  / __ )
  / /_/ / /|_/ / __  |
 / ____/ /  / / /_/ /
/_/   /_/  /_/_____/
</pre>

# P(rocess) M(anager) for B(un)

[简体中文](README_zh.md) | English

## install bun

```bash
curl -fsSL https://bun.sh/install | bash
```

## install pm-bun

```bash
bun add -g pm-bun
```

## use pmb
```bash
pmb -h
pmb <command> -h
```

## Commands

- `ls` Show list of service started by pmb

```bash
pmb ls 
```

- `start` Start a service from the entry file

```bash
# pmb start <entry-file-path> [-n name] [-s starter]
pmb start path/app.ts
pmb start path/bun-app.ts -n bun-app
pmb start path/node-app.js -n node-project -s node
pmb start path/deno-app.ts -n deno-project -s 'deno run -A'

```

- `stop` Stop a service from the pid or name

```bash
# pmb stop <name-or-pid>
pmb stop node-app
pmb stop 12345
```

- `restart` Restart a service from the name or pid

```bash
# pmb restart <name-or-pid>
pmb restart bun-app
pmb restart 12346
```

- `rm` Stop and remove a service from the pid or name

```bash
# pmb rm <name-or-pid>
pmb rm deno-app
pmb rm 12347
```

- `log` Show log of service from the pid or name

```bash
# pmb log <name-or-pid>
pmb log node-app
pmb log 12345
```

- `daemon` Manage daemon process

```bash
# pmb daemon <status | start | stop | restart>
pmb daemon status
pmb daemon start
pmb daemon stop
pmb daemon restart
```

- `ui` Show list of service started by pmb in browser

```bash
# pmb ui [-e] [-d]
pmb ui     # Show list of service started by pmb in browser
pmb ui -e  # enabled Web UI
pmb ui -d  # disabled Web UI
```

- `lang` Switch display language between Chinese and English

```bash
pmb lang
```
