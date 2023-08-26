<pre>
    ____  __  _______
   / __ \/  |/  / __ )
  / /_/ / /|_/ / __  |
 / ____/ /  / / /_/ /
/_/   /_/  /_/_____/
</pre>

# P(rocess) M(anager) for B(un)

简体中文 | [English](README.md)

## 安装 bun 环境

```bash
curl -fsSL https://bun.sh/install | bash
```

## 安装 pm-bun

```bash
bun add -g pm-bun
```

## 查看 pmb 用法
```bash
pmb -h
pmb <command> -h
```

## 常用命令

- `ls` 列出通过PMB启动的服务

```bash
pmb ls 
```

- `start` 通过项目入口文件启动一个服务

```bash
# pmb start <entry-file-path> [-n name] [-s starter]
pmb start path/app.ts
pmb start path/bun-app.ts -n app
# 默认使用 [bun] 启动，等价于 [-s bun]

pmb start path/bun-app.ts -n bun-app -s bun
pmb start path/node-app.js -n node-project -s node
pmb start path/deno-app.ts -n deno-project -s 'deno run -A'

```

- `stop` 通过名称或者PID停止服务

```bash
# pmb stop <name-or-pid>
pmb stop node-app
pmb stop 12345
```

- `restart` 通过名称或者PID重启服务

```bash
# pmb restart <name-or-pid>
pmb restart bun-app
pmb restart 12346
```

- `rm` 通过名称或者PID停止并删除服务

```bash
# pmb rm <name-or-pid>
pmb rm deno-app
pmb rm 12347
```

- `log` 通过名称或者PID查询服务日志

```bash
# pmb log <name-or-pid>
pmb log node-app
pmb log 12345
```

- `daemon` 管理守护进程

```bash
# pmb daemon <status | start | stop | restart>
pmb daemon status   # 查看守护进程状态
pmb daemon start    # 启动守护进程
pmb daemon stop     # 停止守护进程
pmb daemon restart  # 重启守护进程
```

- `ui` 在浏览器中列出通过PMB启动的服务

```bash
# pmb ui [-e] [-d]
pmb ui     # 在浏览器中列出通过PMB启动的服务
pmb ui -e  # 启用 Web UI 功能
pmb ui -d  # 停用 Web UI 功能
```

- `lang` 切换展示语言, 中英切换

```bash
pmb lang
```
