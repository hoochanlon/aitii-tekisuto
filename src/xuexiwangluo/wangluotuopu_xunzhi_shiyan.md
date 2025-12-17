# 网络拓扑寻址与实验

## 上篇

上篇可以单独花一天时间理解。

### 三张表汇总

IP-MAC的映射表

![PixPin_2024-12-17_15-09-11](https://img.yonrd.com/i/2024/12/17/oymwpk.png)



####  路由表与转发表对比

**路由表**

RIB不是用来进行IP包转发的，也不会被宣告到网络中。

参考 [静态路由详解](https://blog.csdn.net/Lmagua/article/details/102573453)

* 只使用下一跳地址时，NextHop:下一跳 IP 地址，且 Flags 为 RD
* 只使用出接口地址时，NextHop：出接口IP地址，且Flags 为 D
* 同时使用下一跳，出接口时，NextHop：下一跳IP 地址，且Flags为D

![ ](https://img.yonrd.com/i/2024/12/18/k34h84.png)

**转发表**

* 在路由表基础之上，生成转发表。
* FIB 表，目的是为了加快数据包的查找速度，避免每次都需要访问完整的路由表。

[IP路由表管理命令 - S1720, S2700, S5700, S6720 V200R011C10 命令参考 - 华为](https://support.huawei.com/enterprise/zh/doc/EDOC1000178145/31b4832a#display_fib)

![PixPin_2024-12-18_12-25-42](https://img.yonrd.com/i/2024/12/18/kbw32y.png)

### 数据包流出过程

```
+-------------------------------------------------------------+
|                         源主机 (Host A)                   |
| 1. 生成网络层数据包 (IP 数据包) --> 数据链路层封装 (Ethernet) |
|    - IP 层: 源 IP 地址 = 192.168.1.2, 目标 IP 地址 = 192.168.2.3 |
|    - Ethernet 层: 源 MAC 地址, 目标 MAC 地址是路由器的接口 MAC 地址 |
|    - VLAN 标签: VLAN ID = 10                                |
+-------------------------------------------------------------+
             |
             | 2. 数据包通过网络链路发送到交换机
             v
+-------------------------------------------------------------+
|                       交换机 (Switch)                     |
| 3. 交换机根据 VLAN 标签转发数据包                         |
|    - 交换机查看 VLAN 标签，决定将数据包转发到 VLAN 10 的端口 |
|    - 交换机根据 MAC 地址表和 VLAN 标签进行转发              |
+-------------------------------------------------------------+
             |
             | 4. 交换机将数据包转发到路由器或其他设备
             v
+-------------------------------------------------------------+
|                         路由器 (Router)                     |
| 5. 路由器接收到带有 VLAN 标签的数据包                    |
|    - 数据链路层解封装 (Ethernet Frame + VLAN 标签)          |
|    - 根据目标 IP 地址和路由表，决定将数据包转发到下一跳     |
|    - Ethernet 层: 目标 MAC 地址 = 下一跳路由器的 MAC 地址    |
|    - 通过 VLAN 接口转发数据包                               |
+-------------------------------------------------------------+
             |
             | 6. 数据包通过网络链路发送到目标路由器或目标主机
             v
+-------------------------------------------------------------+
|                      目标路由器 (Router)                   |
| 7. 数据链路层解封装 (Ethernet Frame + VLAN 标签) --> 网络层转发决策 |
|    - 目标 IP 地址是 192.168.2.3，目标主机 IP 地址           |
|    - 确定数据包最终转发到目标主机                           |
+-------------------------------------------------------------+
             |
             | 8. 数据包通过局域网发送到目标主机
             v
+-------------------------------------------------------------+
|                       目标主机 (Host B)                     |
| 9. 接收网络层数据包 (IP 数据包) --> 网络层解封装             |
|    - IP 层: 目标 IP 地址匹配，最终交付给目标应用层          |
+-------------------------------------------------------------+

```

### 板卡·具体机器内部的数据包转出

[Z-lib 一个报文的路由器之旅](https://zh.z-lib.gs/book/26875789/61c16f/%E4%B8%80%E4%B8%AA%E6%8A%A5%E6%96%87%E7%9A%84%E8%B7%AF%E7%94%B1%E5%99%A8%E4%B9%8B%E6%97%85.html)

![PixPin_2024-12-17_23-35-44](https://img.yonrd.com/i/2024/12/17/12n2l1c.png)

加上逻辑框架好对模块功能分类，这部分内容知识相当于修交换机硬件了。

[27张图详解网络设备转发流程：路由器、交换机、防火墙是如何处理数据报文的？-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/1916910)

![PixPin_2024-12-17_23-44-36](https://img.yonrd.com/i/2024/12/17/12rua0b.png)

## 下篇

###  静态实验拓扑

静态拓扑参考：https://blog.csdn.net/qq_57340195/article/details/118095137

即使按照如图配置添加路由器接口网关、添加主机IP，PC1依旧无法 ping 通PC2。

![PixPin_2024-12-18_11-38-02](https://img.yonrd.com/i/2024/12/18/iuta42.png)

两台路由设备加入对端静态路由条目才能ping通。

```
[R1]
ip route-static 192.168.20.0 24 192.168.1.2
[R2]
ip route-static 192.168.10.0 24 192.168.1.1
```

Error: The next-hop address is invalid. 一般是对端、需要转发的目的IP、转发方向没分清楚。

* [华为eNSP入门实验，Vlan配置，路由配置，用户模式，链路聚合-CSDN博客](https://blog.csdn.net/m0_46085118/article/details/131224141)

**网关**

* 网关是指两个网络之间的连接点，如果两个网络采用不同的协议，那么网关就是实现协议转换的设备。
* 网关的主要作用是将不同类型的网络互相连接，以便在它们之间进行数据交换。
* 网关通常位于两个不同网络之间，常见的例子是路由器、交换机等。

**下一跳**

* 下一跳只是一个用于数据包路由的参数，下一跳通常是由路由器动态计算得出，以便最终到达目的地。
* 下一跳是在数据包传输的过程中动态计算得出的参数，它不确定的位置可能是在路由器、交换机或其他设备。

#### 动态实验拓扑

DHCP原理参考：[DHCP的原理与配置（结合案例分析） - 笑洋仟 - 博客园](https://www.cnblogs.com/weq0805/p/14806958.html)

可靠性方面，类似TCP/IP四次挥手，DHCP也是四步，类比招聘入职：

1. Discover 客户端发送广播寻找DHCP服务器
2. Offer，DHCP服务器回 offer 信息
3. Request 客户端发送确认请求
4. ACK，DHCP确认

拓扑及配置思路参考：[DHCP中继原理和配置（含常见配置配置误区）-CSDN博客](https://blog.csdn.net/weixin_40228200/article/details/118863876)

![PixPin_2024-12-19_19-43-07](https://img.yonrd.com/i/2024/12/19/w4xfo9.png)

配置步骤：

DHCP服务器

* 启用DHCP
* 配置地址池
* 设置网段、网关、DNS等
* 在出口上配置IP，选择DHCP全局模式
* 静态路由指定下行口（中继）地址

DHCP中继

注意：因为常规在接口上配置IP只能是唯一的，因此使用vlan虚拟接口，将网关分别部署在各个不同接口。

* 进入vlan虚拟接口
  * 配置DHCP地址池网关的IP地址
  * 开启DHCP中继模式
  * 中继设置成DHCP服务器的IP地址
* 在接口上设置访问模式，并应用vlan

```shell
[R4]
dhcp enable
ip pool dhcp_test
	gateway-list 192.168.20.254 
	network 192.168.20.0 mask 255.255.255.0 
	dns-list 1.1.1.1 8.8.8.8 

interface GigabitEthernet0/0/0
	ip address 192.168.10.254 255.255.255.0 
	dhcp select global
 
[LSW1]
 vlan batch 10 20
 interface Vlanif10
	ip address 192.168.10.253 255.255.255.0
	dhcp select relay
	dhcp relay server-ip 192.168.10.254
 
interface Vlanif20
	ip address 192.168.20.254 255.255.255.0
	dhcp select relay
	dhcp relay server-ip 192.168.10.254

interface GigabitEthernet0/0/1
 	port link-type access
 	port default vlan 10
 
interface GigabitEthernet0/0/2
 	port link-type access
 	port default vlan 20

interface GigabitEthernet0/0/3
 	port link-type access
 	port default vlan 20
```

## 参考

[详解一次完整的数据包传输过程 - kribee - 博客园](https://www.cnblogs.com/kribee/p/14985130.html)

[计算机网络学习笔记第四章（网络层）超详细整理_计算机网络第四章网络层知识点总结csdn-CSDN博客](https://blog.csdn.net/weixin_45629285/article/details/117459067)

[源主机经过交换机或者路由到目的主机的过程详解_两台主机经过路由器的工作原理是什么-CSDN博客](https://blog.csdn.net/sunboylife/article/details/111680247)

[通过wireshark抓包理解交换机、路由器工作原理_路由器交换机抓包-CSDN博客](https://blog.csdn.net/redwand/article/details/105300145)

[路由表 (RIB) 与转发表 (FIB)_fib表-CSDN博客](https://blog.csdn.net/ginkov/article/details/51803949)

[Z-lib 一个报文的路由器之旅](https://zh.z-lib.gs/book/26875789/61c16f/%E4%B8%80%E4%B8%AA%E6%8A%A5%E6%96%87%E7%9A%84%E8%B7%AF%E7%94%B1%E5%99%A8%E4%B9%8B%E6%97%85.html)

[网关和下一跳的区别 - 希赛考试网](https://kaoshi.educity.cn/rk/zfebzqmqa1.html)

[27张图详解网络设备转发流程：路由器、交换机、防火墙是如何处理数据报文的？-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/1916910)



