# 创建域控

## 工作组的不足

没安装域控的情况下，如果其他服务器有该电脑的同名同密码的账户，可直接输入此账户访问网络资源，这比较危险。

* 没办法统一管理
* 没办法集中身份验证

## 域环境说明

有活动目录的计算机就是域控制器，域控制器就是中央，域用户就是成员，组策略就是指示。

域控与成员之间有一套信任密钥机制（Netlogon 网络登录服务），默认四十多天，相关主机还原操作易造成信任丢失，只能重新加入到域了。

另外，域控不能用 Ghost，需要用 wim 安装，因为SID不能重复。

### 集中身份验证说明

![ ](https://i.postimg.cc/26c43kyf/Pix-Pin-2024-10-04-17-39-59.png)

之前的信任密钥加密生成的，用做身份验证，域控还会有域控自己的一套密钥交再给计算机，用来完成访问域控网络其他计算机资源。

由密钥解密后的域用户、组、本地用户，加上一些系统设置的特权，绑定到计算机的令牌。域成员之间的访问，需要将令牌传递到域控。

> 注意：域控坏了，此前登录过的账户在本地还可以的，因为有缓存，但也可以设置不让登录。

### DNS 定位域控制器说明

DNS 作用负责将域名解析成 IP 地址。域控向 DNS 注册 SRV（服务器资源记录），计算机通过 SRV 记录找到域控。

域名解析不是由本地连接的 DNS 解析的，域控只要能上网，它就能够解析出来，是不需要指向 Internet 上的 DNS。反而，将域控指向 Internet 上的 DNS 注册 SRV 是不对的。

另外，带回家的笔记本开机比较慢，因为只有一个 223.5.5.5，不是域控 DNS，域控计算机每次开机，都试图多次通过 DNS 加入到域，所以开机时间比较长，所以需要设置主备 DNS。


## 安装活动目录

* 上网模式：仅主机；IP 配置：192.168.0.99/24 192.168.0.1
* 勾选 AD域服务、DNS服务器，一直下一步

![ ](https://s2.loli.net/2024/10/04/rXoEhWai2cD7m6F.png)

![ ](https://s2.loli.net/2024/10/04/n29UxJw7FXpBoMZ.png)

选择新林，注意带 .com、.net 等此类域名。有关【林功能级别】和【域功能级别】则是多域环境下的域控版本兼容性，有黄色提示“无法创建DNS委派”不用管，下一步。

![ ](https://s2.loli.net/2024/10/04/k1S68pEa9VAO5Xw.png)

![ ](https://s2.loli.net/2024/10/04/PqQXHv9RgULVY2W.png)

SYSVOL是放组策略的，必须是 NTFS 格式。

![ ](https://s2.loli.net/2024/10/04/EtBS2ka5wTH7JbV.png)

重启后用命令重启下网络登录服务。如果缺少服务有可能找不到域控服务器，确保如图所示的这类几个文件是完整的。

```
net stop netlogon
net start netlogon
```

![ ](https://s2.loli.net/2024/10/04/ziufsQMgATVbdaj.png)


## 将计算机加入域控

在域控主机进入【Active Directory 用户和计算机】，创建【组织单位】 并接着创建用户即可开始测试。

![ ](https://s2.loli.net/2024/10/04/isZHjC4SzwnO7LT.png)

![ ](https://s2.loli.net/2024/10/04/uvGXO9jQIVi6YHf.png)

![ ](https://s2.loli.net/2024/10/04/itqhIP85RGaNurf.png)

## 把域用户添加到本地管理员组

在 win10 【此电脑】的【管理】，【组】里的 administrators 创建。

![ ](https://s2.loli.net/2024/10/05/VvnWrMQSYcOBgK3.png)


## 参考资料

* [韩立刚 - Windows2012活动目录搭建域环境视频课程](https://edu.51cto.com/lesson/46874.html)
* [imaofu - 个人专业文档](https://limaofu.github.io/)
* [飘渺的尘埃 - 域学习笔记九：使用组策略部署软件](https://www.cnblogs.com/atomy/p/13727152.html)