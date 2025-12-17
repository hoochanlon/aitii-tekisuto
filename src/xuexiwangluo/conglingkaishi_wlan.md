# 从零开始学wlan

## FAT AP + FIT AP

> [【NetWork】 Wlan基础以及配置-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/2213559)

无线控制器，或者说路由器（FAT AP）通过二层POE交换机连接多个AP，通过WiFi名称（SSID）传输到终端。

![PixPin_2025-01-05_10-59-38](https://img.yonrd.com/i/2025/01/05/i9fawi.png)

AC+AP组网所需的物理条件

1. 无线AP---收发无线信号；
2. 无线控制器(AC)---用来控制管理多个AP;
3. PoE交换机--能给AP实现网络连接和供电的交换机;
4. 授权：默认AC管理的AP数量有限，买授权才能管控更多AP。

以及 [WLAN组网与转发详解-CSDN博客](https://blog.csdn.net/qq_38265137/article/details/80370579) 组网方式的介绍。

## 配置示例

[wlan配置——瘦AP配置【拓扑简单，代码详细，命令解释】_wlan配置瘦ap-CSDN博客](https://blog.csdn.net/qq_48330132/article/details/128350251)

[华为无线实验:利用AC管理AP,并且无线用户能够上网_无线实验ac控制ap-CSDN博客](https://blog.csdn.net/qq_43416206/article/details/131361372)

国家区域也不是必须要设置的：[中国范围内不能使用完整的WIFI 6E和WIFI 7，华为推出的WIFI 7路由器有什么用？ - 知乎](https://www.zhihu.com/question/623873343)

### AC创建AP WLAN组网流程

![PixPin_2025-01-06_13-26-38](https://img.yonrd.com/i/2025/01/06/lybt1g.png)

### 拓扑及配置

![PixPin_2025-01-06_13-34-16](https://img.yonrd.com/i/2025/01/06/m2f3dk.png)

LSW1

```
vlan batch 10 30

dhcp enable
ip pool ap
gateway-list 192.168.1.254
network 192.168.1.0 mask 255.255.255.0
option 43 sub-option 2 ip-address 1.1.1.1

interface Vlanif10
 ip address 192.168.1.254 255.255.255.0
 dhcp select global

interface Vlanif30
 ip address 1.1.1.2 255.255.255.0
 
interface GigabitEthernet0/0/1
 port link-type trunk
 port trunk allow-pass vlan 10

interface GigabitEthernet0/0/2
 port link-type trunk
 port trunk allow-pass vlan all

```

LSW2

```
vlan batch 10

interface GigabitEthernet0/0/1
 port link-type trunk
 port trunk allow-pass vlan 10
 
 interface Ethernet0/0/2
 port link-type access
 port default vlan 10

interface Ethernet0/0/3
 port link-type access
 port default vlan 10
```

AC1

```
vlan batch 30
interface Vlanif30
 ip address 1.1.1.1 255.255.255.0

interface GigabitEthernet0/0/1
 port link-type trunk
 port trunk allow-pass vlan all

wlan
 security-profile name securityprofile
  security wpa-wpa2 psk pass-phrase 12345678 aes
 
 ssid-profile name ssid-cfg-1
  ssid wifi-test

vap-profile name vap-cfg-1
  ssid-profile ssid-cfg-1
  security-profile securityprofile
 
ap-group name ap-group1
 vap-profile vap-cfg-1 wlan 1 radio 0
 
ap auth-mode mac-auth
 ap-id 1 ap-mac 00e0-fc07-0840

cap wap source interface vlanif30
```

