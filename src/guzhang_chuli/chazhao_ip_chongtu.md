# 定位另一台IP冲突的终端


### 一、 看核心

核心查看IP冲突

`dis trap | in conflict`
* local mac是之前IP对应的mac，vlan11 是终端发包带的标签。
* 终端发包是从eth-trunk1 发包过来的，从eth-trunk1发包过来的，就记录该口下mac地址。
* Receive MAC是新检测到IP对应的mac地址。

```
#Mar 12 2025 08:58:22 changshahexin-s5736 
ARP/4/ARP_IPCONFLICT_TRAP:OID 1.3.6.1.4.1.56813.5.25.123.2.6 ARP detects IP conflict.
(IP address=172.16.10.6, Local interface=Eth-Trunk1, Local MAC=00e0-4b70-8e9a, 
 Local vlan=11, Local CE vlan=0, Receive interface=Eth-Trunk1, 
Receive MAC=00e0-4b20-74ff, Receive vlan=11,
Receive CE vlan=0, IP conflict type=Remote IP conflict).  
```

查看Eth-Trunk 1学习到的mac地址（查看对应的接口学习到的mac地址）

```
<changshahexin-s5736>dis mac-address Eth-Trunk 1
-------------------------------------------------------------------------------
MAC Address    VLAN/VSI/BD                       Learned-From        Type      
-------------------------------------------------------------------------------
     
00e0-4e40-c1c3 9/-/-                             Eth-Trunk1          dynamic   
00e0-4b20-74ff 11/-/-                            Eth-Trunk1          dynamic   
00e0-4b20-751c 11/-/-                            Eth-Trunk1          dynamic   
```

查看 Eth-Trunk 1聚合口详情（查看端口详情）

```
<changshahexin-s5736>dis int Eth-Trunk 1

-----------------------------------------------------
PortName                      Status      Weight
-----------------------------------------------------
GigabitEthernet1/0/23         UP          1
GigabitEthernet1/0/24         UP          1
GigabitEthernet0/0/23         UP          1
GigabitEthernet0/0/24         UP          1
```


### 二、看汇聚

通过汇聚交换机，查看冲突的mac地址所在端口（是从哪个端口学过来的mac）

```
<changsha-21-huiju-S5731>dis mac-address 00e0-4b20-74ff
-------------------------------------------------------------------------------
MAC Address    VLAN/VSI/BD                       Learned-From        Type      
-------------------------------------------------------------------------------
00e0-4b20-74ff 11/-/-                            Eth-Trunk5          dynamic   

-------------------------------------------------------------------------------
Total items displayed = 1 
```


进一步查看聚合口的成员接口

```
<changsha-21-huiju-S5731>dis int Eth-Trunk 5

-----------------------------------------------------
PortName                      Status      Weight
-----------------------------------------------------
GigabitEthernet0/0/5          UP          1
GigabitEthernet1/0/5          UP          1
-----------------------------------------------------
```

通过查看邻居关系，可以找到成员接口对应的端口设备

```
<changsha-21-huiju-S5731>dis lldp neighbor bri
Local Intf       Neighbor Dev             Neighbor Intf             Exptime(s)
   
GE0/0/5          21-jieru5-shengchan3     GE0/0/48                  101    
GE1/0/5          21-jieru5-shengchan3     GE0/0/47                  93     
```


### 三、看接入

在确定具体的接入交换机上1，查看所对应的冲突的mac地址去找到另一台IP冲突的终端接入的端口

```
<21-jieru5-shengchan3>dis mac-address 00e0-4b20-74ff
-------------------------------------------------------------------------------
MAC Address    VLAN/VSI/BD                       Learned-From        Type      
-------------------------------------------------------------------------------
00e0-4b20-74ff 11/-/-                            GE0/0/27            sticky    

-------------------------------------------------------------------------------
Total items displayed = 1 

<21-jieru5-shengchan3>dis cur int g 0/0/27
#
interface GigabitEthernet0/0/27
 port default vlan 11
 stp edged-port enable
 dot1x enable
 port-security enable
 port-security mac-address sticky
#
return
```

通过端口的网线编号标识可以定位到具体的工位。


### 四、总结

在核心上看冲突日志，然后根据日志显示的冲突mac查找对应的端口，通过端口往下排查下层设备。dis arp只能看到当前ip地址对应的mac，所以看arp表项意义不大，可以通过查看冲突mac地址直接定位接口


