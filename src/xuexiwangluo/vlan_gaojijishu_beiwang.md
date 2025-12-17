# vlan高级技术（备忘）

## super vlan

### super vlan 产生背景

> [Super VLAN技术原理和配置_supervlan没有物理接口该怎么转发数据-CSDN博客](https://blog.csdn.net/jsntwyx/article/details/78403580)

在大型局域网组网中，常采用接入层和核心层二层结构的组网方式，所有的网关都设在核心层设备上。由于每个VLAN都需要一个接口实现路由互通，这样问题就来了，如果因为特殊的需要，网络中划分了成百上千个VLAN，此时核心层设备就会出现VLAN接口数量不足的情况。那么，如果拥有一种技术，可以对VLAN进行聚合，就可以大幅度缩减实际需要的VLAN接口数量，交换机支持VLAN接口少的问题就可以得到解决。为了解决上面的问题，Super VLAN技术出现了。

### super vlan 原理

Sub-VLAN之间属于不同的广播域，也没有属于自己的VLAN接口，因此需要在大集合Super Vlan下建立映射关系，将SuperVlan的虚拟接口作为网关来达到三层通信的效果。

原理图：[四种Proxy ARP原理及区别 - 网管博客](https://www.wlgly.net/post-200.html)

![ ](https://img.yonrd.com/i/2024/12/21/iajooq.png)

二层通信方面，由于sub-vlan属于不同的vlan网络，因此需要arp代理，完成通信过程。对于不在同一物理网络但属于相同网段的主机，或者在同一物理网络属于相同网段但不能二层互通的主机，可以在其之间的交换机上部署ARP代理功能，以实现这些主机之间的通信。

[交换机的ARP代理(交换机开启arp代理) - 路由器](https://www.luyouqi.com/shezhi/5263.html)

![PixPin_2024-12-21_10-58-23](https://img.yonrd.com/i/2024/12/21/hi7v2k.png)

简单来说，就是 “你 —— 秘书 —— 老板”的关系。

### super vlan 配置

拓扑参考：[Super Vlan理论讲解与实验配置-CSDN博客](https://blog.csdn.net/m0_49864110/article/details/127941250)

![PixPin_2024-12-21_12-58-37](https://img.yonrd.com/i/2024/12/21/ktwqje.png)

配置参考：https://blog.csdn.net/m0_73931111/article/details/143814652

配置步骤：

* 创建vlan
* 进入vlan
  * 配置super vlan（aggregate-vlan）
  * 划分子vlan（access-vlan）
* 在super vlan虚拟接口
  * 配置ip地址
  * 开启vlan间arp代理
* 在各个接口应用sub-vlan

```
[LSW2]
vlan batch 10 20 30 40 100
vlan 40
 aggregate-vlan
 access-vlan 10 20 30
interface Vlanif40
 ip address 192.168.10.254 255.255.255.0
 arp-proxy inter-sub-vlan-proxy enable

interface Vlanif100
 ip address 192.168.100.2 255.255.255.0

interface MEth0/0/1

interface GigabitEthernet0/0/1
 port link-type access
 port default vlan 10

interface GigabitEthernet0/0/2
 port link-type access
 port default vlan 20

interface GigabitEthernet0/0/3
 port link-type access
 port default vlan 30

```

## MUX VLAN

[blog.csdn.net/qq_46254436/article/details/105201426](https://blog.csdn.net/qq_46254436/article/details/105201426)

MUX VLAN 主要是为大中型网络 进行设计的，一般在大中型企业内有很多职责不同的部门，各个部门之间要求相互独立，但是还有一部分部门之间有互相访问的的需求，如果是大型公司的话还会拥有很多商业来往的合作伙伴，合作伙伴人数众多且不固定，我们还需要构建网络使合作伙伴之间不可以互通也不能访问本公司其他部门，只可以访问本公司服务器。

MUX VLAN思路

![](https://img.yonrd.com/i/2024/12/21/o47ip4.png)

拓扑参考：[[VLAN\]配置MUX-VLAN-CSDN博客](https://blog.csdn.net/m0_57076217/article/details/144029784)

![image-20241221154027696](https://img.yonrd.com/i/2024/12/21/10gfv2h.png)

配置步骤：

* 创建vlan
* 进入vlan
  * 设置主vlan（mux-vlan）
  * 设置隔离型（separate），或互通型从vlan（group）
* 进入对应接口
  * 设置访问模式
  * 设置默认vlan
  * 启用 mux-vlan

```
[LSW1]
vlan batch 10 20 30

vlan 30
 mux-vlan
 subordinate separate 20
 subordinate group 10
interface GigabitEthernet0/0/1
 port link-type access
 port default vlan 30
 port mux-vlan enable
 
interface GigabitEthernet0/0/23
 port link-type trunk
 port trunk allow-pass vlan 10 20 30

interface GigabitEthernet0/0/24
 port link-type trunk
 port trunk allow-pass vlan 10 20 30
 
 [LSW2]
 vlan batch 10 20 30
 
 vlan 30
 mux-vlan
 subordinate separate 20
 subordinate group 10
 
 interface GigabitEthernet0/0/1
 port link-type access
 port default vlan 10
 port mux-vlan enable
 
interface GigabitEthernet0/0/2
 port link-type access
 port default vlan 10
 port mux-vlan enable
 
interface GigabitEthernet0/0/24
 port link-type trunk
 port trunk allow-pass vlan 10 20 30
 
 [LSW3]
 vlan batch 10 20 30
 
 vlan 30
 mux-vlan
 subordinate separate 20
 subordinate group 10
 
 interface GigabitEthernet0/0/1
 port link-type access
 port default vlan 20
 port mux-vlan enable

interface GigabitEthernet0/0/2
 port link-type access
 port default vlan 20
 port mux-vlan enable
 
 interface GigabitEthernet0/0/24
 port link-type trunk
 port trunk allow-pass vlan 10 20 30
```

