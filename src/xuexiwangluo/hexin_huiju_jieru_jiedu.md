# 核心、汇聚、接入配置解读

> snmp 开启协议之后，上层的网管平台（局域网需要硬件，外网则需要公网）可以实时监控设备运行状态。

![ ](https://img.yonrd.com/i/2025/03/22/njcx7h.png)


## 核心

```
interface Vlanif10
 description to 1lou-zhichan2
 ip address 172.16.9.254 255.255.255.128
 dhcp select relay                   //开启dhcp中继功能，转发DHCP服务器报文
 dhcp relay server-ip 172.16.6.9    //设定dhcp中继服务器的地址为172.16.6.9 （方便统一DHCP管理）


traffic-filter vlan 10 inbound acl 3000

acl number 3000
<!-- 允许内网源地址为172.16.5.1-254的网段通过 -->
 rule 10 permit ip source 172.16.5.0 0.0.0.255 

<!--  允许内网访问目的地址为172.16.5.1-254的地址通过 -->
 rule 20 permit ip destination 172.16.5.0 0.0.0.255 

<!-- 拒绝任意172.16.9.129-254去访问172.16.0.1-31.254 -->
 rule 55 deny ip source 172.16.9.128 0.0.0.127 destination 172.16.0.0 0.0.31.255 
 ```

调用心跳探测，当远端探测失败时会让静态路由失效（不加路由表）,也可以达到链路快速切换的目的。

```
nqa test-instance 1 ip
 test-type icmp
 destination-address ipv4 172.16.5.253
 frequency 10
 timeout 1
 start now   

//调用心跳探测，当远端探测失败时会让静态路由失效（不加路由表）,也可以达到链路快速切换的目的
ip route-static 0.0.0.0 0.0.0.0 172.16.5.1 track nqa user 1  
```

## 汇聚

```
interface Eth-Trunk10 //创建聚合口
 
 description to changsha-1lou-hexin-S5735S
 
 port link-type trunk

 <!--  
 不放行 vlan1，默认情况下，
 广播流量会在 VLAN 1 里传播，所有未分配 VLAN 的设备可能都会收到。
 -->
 undo port trunk allow-pass vlan 1 

 port trunk allow-pass vlan 4 9 to 11  //放行 vlan4、9-11


interface GigabitEthernet0/0/1
 eth-trunk 1  //物理下捆绑链路聚合
```

## 接入

```
<!-- 防止未经授权的交换机，并且该交换机启用了 STP，那么它可能会发送 BPDU，导致原本稳定的 STP 拓扑发生变化，甚至可能影响整个网络。 -->
stp bpdu-protection

<!-- 
作用：取消统一认证模式，让设备使用 单独配置的认证方式（如 802.1X） 
默认情况下，华为交换机可能使用 统一认证模式（即 Web 认证、MAC 认证、802.1X 认证等可以组合使用）。 
-->
undo authentication unified-mode

# 所有接入该交换机的终端设备 必须通过 802.1X 认证，否则无法访问网络。
dot1x enable

<!-- 交换机通过 EAP 协议与 RADIUS 服务器 进行认证，inode web端 -->
dot1x authentication-method eap

<!-- 免认证 IP 配置 -->
dot1x free-ip 172.16.6.6 255.255.255.255
dot1x free-ip 172.16.6.7 255.255.255.255
dot1x free-ip 172.16.6.3 255.255.255.255


vlan batch 4 10

interface Vlanif1
#
interface Vlanif4
 description to guanli-dizhi
 ip address 172.16.6.240 255.255.255.0
#
interface GigabitEthernet0/0/1
 port default vlan 10
 stp edged-port enable
 dot1x enable

#
interface Eth-Trunk1
 description to changsha-21-huiju-S5731
 port link-type trunk
 undo port trunk allow-pass vlan 1
 port trunk allow-pass vlan 4 10

#
interface GigabitEthernet0/0/47
 eth-trunk 1
#
interface GigabitEthernet0/0/48
 eth-trunk 1

//所有未知流量（目的网络不在路由表中）都通过 网关 172.16.6.254 发送。
ip route-static 0.0.0.0 0.0.0.0 172.16.6.254 
```

## 外网核心接入

