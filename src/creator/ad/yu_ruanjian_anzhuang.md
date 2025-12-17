# 使用组策略部署软件

> .exe 需要打包成 .msi 格式才能自动安装，使用【计算机配置】安装，将不能采用【在登录时安装此程序】的选项。

> 组织单元中还有一层子组织单元（为了方便叙述，将其表述为父级、子级目录），如果组策略在父目录，将不生效于子目录，子目录的组策略也不会影响父目录。

> 组策略提供的软件安装属于一次性的安装策略，之后卸载再登录也不会安装了，除非注销登录到一台新机器上。

## 安装软件 

> 适合安装钉钉、飞书、企业微信、WPS2019大小及以下的软件，不太适合Office、Autodesk等上GB的大型软件，越大的软件安装时间越长，开机等待时间越久。

以两个不同版本的 nodejs.msi 做为测试，以及共享软件文件夹 Everyone 的【共享】、【安全】只保留读取，还有相关测试组织单元及用户，如图。

![ ](https://s2.loli.net/2024/10/06/ZNg1OkVEKD4eyAw.png)

![ ](https://s2.loli.net/2024/10/06/mjtuJc9FUd6kzv7.png)

在【组策略对象】创建组策略，把相应组策略拖入要应用的组织单元，右击【编辑】，进入到【用户配置】-> 【策略】-> 【软件安装】，右击其【属性】，添加网络共享的软件目录。（图片可放大查看，稍有不周，对此以后留心。）

![ ](https://s2.loli.net/2024/10/06/fEmHUjMaov89CPY.png)

右击【软件安装】，选择【数据包】，添加相应安装软件，选择【已分配】；之后在安装软件的【属性】中选择【在登录时安装此应用程序】。

![ ](https://s2.loli.net/2024/10/06/Bos8lRjy79ePNzU.png)

然后在域控命令行中输入 `gpupdate`，并查看其中组织单元中的域用户登录情况。

![ ](https://s2.loli.net/2024/10/06/Gepg72C4oAETzVm.png)

![ ](https://s2.loli.net/2024/10/06/CN3dq9AcJb6pvEW.png)


## 升级软件

> 不少软件是需要删除旧版软件才能安装新版，稳妥起见可选替换。

> 不同电脑登录组织单元的同一域账户，需要在以前的主机注销该账户，才能保证登录下一台组策略生效。

同上，右击【软件安装】，选择【数据包】，添加相应安装软件，并在新版本的【属性】中选择 【在登录时安装此应用程序】。

![ ](https://s2.loli.net/2024/10/07/aMHifICTygG7SvO.png)

勾选 【现有程序包所需的升级】（不勾选，易不生效）

![ ](https://s2.loli.net/2024/10/07/ico5XuM2aIVRbJ7.png)

查看结果

![ ](https://s2.loli.net/2024/10/07/rbRn5jVpm4LQZXU.png)

![ ](https://s2.loli.net/2024/10/07/PuUo1TNLZhJ8bYs.png)


## 参考资料

* [何星星 - AD域部署分发安装软件](https://hexingxing.cn/ad-domain-deployment-distribution-and-installation-software)
* [上官飞鸿 - 域控组策略日常分发、安装、软件的小结](https://www.cnblogs.com/jackadam/p/18209167)
* [刘记 - Windows 组策略的生效规则](https://zhuanlan.zhihu.com/p/672784755)
* [飘渺的尘埃 - 域学习笔记九：使用组策略部署软件](https://www.cnblogs.com/atomy/p/13727152.html)

