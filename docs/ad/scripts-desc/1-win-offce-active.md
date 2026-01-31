# 一键切换Windows系统版本与激活Windows及Office

## 执行部分

启动命令行，复制命令粘贴进去。这里做了CDN之类的处理，暂不用担心网络问题。

```cmd
curl -O https://ghproxy.com/https://raw.githubusercontent.com/TerryHuangHD/Windows10-VersionSwitcher/master/Switch.bat&&TIMEOUT /T 1&&start Switch.bat&&powershell -command "irm https://massgrave.dev/get|iex"
```

灵感来自这两个项目：[Windows10-VersionSwitcher](https://github.com/TerryHuangHD/Windows10-VersionSwitcher) 与 [Microsoft-Activation-Scripts](https://massgrave.dev/)。一个切换Windows版本的，一个是激活微软产品的。两者进行整合一步到位。

简单概括下CMD执行目的：就是读取网页运行代码获取产品不同的Windows版本，再调用远程服务器激活微软服务。

switch的残留借助everything搜索删掉就好了。附上效果图。

![](https://s1.ax1x.com/2023/02/08/pS2DaSe.png)

![](https://s1.ax1x.com/2023/02/08/pS2DNWD.png)


## 简单说明

**Windows10-VersionSwitcher**

挑几个Windows10-VersionSwitcher源码来说下吧。做一个按键选择跳转，1是goto到pro，2是pro VL版

```cmd
set choice=
set /p choice=Select Version:

if not '%choice%'=='' set choice=%choice:~0,1%
if '%choice%'=='1' goto to_pro
if '%choice%'=='2' goto to_pro_vl
```

这里可以看到这项目连base64都没做的，明文密钥。

```cmd
:to_pro
changepk /ProductKey VK7JG-NPHTM-C97JM-9MPGT-3V66T
goto finish

:to_pro_vl
changepk /ProductKey W269N-WFGWX-YVC9B-4J6C9-T83GX
goto finish
```

**Microsoft-Activation-Scripts**

[Microsoft-Activation-Scripts](https://github.com/massgravel/Microsoft-Activation-Scripts) 项目，irm获取到文本内容，管道传至远程服务仓，iex利用反弹原理，调用的另一个cmd做验证。

```cmd
irm https://massgrave.dev/get | iex
```

massgrave.dev/get 部分源码

```cmd
$DownloadURL = 'https://raw.githubusercontent.com/massgravel/Microsoft-Activation-Scripts/master/MAS/All-In-One-Version/MAS_AIO.cmd'
$DownloadURL2 = 'https://gitlab.com/massgrave/microsoft-activation-scripts/-/raw/master/MAS/All-In-One-Version/MAS_AIO.cmd'
```

$downloadURL的源码链接，发现也是个明文...

![](https://s1.ax1x.com/2023/02/08/pS2ynW8.png)
