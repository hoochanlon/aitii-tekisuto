# vlan基础（access、trunk、hybird）

## access、trunk、hybird基本简介

参考：[一文带你了解 VLAN 三种端口类型：Access、Trunk、Hybrid-阿里云开发者社区](https://developer.aliyun.com/article/1621985)

vlan隔离大规模广播域，加快转发效率

* access ，单车道，只允许一种类型vlan通信。
* trunk ，多车道，多个vlan通信。
* hybrid，可以在没有三层设备的情况下，实现跨vlan通信和访问控制。

![PixPin_2024-12-19_21-17-24](https://img.yonrd.com/i/2024/12/19/z14jub.png)

一个物理端口只能拥有一个PVID，PVID必定等于其中的一个VID，而且在这个VID上，这个物理端口必定是Untagged Port。

1. 普通的ACCESS端口PVID和VID只有一个是一致的；
2. 如果是HYBRID或者TRUNK端口因为该端口能识别多个VLAN，而PVID也可以自己修改。

##  PVID基本简介

[VLAN中PVID与VID的详解-百度开发者中心](https://developer.baidu.com/article/details/3280662)

[Switch VLAN 設定教學 (V4.80) — Zyxel Community](https://community.zyxel.com/tw/discussion/16553/switch-vlan-設定教學-v4-80)

1. 简单来说，PVID就是一个端口的默认VLAN ID，每个端口都可以配置一个PVID，但只能有一个。
2. 假设某端口的 PVID 为 10，当未标记的流量进入该端口时，交换机会将这些数据帧自动分配到 VLAN 10。
3. 当端口设定Tag，封包离开时，将会持续带着标签；当端口设定 Untag，封包离开时，Switch会将 VLAN 标签移除。

将以下图示逆向理解。

![PixPin_2024-12-19_23-33-51](https://img.yonrd.com/i/2024/12/19/12lut2z.png)



1. 计算机的端口添加一个属性，用来决定计算机发出的未标记的帧属于哪个VLAN，这个属性就是PVID。

1. tag端口用来连接交换机的，untag端口是用来连接计算机。

## hybird


拓扑图参考：[华三 hybrid 配置命令_华三 linktype hybird-CSDN博客](https://blog.csdn.net/weixin_42313749/article/details/116765343)

![PixPin_2024-12-20_11-14-45](https://img.yonrd.com/i/2024/12/20/ig23ln.png)

实验效果：

* PC1能够正常与PC2和PC3通信。

* PC2和PC3之间不能互相通信：尝试Ping对方的IP地址时会失败。

这种配置适合同网段下的灵活管理，小组间需要共享资源但保持小组隔离的网络场景。

图解参考：[华为-Hybrid原理及配置实验（附：心法口诀）_华为交换机配置口诀顺口溜-CSDN博客](https://blog.csdn.net/ycycyyc_/article/details/106786006)

![ ](https://img.yonrd.com/i/2024/12/20/fs9qk9.png)

配置步骤

* 创建vlan
* 上行口设置hybird模式（华为默认是hybird）
  * 设置上行口的 pvid vlan 
  * 设置上行口的 vlan untag 放行标记（自己的vlan和下行口的vlan）
* 下行口设置hybird模式（华为默认是hybird）
  * 设置下行口 pvid vlan
  * 设置上行口的 vlan untag 放行标记（自己的vlan和上行口的vlan）

```
[LSW1]
vlan batch 10 20 30
interface GigabitEthernet0/0/1
 port hybrid pvid vlan 10 # 给数据帧打上标签，送入交换机
 port hybrid untagged vlan 10 20 30 # 数据帧从这端口出去时，先查untag表，有对应的标签就脱标签再发送

interface GigabitEthernet0/0/2
 port hybrid pvid vlan 20
 port hybrid untagged vlan 10 20
 
interface GigabitEthernet0/0/3
 port hybrid pvid vlan 30
 port hybrid untagged vlan 10 30
```

#### 进一步理解

tag端口用来连接交换机的，untag端口是用来连接计算机。

拓扑参考：[华为Hybrid类型接口实现不同vlan之间通信_undo port hybrid vlan 1-CSDN博客](https://blog.csdn.net/AixiedaimadeMM/article/details/133657353)

![image-20241220140919478](https://img.yonrd.com/i/2024/12/20/r3bsib.png)

配置步骤：

【第一台交换机】

* 创建vlan
* 下行口设置hybird模式（华为默认是hybird）
  * 设置下行口 pvid vlan
  * 设置上行口的 vlan untag 放行标记（自己的vlan和上行口的vlan）
* 在级联口上打上tag标签

【第二台交换机】

* 创建vlan
* 在级联口上打上tag标签
* 根据下行口去除对应标签（untagged）的 vlan 

```
[LSW1]
vlan batch 10 20 30
interface GigabitEthernet0/0/1
	port hybrid tagged vlan 10 20 30

interface GigabitEthernet0/0/2
	port hybrid pvid vlan 10
	port hybrid untagged vlan 10 20 30

[LSW2]
vlan batch 10 20 30
interface GigabitEthernet0/0/1
	port hybrid tagged vlan 10 20 30

interface GigabitEthernet0/0/2
	port hybrid pvid vlan 20
	port hybrid untagged vlan 10 20

interface GigabitEthernet0/0/3
	port hybrid pvid vlan 30
	port hybrid untagged vlan 10 30
```

## access

[【VLAN】华为交换机接口模式详解：Access模式（接入模式）和Trunk模式（汇聚模式）（Access：主要用于连接终端设备，计算机、打印机、服务器等，Trunk模式：连接路由器、其他交换机等）-CSDN博客](https://blog.csdn.net/Dontla/article/details/134840944)

access模式主要用于连接终端设备，如计算机、打印机、服务器等。由于这些设备通常只需要访问一个特定的VLAN，将交换机端口配置为Access模式是合适的。

拓扑参考：[VLAN工作原理之ACCESS：接收到带VLAN的报文如何处理_网络知识_网络技术-简易百科](https://www.isolves.com/it/wl/zs/2019-09-23/5175.html)

![PixPin_2024-12-20_12-38-17](https://img.yonrd.com/i/2024/12/20/khaamt.png)

配置参考：[同一VLAN能否配置多个网段？ - S1720, S2700, S5700, S6720 V200R011C10 配置指南-以太网交换 - 华为](https://support.huawei.com/enterprise/zh/doc/EDOC1000178154/c693c102)

```
vlan batch 10 20 30
interface Vlanif10
 ip address 192.168.10.254 255.255.255.0
 ip address 192.168.20.254 255.255.255.0 sub

interface Vlanif30
 ip address 192.168.30.254 255.255.255.0
 
interface GigabitEthernet0/0/1
 port link-type access
 port default vlan 10

interface GigabitEthernet0/0/2
 port link-type access
 port default vlan 10

interface GigabitEthernet0/0/3
 port link-type access
 port default vlan 30
```

## trunk

Trunk模式则主要用于连接其他的网络设备，如路由器、其他交换机等。这些设备可能需要访问多个VLAN，因此，将交换机端口配置为Trunk模式是合适的。

拓扑参考：[Vlan和Trunk实验（保姆级实验教程）_在sw1和sw2上创建vlan,配置trunk端口-CSDN博客](https://blog.csdn.net/sinat_28521487/article/details/108721082)

![PixPin_2024-12-20_17-24-45](https://img.yonrd.com/i/2024/12/20/siqtr8.png)

效果：通过交换机之间传递vlan，接入层下的主机，同一vlan的可以互通，不同vlan的无法互通。

配置步骤:

* 首先做trunk的准备工作，先做access配置
* 然后在级联口之间，配置trunk模式
* 在trunk模式中，设置放行vlan

```
[LSW1]
vlan batch 10 20
interface GigabitEthernet0/0/1
 port link-type access
 port default vlan 10

interface GigabitEthernet0/0/2
 port link-type access
 port default vlan 20
 
interface GigabitEthernet0/0/24
 port link-type trunk
 port trunk allow-pass vlan 10 20
 
[LSW2]
vlan batch 10 20
interface GigabitEthernet0/0/1
 port link-type access
 port default vlan 10

interface GigabitEthernet0/0/2
 port link-type access
 port default vlan 20
 
interface GigabitEthernet0/0/24
 port link-type trunk
 port trunk allow-pass vlan 10 20
 
```

