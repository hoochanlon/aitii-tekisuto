# 堆叠入门基础

CSDN博客文章解锁：https://mark.cuckooing.cn

实机演示：https://www.bilibili.com/video/BV1W24y1v7Ep

命令查询工具：https://support.huawei.com/enterprise/zh/doc/EDOC1100075306/d13492c7

## 堆叠简介

[什么是堆叠？为什么需要堆叠？ - 华为](https://info.support.huawei.com/info-finder/encyclopedia/zh/%E5%A0%86%E5%8F%A0.html)

1. 支持跨设备的链路聚合功能，也可以实现链路的冗余备份。

2. 将成员交换机的多条物理链路配置成一个聚合组，提高交换机的上行带宽

3. 网络中的多台设备组成堆叠，虚拟成单一的逻辑设备，简化组网（对比MSTP+VRRP）

堆叠示意图

![PixPin_2024-12-24_13-53-15](https://img.yonrd.com/i/2024/12/24/mee43a.png)

堆叠系统中所有的单台交换机都称为成员交换机，按照功能不同，可以分为三种角色：

- 主交换机（Master）
  
  - 主交换机负责管理整个堆叠。
  
  - 堆叠系统中只有一台主交换机。

- 备交换机（Standby）
  
  * 备交换机是主交换机的备份交换机。
  
  * 堆叠系统中只有一台备交换机。
  
  * 当主交换机故障时，备交换机会接替原主交换机的所有业务。

- 从交换机（Slave）
  
  * 从交换机用于业务转发，堆叠系统中可以有多台从交换机。
  
  * 从交换机数量越多，堆叠系统的转发带宽越大。
  
  * 当备交换机不可用时，从交换机承担备交换机的角色。

## 堆叠接线

https://support.huawei.com/hedex/hdx.do?docid=EDOC1100333028&id=ZH-CN_TASK_0177100940

[S交换机堆叠最佳实践 - 华为](https://support.huawei.com/enterprise/zh/doc/EDOC1100102782)

[Info-Finder（在线工具）交换机堆叠助手](https://info.support.huawei.com/info-finder/vue/tool/zh/enterprise/virtual)

要保证本交换机的逻辑堆叠端口1必须连接邻交换机的逻辑堆叠端口2，否则堆叠组建不成功。

![PixPin_2024-12-24_14-17-46](https://img.yonrd.com/i/2024/12/24/nm9o5i.png)

## 堆叠简易配置

https://support.huawei.com/hedex/hdx.do?docid=EDOC1100333028&id=ZH-CN_TASK_0000001754494753

[CloudEngine数据中心交换机如何配置堆叠 - 华为](https://support.huawei.com/enterprise/zh/doc/EDOC1100200488)

拓扑参考：[iStack技术白皮书](https://enterprise.huawei.com/ucmf/groups/entpublic/documents/enterprise_webasset/hw_336738.pdf)

![PixPin_2024-12-25_10-25-23](https://img.yonrd.com/i/2024/12/25/gzo2xd.png)

配置步骤：

* 进入堆叠视图
  
  * 配置堆叠域（stack domain）
  
  * 修改堆叠ID（stack renumber，重启生效）
  
  * 将端口改为堆叠模式（port mode）  

* 创建逻辑堆叠口（int stack-port）
  
  * 通过端口组的形式，将端口加入到该逻辑端口（port member-group）

SwitchBp配置相同（ID编号需更改）

```
<HUAWEI>system-view
[～HUAWEI]sysname SwitchA
[~HUAWEI]commit
[~SwitchA]stack
[~SwitchA-stack]stack domain 10
[~SwitchA-stack]stack renumber 1
[SwitchA-stack] port mode stack interface 10ge 1/0/1 to 1/0/4
[~SwitchA-stack] commit
[~SwitchA-stack] quit

[~SwitchA] interface stack-port 1/1
[~SwitchA-Stack-Portl/1] port member-group interface 10ge 1/0/1 to 1/0/4
[~SwitchA-Stack-Portl/l] commit
```

## DAD

堆叠建立后，主交换机和备交换机之间定时发送心跳报文来维护主控板发生故障时或者其中一台交换机下电、重启都将导致两台交换机之间失去通信，导致堆叠系统分裂为两台独立的交换机，这种情况称为堆叠脑裂或者堆叠分裂。

双主检测DAD（Dual-Active Detect）是一种检测和处理堆叠分裂的协议，可以实现堆叠分裂的检测、冲突处理和故障恢复，降低堆叠分裂对业务的影响。

[堆叠脑裂与DAD解决方案-CSDN博客](https://blog.csdn.net/q6968297/article/details/106877440)

[检查堆叠系统是否产生堆叠分裂 - 资料中心 1.0 专题排查指导 - 华为计算](https://info.support.huawei.com/compute/docs/zh-cn/kunpeng-knowledge/typical-scenarios-1/zh-cn_topic_0145902556.html)

[CloudEngine 12800 V200R021C00 配置指南-虚拟化 - 华为](https://support.huawei.com/enterprise/zh/doc/EDOC1100218661/bb5c9d02)（DAD配置的几种方式）

```
<SwitchA> system-view
[~SwitchA]interface eth-trunk 10
[~SwitchA-Eth-Trunk10] trunkport 10ge 1/0/5
[~SwitchA-Eth-Trunk10] trunkport 10ge 2/0/5
[~SwitchA-Eth-Trunkl0] dual-active detect mode relay
[~SwitchA-Eth-Trunkl0]commit

<HUAWEI> system-view
[HUAWEI] sysname SwitchC
[~HUAWEI]commit
[~SwitchC] interface eth-trunk 10
[~SwitchC-Eth-Trunk10] trunkport 10ge 1/0/1
[~SwitchC-Eth-Trunk10] trunkport 10ge 1/0/2
[~SwitchC-Eth-Trunk10] dual-active proxy
[~SwitchC-Eth-Trunk10]commit
```

![PixPin_2024-12-25_10-25-23](https://img.yonrd.com/i/2024/12/25/gzo2xd.png)
