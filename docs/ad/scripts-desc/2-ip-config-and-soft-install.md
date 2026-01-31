# 快捷修改IP与软件安装自动化

## 自动静默所有软件

实现与解读

https://github.com/hoochanlon/scripts/blob/main/d-pwsh/ez_auto_install.ps1 源码附上及加注释说明。


```powershell
# 说明
# 对福昕PDF阅读器同类别的打包方式程序，静默不起作用；钉钉正常。
echo "提示：把需要自动安装的软件，拷贝到下载目录文件夹即可。"

# foreach遍历目录
$rawPath = "C:${Env:\HOMEPATH}\Downloads\";
$allFile = Get-ChildItem -Path $rawPath;
foreach ($file in $allFile)
{
# 转成文件路径字符串。
$softname="C:${Env:\HOMEPATH}\Downloads\"+$file.name
# Write-Host $softname
Start-Process -Wait -FilePath $softname -ArgumentList '/S /SP- /VERYSILENT /NORESTART /SUPPRESSMSGBOXES /FORCE' -PassThru
}
echo "ok"
# [cnblogs-powershell 遍历目录](https://www.cnblogs.com/068XS228/p/15466163.html)
# [cnblogs-Windows软件静默安装 ](https://www.cnblogs.com/toor/p/4198061.html)
# [csdn-如何在Windows PowerShell中获取当前的用户名？](https://blog.csdn.net/CHCH998/article/details/107726143)
# [cnblogs-提高GitHub的访问速度](https://www.cnblogs.com/lemonguess/p/15143645.html)
```

核心就两逻辑：一、在已有静默安装的前提选项上，我需要知道文件夹下面的所有软件名；二、每遍历一次目录、文件什么的，网上这样样例玩具代码，一抓一大把；配合上自己的逻辑思想，得发挥作用才行；每执行一遍静默安装就好了，把遍历过的自变量投射到静默安装指令上就行了。

单提下静默安装，我查了下资料，这些参数和软件打包方式有关，索性都加上吧。还有个/FORCE ，虽然文章没提，但我加上后测试也没报错。

[cnblogs - Windows软件静默安装](https://www.cnblogs.com/toor/p/4198061.html)

```cmd
Start-Process -Wait -FilePath $softname -ArgumentList '/S /SP- /VERYSILENT /NORESTART /SUPPRESSMSGBOXES /FORCE' -PassThru
```

测试效果：基本上不少软件都支持静默安装，除了对福昕PDF阅读器同类别的打包方式程序，静默安装不起作用。钉钉原则上是不支持静默安装的，参考[钉钉帮助中心](https://www.dingtalk.com/qidian/helpCenter/pcPage)，但目前代码测试正常，也可能是我用离线版安装包的缘故包吧。


## 简化批量装机配置IP步骤

https://github.com/hoochanlon/scripts/blob/main/d-pwsh/ez_edit_net.ps1 ，源码修改网络的每项配置都整合在一起，并不方便拿来用。并且我考虑到文件要正常执行，到最后也是还原为动态获取，变更了下dns罢了。

### 常用三项

**写死型IP配置，三项为：IP、掩码、网关**

```cmd
netsh interface ip set address "以太网" static 192.168.1.123 255.255.255.0  192.168.1.1
```

写死型DNS配置

```cmd
Set-DnsClientServerAddress -InterfaceAlias "以太网" -ServerAddresses ("114.114.114.114","8.8.8.8")
```

动态IP与DNS

```cmd
netsh interface ip set address "以太网" dhcp
netsh interface ip set dnsservers "以太网" source=dhcp
```

### IP调试与测试用（装机也是常用项）

手动输入IP，保存就好。子网掩码、网关、DNS根据自己所在公司内部局域网环境改动就好。

```cmd
# 1. 保存改写IP、DNS之前历史信息
netsh interface ip show config > ipbak.txt
## 1.2 打印必要提示
echo "cmd运行 ipbak.txt 查看备份信息；扔入垃圾桶：del ipbak.txt"
# 2. 修改IP、子网掩码、网关
$input_ip = Read-Host "输入IP地址";netsh interface ip set address "以太网" static $input_ip 255.255.255.0  192.168.1.1
# 3. 设置DNS，并打印OK
Set-DnsClientServerAddress -InterfaceAlias "以太网" -ServerAddresses ("114.114.114.114","8.8.8.8");echo "OK"
```

逻辑基本也在注释里了，基本上每条指令都能单独拿出来用，挺方便。


### 从网站获取dns（较少使用，可实现罢了）

个人整活，普及性来说意义不太大。

```
# 扩展：反向解析 nslookup -ty=ptr 1.1.1.1

# 1. 从nslookup解析网址中，获取到索引行dns记录，注入文本；dns.sb是一个dns域名。
nslookup dns.sb|Select-Object -Index 4 >dns-w.txt
# 2. 获取dns-w.txt文本内容，利用正则筛选出IP地址，$matches[0]取值
(Get-Content dns-w.txt) -match '\d+\.\d+\.\d+\.\d+'; $get_dns_num = $matches[0]
# 设置dns，将变量参数填入进去
Set-DnsClientServerAddress -InterfaceAlias "以太网" -ServerAddresses ($get_dns_num)
# 顺便把解析记录文本删掉，打印ok
del dns-w.txt;echo "ok"
```

## 测试效果图

自动安装

![](https://fastly.jsdelivr.net/gh/hoochanlon/scripts/AQUICK/1278564751CE.png)

IP配置powershell脚本运行正常

![](https://fastly.jsdelivr.net/gh/hoochanlon/scripts/AQUICK/catch2023-02-14%2016.12.19.png)
