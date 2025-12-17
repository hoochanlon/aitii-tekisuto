# IP地址上不了网

## mac地址解除绑定后，配置了IP却上不了网

### 问题背景

我在交换两台电脑时，只对其中一台电脑的端口解绑了，而另一台电脑的端口没有解绑。这导致了网络访问问题。


### 解决方法

> 一般mac地址有5分钟的老化时间（sticky除外，它会一直保存），`un shutdown` 可以让端口学习新mac地址。

正确的操作步骤：先巡线定位两个互相换主机的接入交换机端口，然后进入两个端口进行mac地址解绑

1. `dis mac-address sticky  | in 00e0-4b30-3672`    查询这个mac是否和其他接口做了绑定
2. `undo port-security enable`   关闭端口安全取消绑定
3. `undo port-security mac-address sticky`

### 解决问题过久优化

#### 解决问题过久的原因

在解决问题的过程中，出现了一个关键的误区：虽然解绑了一个端口，但误以为已经完成了全部解绑操作。这种片面的认知导致问题的解决思路被局限在了“清理MAC表并重新学习MAC地址”上。于是，反复清理同一个端口的MAC地址，却始终无法解决问题。这种“为什么我清除了MAC地址，还是上不了网”的困惑逐渐形成了一种思维定式，使得问题解决的思路陷入了死循环。理论与实际之间出现了偏差，让人摸不着头绪，难以找到问题的真正根源。

#### 解决问题过久的优化措施

可以从以下几个方面入手，提升问题解决的效率和准确性，减少因思维定式或信息遗漏导致的困境：

**全面检查和确认问题范围**

在处理问题时，首先要全面检查和确认问题的范围，避免片面或遗漏关键信息。例如：

1. 检查所有相关设备和配置：在交换电脑时，不仅要检查已知的端口，还要确认所有相关端口的配置是否一致。
2. 验证所有可能的绑定关系：在解绑操作后，使用命令（如dis mac-address sticky）确认是否还有其他绑定关系未解除。

**保持开放的思维方式**

避免陷入单一的解决思路，尤其是在问题没有得到解决时：

1. 多角度思考问题：当一种方法无法解决问题时，不要反复尝试同一种方法，而是尝试从其他角度分析问题。
2. 避免思维定式：不要因为“理论上应该这样”而忽视实际情况。理论和实际之间可能存在差异，需要灵活调整思路。
3. 逐步验证每个操作，在解决问题时，每一步操作都要进行验证，确保操作的效果符合预期：
4. 分步操作：不要一次性进行过多操作，而是将问题解决过程分解为多个小步骤，每一步都进行验证。
5. 记录操作和结果：详细记录每一步操作及其结果，便于在出现问题时回溯和分析。

**借助工具和命令进行验证**

在处理网络问题时，充分利用设备提供的工具和命令来验证问题：
1. 使用命令行工具：例如dis mac-address sticky、dis port-security等命令，确认端口安全和MAC地址绑定的状态。
2. 查看日志和告警：设备的日志和告警信息可能包含问题的线索，不要忽视这些信息。

**多人协作和交流**

1. 在遇到复杂问题时，不要独自处理，可以寻求同事或团队的帮助：
2. 与他人交流：将问题描述清楚，听取他人的意见和建议，可能会发现新的解决思路。
3. 团队协作：不同的人可能有不同的经验和视角，团队协作可以更快地找到问题的根源。

**总结经验教训**

每次解决问题后，都要总结经验教训，避免类似问题再次发生：
1. 记录问题和解决方法：将问题的背景、解决过程和最终的解决方法记录下来，形成知识库。
2. 定期回顾和学习：定期回顾这些经验教训，不断总结和提升自己的问题解决能力。


## 网线电缆被拔出，恢复后获取不到IP地址

### 问题背景

1-8人的办公室，多台主机网络不稳定，网卡重启后，长时间显示“网络电缆被拔出”，等待许久才恢复。其中有一台主机两个小时后才获取到IP地址，跟环路了一样，其中一台主机网络很卡，不能正常上网。

1. 使用寻线仪发现多个工位的网络线路8芯并非全通，CRC有错包增长。
2. 更换跳线后，好过一段时间，马上又会多台主机问题又会复现。
3. ping 失败，常见故障。
4. 疑是IP冲突，但办公室的每台主机IP都不相同。


### 解决过程

一、 `display trapbuffer` 查看告警发现有ip地址冲突的记录
二、 `display mac-address |  in 3cc7-869f-9985` 查看mac地址表，发现是从ge0/0/25学到的mac，然后dis lldp neighbor brief 查看设备邻居关系

```
 ARP detects IP conflict. (IP address=192.168.182.254, Local interface=Vlanif183//冲突的vlan, 
Local MAC=3cc7-8625-c644, Local vlan=0, Local CE vlan=0, Receive interface=GigabitEthernet0/0/25,
 Receive MAC=3cc7-869f-9985, Receive vlan=183, Receive CE vlan=0, IP conflict type=Local IP conflict).
```

```
P conflict //IP冲突
IP address=192.168.182.254//冲突的IP地址
Local interface=Vlanif183//冲突的vlan, 
Local MAC=3cc7-8625-c644//交换机本地mac地址
Receive interface=GigabitEthernet0/0/25 //接收端口
Receive MAC=3cc7-869f-9985//接收到的远端mac地址
```

三、`dis lldp neighbor interface GigabitEthernet 0/0/25` 查看25口的邻居关系

```
<21lou_waiwang_hexin>dis ll neighbor interface GigabitEthernet 0/0/25
GigabitEthernet0/0/25 has 1 neighbor(s):

Neighbor index :1
Chassis type   :MAC address 
Chassis ID     :3cc7-869f-9985 
Port ID type   :Interface name 
Port ID        :GigabitEthernet0/0/49
Port description    :to 21lou-bangong
System name         :20-waiwang-jieru
System description  :FutureMatrix Switch S5735-L48T4S-A1
FutureMatrix Versatile Routing Platform Software
VRP (R) software, Version 5.170 (S5735-L48T4S-A1 V200R021C00SPC100)
System capabilities supported   :bridge router 
System capabilities enabled     :bridge router 
Management address type  :ipv4
Management address value :192.168.180.249
OID  :0.6.16.43.6.1.4.1.56813.5.25.41.1.2.1.1.1.  
Expired time   :117s

Device 0 infomation:
  Device serial number :4E21B0101565
  Device model name    :S5735-L48T4S-A1

Port VLAN ID(PVID)  :1
```

找到，`Management address value :192.168.180.249`，stelnet 192.168.180.249 进行连接。删除冲突的vlan配置。

### 为什么想到IP冲突问题？

1. 基于经验的直觉：在处理网络问题时，IP冲突是一个常见的故障点，尤其是在多设备的网络环境中。他的经验告诉他，这种现象很可能是IP冲突导致的。
2. 告警信息的直接提示：告警信息中明确显示了IP冲突的记录，这为他的怀疑提供了直接的证据。
3. 排除其他可能性：在更换跳线后问题复现的情况下，他意识到问题可能不仅仅是物理连接故障，而是网络层的配置问题。IP冲突是一个合理的怀疑方向。