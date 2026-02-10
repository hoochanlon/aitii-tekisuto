# 一、交换机配置备份

备份要求：所有的内外网接入、汇聚、核心交换机。

使用 IPOP 软件，开启ftp服务，设置存放文件位置

![ ](https://cdn.sa.net/2024/10/28/pIm3ra1NoDjdc8X.png)

```
# 填写我们要导出配置到主机的地址
ftp 192.168.185.58

# 以默认的二进制传输
binary

# 导出
put vrpcfg.zip
```

![ ](https://cdn.sa.net/2024/10/28/RSmqcPC7nDzoHUt.png)

更简单的方式 `dis cu` 将显示的配置全部复制进记事本保存。

## 单个备份

设计思路（五个关键）：

1. 连接 ssh 登录到交换机
2. 通过 `dis cu` （display current-configuration）显示交换机配置
3. 利用标识符“ops”、“return”作为读取的结尾。
4. 读取内容到指定文本文件。
5. 通过ftp导出vrpcfg.cfg文件进行对比，利用正则剔除`dis cu` 之前的以上所有信息，保留 `dis cu` 输出的以下所有信息。

其他（todo & think）：能够写出这些，以后剩下的的配置之类的，也差不多。

* [ ] 打算写一份基于 ftp 导出的（所以命名有“导出”改成了“备份”）

* [ ] 有时间再写 display logbuffer 日志导出的

源码如下及地址：

* https://github.com/hoochanlon/scripts/tree/main/d-python-datacom
  * 单个交换机配置备份模板.py

```
import paramiko
import time
import os
from datetime import datetime
import re

# 配置交换机的信息
hostname = "192.168.1.250"  # 交换机的IP地址
username = "yonghuming"  # SSH 登录用户名
password = "Mima12345@"  # SSH 登录密码

# 动态生成备份文件名，包含日期时间
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")  # 格式化时间
current_date = datetime.now().strftime("%Y%m%d")  # 当天日期
backup_filename = f"switch_backup_{timestamp}.cfg"  # 配置备份文件名

# 获取当前用户桌面路径
desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
date_folder_path = os.path.join(desktop_path, current_date)  # 当天日期的文件夹路径
backup_filepath = os.path.join(date_folder_path, backup_filename)  # 文件完整路径

# 如果日期文件夹不存在，则创建
if not os.path.exists(date_folder_path):
    os.makedirs(date_folder_path)

# 创建 SSH 客户端
client = paramiko.SSHClient()

# 自动接受未知的主机密钥
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    # 连接到交换机
    client.connect(hostname, username=username, password=password)
    # client.connect(hostname, username=username, password=password, port=2399)

    # 打开交互式 shell
    shell = client.invoke_shell()

    # 禁用分页
    shell.send("screen-length 0 temporary\n")
    time.sleep(1)

    # 执行备份命令
    shell.send("display current-configuration\n")
    time.sleep(2)  # 等待命令执行

    output = ""
    found_ops = False  # 初始化标志位，标记是否已找到 "ops"

    while True:
        # 增加接收缓冲区大小
        part = shell.recv(8848).decode('utf-8')

        # 将输出追加到结果中
        output += part

        # 判断是否遇到 "return"
        if 'return' in part:
            found_ops = True

        # 如果找到了 "ops"，继续读取直到出现 "return"
        if found_ops and 'return' in part:
            break  # 找到 "return"，停止读取

    # 先将原始输出写入文件
    with open(backup_filepath, "w") as backup_file:
        backup_file.write(output)

    # 重新读取文件内容，应用正则清理
    with open(backup_filepath, "r") as backup_file:
        raw_content = backup_file.read()

    # 使用正则删除 dis cu 以上所有信息，保证格式与 vrpcfg.cfg 等同
    cleaned_output = re.sub(
        r"(?s).*?display current-configuration\n",
        "",
        raw_content
    )

    # 将清理后的内容写回文件
    with open(backup_filepath, "w") as backup_file:
        backup_file.write(cleaned_output)

    print(f"备份已完成，配置已保存到 {backup_filepath}")

except Exception as e:
    print(f"连接或备份过程中发生错误: {e}")

finally:
    # 关闭 SSH 连接
    client.close()
```

单个备份效果

![ ](https://cdn.sa.net/2024/11/21/hBryolkGcTUnmP9.png)

## 批量备份

设计思路：

* 在单个备份的基础上，通过读取 CSV，根据CSV的相关信息达到动态连接的目的。

  * 这样还有个好处，也能统一批量修改文件名。（简单实验后想到）

* 由于文件较多，所以在桌面生成一个当天日期文件夹来存放，后来也把这思路放在了单个备份脚本上了。

SSH内容如下

![ ](https://cdn.sa.net/2024/11/21/DTNSgerkF6iZLHo.png)

附源码地址：

* https://github.com/hoochanlon/scripts/tree/main/d-python-datacom
  * 批量交换机配置备份.py

```
import paramiko
import time
import os
import csv
from datetime import datetime
import re

# 获取当前用户桌面路径
desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")

# 动态生成当天日期的文件夹
current_date = datetime.now().strftime("%Y%m%d")  # 当天日期
date_folder_path = os.path.join(desktop_path, current_date)  # 日期文件夹路径

# 如果日期文件夹不存在，则创建
if not os.path.exists(date_folder_path):
    os.makedirs(date_folder_path)

# 读取 CSV 文件并逐行处理
csv_file_path = os.path.join(desktop_path, "SSH登记表.csv")  # 假设 CSV 文件在桌面
try:
    with open(csv_file_path, "r", encoding="utf-8") as csv_file:
        csv_reader = csv.reader(csv_file)

        for row in csv_reader:
            # 解析每一行数据
            if len(row) < 5:
                print(f"跳过格式不正确的行: {row}")
                continue

            device_name, hostname, username, password, port = row
            port = int(port)  # 将端口号转换为整数
            backup_filename = f"{device_name}.txt"  # 备份文件名
            backup_filepath = os.path.join(date_folder_path, backup_filename)  # 文件完整路径

            # 创建 SSH 客户端
            client = paramiko.SSHClient()

            # 自动接受未知的主机密钥
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            try:
                # 连接到交换机，使用动态端口
                print(f"正在连接到 {hostname} ({device_name})，端口 {port}...")
                client.connect(hostname, username=username, password=password, port=port)

                # 打开交互式 shell
                shell = client.invoke_shell()

                # 禁用分页
                shell.send("screen-length 0 temporary\n")
                time.sleep(1)

                # 执行备份命令
                shell.send("display current-configuration\n")
                time.sleep(2)  # 等待命令执行

                output = ""
                found_ops = False  # 初始化标志位，标记是否已找到 "ops"

                while True:
                    # 增加接收缓冲区大小
                    part = shell.recv(8848).decode('utf-8')

                    # 将输出追加到结果中
                    output += part

                    # 判断是否遇到 "return"
                    if 'return' in part:
                        found_ops = True

                    # 如果找到了 "ops"，继续读取直到出现 "return"
                    if found_ops and 'return' in part:
                        break  # 找到 "return"，停止读取

                # 先将原始输出写入文件
                with open(backup_filepath, "w", encoding="utf-8") as backup_file:
                    backup_file.write(output)

                # 重新读取文件内容，应用正则清理
                with open(backup_filepath, "r", encoding="utf-8") as backup_file:
                    raw_content = backup_file.read()

                # 使用正则删除 dis cu 以上所有信息，保证格式与 vrpcfg.cfg 等同
                cleaned_output = re.sub(
                    r"(?s).*?display current-configuration\n",
                    "",
                    raw_content
                )

                # 将清理后的内容写回文件
                with open(backup_filepath, "w", encoding="utf-8") as backup_file:
                    backup_file.write(cleaned_output)

                print(f"{device_name} ({hostname}) 备份完成，保存到 {backup_filepath}")

            except Exception as e:
                print(f"备份 {device_name} ({hostname}) 失败: {e}")

            finally:
                # 关闭 SSH 连接
                client.close()

except FileNotFoundError:
    print(f"CSV 文件未找到，请确认路径是否正确: {csv_file_path}")
except Exception as e:
    print(f"处理 CSV 文件时发生错误: {e}")
```

单个备份与批量备份的效果一览

![ ](https://cdn.sa.net/2024/11/21/YiJRN24cZ56MLSq.png)

![ ](https://cdn.sa.net/2024/11/21/QsDngSjA1X48JEt.png)


## 批量上传交换机配置到本地FTP

设计思路：通过本地电脑开启FTP作为服务器，然后登上交换机，交换机再通过FTP传到本地电脑去。

后续过程：在调试过程中注意到在交换机中 put 指令不支持中文名上传。先使用拼音，再改名，csv文件再新增一列拼音，方便后续从拼音替换为中文。

所需软件：IPOP，或其他FTP软件。

* https://www.52pojie.cn/thread-1127110-1-1.html  （IPOP）

地址及源码：

* https://github.com/hoochanlon/scripts/tree/main/d-python-datacom

  * 批量上传交换机配置到本地FTP.py

```
import paramiko
import time
import os
import csv

# 获取当前用户桌面路径
desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")

# 读取 CSV 文件并逐行处理
csv_file_path = os.path.join(desktop_path, "SSH登记表.csv")  # 假设 CSV 文件在桌面
# ftp_server_ip = "192.168.1.58"  # 本机的 FTP 服务 IP 地址
ftp_server_ip = "172.16.1.55"
ftp_username = "admin"  # FTP 用户名
ftp_password = "123"  # FTP 密码

try:
    with open(csv_file_path, "r", encoding="utf-8") as csv_file:
        csv_reader = csv.reader(csv_file)

        for row in csv_reader:
            # 解析每一行数据
            if len(row) < 6:  # 如果行的列数不足，跳过
                print(f"跳过格式不正确的行: {row}")
                continue

            device_name, alias_name, hostname, username, password, port = row
            port = int(port)

            print(f"正在连接到 {hostname} ({device_name})，端口 {port}...")

            # FTP 文件名（初始为 alias_name）
            ftp_filename = f"{alias_name}_backup.zip"

            # 创建 SSH 客户端
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            try:
                # 连接到交换机
                client.connect(hostname, port=port, username=username, password=password)

                # 打开交互式 shell
                shell = client.invoke_shell()
                time.sleep(1)

                # 启动 FTP 服务上传文件
                shell.send(f"ftp {ftp_server_ip}\n")
                time.sleep(2)
                shell.send(f"{ftp_username}\n")  # 输入 FTP 用户名
                time.sleep(1)
                shell.send(f"{ftp_password}\n")  # 输入 FTP 密码
                time.sleep(1)

                # 上传配置文件
                print(f"开始上传配置文件到 FTP 服务器，文件名: {ftp_filename}")
                shell.send("binary\n")  # 切换到二进制模式
                shell.send(f"put vrpcfg.zip {ftp_filename}\n")  # 上传文件
                time.sleep(5)  # 等待上传完成

                # 退出 FTP
                shell.send("quit\n")
                time.sleep(1)

                # 重命名为 device_name
                new_filename = f"{device_name}_backup.zip"
                local_path = os.path.join(desktop_path,"本机开启FTP交换机上传文件到此目录", ftp_filename) # 拼接 FTP服务器保存的指定目录
                renamed_path = os.path.join(desktop_path,"本机开启FTP交换机上传文件到此目录", new_filename)

                if os.path.exists(local_path):  # 如果文件存在，重命名为中文名
                    os.rename(local_path, renamed_path)
                    print(f"文件已重命名为: {renamed_path}")
                else:
                    print(f"文件上传后未找到: {local_path}")

            except Exception as e:
                print(f"处理设备 {device_name} ({hostname}) 时出错: {e}")

            finally:
                client.close()

except FileNotFoundError:
    print(f"CSV 文件未找到，请确认路径是否正确: {csv_file_path}")
except Exception as e:
    print(f"处理 CSV 文件时发生错误: {e}")

```

效果

![ ](https://cdn.sa.net/2024/11/22/qUe9pgjftKhaG8d.png)

