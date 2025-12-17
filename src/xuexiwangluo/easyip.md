# ACL结合NAT实现EasyIP

## ACL

ACL（访问控制列表）的应用原则:

* 标准ACL，尽量用在靠近目的点
* 扩展ACL，尽量用在靠近源的地方 (可以保护带宽和其他资源)
* 方向：在应用时，一定要注意方向

ACL分类：

* 基本
  * 2000~2999：可使用IPV4报文的源IP地址、分片标记和时间段信息来定义规则
* 高级
  * 3000~3999：ICMP类型、TCP源端口/目的端口等来定义规则
* 二层
  * 4000~4999：可根据源MAC目的MAC地址、以太帧协议类型等。
* 自定义
  * 5000~5999：其他配置组合

ACL相关示例：[华为交换机ACL的配置规则及实例_华为交换机acl配置实例-CSDN博客](https://blog.csdn.net/ChaseAug/article/details/121290316)

## Easy ip

* [配置内网用户通过Easy IP方式访问Internet外网的示例 - AR100, AR120, AR150, AR160, AR200, AR300, AR1200, AR2200, AR3200, AR3600 典型配置案例（命令行） - 华为](https://support.huawei.com/enterprise/zh/doc/EDOC0000707956/6753723e)
* [开放原子开发者工作坊 - 华为ensp配置cloud问题（已解决）](https://openatomworkshop.csdn.net/67400d6d522b003a546ddd87.html)

> ENSP配置cloud ping不通的问题，注意关闭防火墙

![PixPin_2025-01-02_11-17-27](https://img.yonrd.com/i/2025/01/02/ihc70w.png)

![PixPin_2025-01-02_11-10-58](https://img.yonrd.com/i/2025/01/02/idrk76.png)

```
acl number 2000  
 rule 1 permit source 192.168.0.0 0.0.0.255 

interface GigabitEthernet0/0/0
 ip address 10.10.10.2 255.255.255.0 
 nat outbound 2000

interface GigabitEthernet0/0/1
 ip address 192.168.0.254 255.255.255.0 

ip route-static 0.0.0.0 0.0.0.0 10.10.10.1
```



