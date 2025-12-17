# vlan间路由

## vlan的通信方式

内容不超过大三层，用思维导图尚可。该方法比较适合内容较丰富的文章。

[华为交换机－不同Vlan如何通信_华为交换机跨vlan通信-CSDN博客](https://blog.csdn.net/qq_22160557/article/details/99641757)

![7ed64eb07e7](https://img.yonrd.com/i/2024/12/22/w4ei2j.jpeg)

网上相关文章总结过：

[一篇掌握3种不同vlan之间互联的方式（单臂路由+Vlanif接口）_不同vlan之间如何通信-CSDN博客](https://blog.csdn.net/2301_76170756/article/details/129725724)

### 初期VLAN间路由

![PixPin_2024-12-22_19-19-10](https://img.yonrd.com/i/2024/12/22/vrgvz4.png)

优点：配置维护简单

缺点：

* 成本太高，每增加一个vlan就需要一个端口和一条物理链路，浪费资源;
* 可扩展性差，当vlan增加到一定数量后，路由器上可能没有那么多端口支撑；
* 某些VLAN之间的主机可能不需要频繁进行通信，每个vlan占用一个端口会导致路由器的接口利用率很低。

### 配置子接口和802.1Q协议实现VLAN间通信（单臂路由）





![PixPin_2024-12-22_19-29-20](https://img.yonrd.com/i/2024/12/22/vwocqe.png)

优点：节省端口和物理链路，成本低，具有可扩展性，端口利用率高。
缺点：

1. “单臂”为网络骨干链路，容易形成网络瓶颈
2. 子接口依然依托于物理接口，应用不方便
3. VLAN间转发需要查看路由表，严重浪费设备资源 
   1. （由[配置去使能VLANIF接口的ARP广播功能 - S300, S500, S2700, S5700, S6700 V200R023C00 配置指南-IP业务 - 华为](https://support.huawei.com/enterprise/zh/doc/EDOC1100333458/cc6420e9)开启arp转发内容，已证）


### 交换机虚拟接口配置vlan间路由

![PixPin_2024-12-22_19-38-08](https://img.yonrd.com/i/2024/12/22/w1y01k.png)



## 三层交换机vlan间路由配置示例

![PixPin_2024-12-22_20-45-31](https://img.yonrd.com/i/2024/12/22/xue5lq.png)

配置步骤：

【LSW2】和【LSW3】

* 在对应接口配置相应vlan，access
* 把应用在接口的vlan发送到上联口，trunk

【LSW1】

* 下联口放行下游交换机传递过来的vlan
* 在相关vlan虚拟接口上配置相关网关，并不需要应用相关接口

**LSW2与LSW3**

```
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

**LSW1**

```
vlan batch 10 20
interface Vlanif10
 ip address 192.168.10.254 255.255.255.0

interface Vlanif20
 ip address 192.168.20.254 255.255.255.0

interface GigabitEthernet0/0/23
 port link-type trunk
 port trunk allow-pass vlan 10 20

interface GigabitEthernet0/0/24
 port link-type trunk
 port trunk allow-pass vlan 10 20
```

## 单臂路由

[什么是信道化子接口？信道化子接口与普通子接口有何不同？ - 华为](https://info.support.huawei.com/info-finder/encyclopedia/zh/信道化子接口.html)

[dot1q termination vid - CX320 交换模块 V100R001 命令参考 11 - 华为](https://support.huawei.com/enterprise/zh/doc/EDOC1000128396/c51dda43)

[IEEE 802.1Q - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/IEEE_802.1Q)

原理表述参考：[单臂路由详解](https://blog.csdn.net/weixin_45551608/article/details/114764211)

路由器重新封装MAC地址，转换VLAN标签
将路由器的G0/0/0接口进行逻辑划分：分为G0/0/0.1和G/0/0.2设置网关分别为主机对应IP地址网段。

> 在三层交换模块上通过三层以太网接口实现:
>
> 但是传统的三层以太网接口不支持VLAN报文，当收到VLAN报文时，会将VLAN报文当成非法报文而丢弃。为了实现VLAN间互通，在三层以太网接口上可创建以太网子接口，通过在子接口上部署终结子接口功能将VLAN报文中的Tag剥掉，从而实现VLAN间互通。

![PixPin_2024-12-22_22-55-11](https://img.yonrd.com/i/2024/12/22/11aoxuy.png)

配置步骤：

交换机

* 配置vlan，接口应用vlan
* 上行口，传递vlan

路由器

* 进入下行口子接口（如：`int g0/0/0.10`）
  * 指定IP地址
  * 指定dot1q去掉单层VLAN ID
  * 启用报文广播转发（arp broadcast enable）

LSW1

```
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

R1

```
interface GigabitEthernet0/0/0.10
 dot1q termination vid 10
 ip address 192.168.10.254 255.255.255.0 
 arp broadcast enable

interface GigabitEthernet0/0/0.20
 dot1q termination vid 20
 ip address 192.168.20.254 255.255.255.0 
 arp broadcast enable
```



针对[华为交换机－不同Vlan如何通信_华为交换机跨vlan通信-CSDN博客](https://blog.csdn.net/qq_22160557/article/details/99641757)子接口配置`arp broadcast enable`，的问题：[AR1200内网配置子接口，完成上网配置后内网PC无法上网 - 华为](https://support.huawei.com/enterprise/zh/knowledge/EKB1000087032)已解释（ensp实验需要开启`arp broadcast enable`）：

V2R5以前版本，子接口默认没有配置`arp broadcast enable`。而没有配置`arp broadcast enable`，系统会直接把该IP报文丢弃

* 而且实际上丢弃的是arp reply报文，arp request报文可以正常转发，所以PC ping外网口地址可以看到会话
* R5之后子接口是默认开启了`arp broadcast enable`

对于涉及到子接口的场景，首先确认是否有配置终结子接口，然后对于不同版本确认是否需要配置`arp broadcast enable`来实现子接口正常通信。

注：

如果终结子接口上没有配置`arp broadcast enable`命令，那么系统会直接把该IP报文丢弃。此时该终结子接口的路由可以看作是黑洞路由。
如果终结子接口上配置了`arp broadcast enable`命令，那么系统会构造带Tag的ARP广播报文，然后再从该终结子接口发出。





