# FSMO 准备资料

## 基本概述

FSMO是灵活单主机操作（Flexible ingle Master Operation）的缩写，是被设置为担任提供特定角色信息的网域控制站，在活动目录中有五种FSMO角色，并且分为两大类：

**Forest林级别，在整个林中只能有一台DC拥有访主机角色**

* 架构主机（Schema Master）：作用是修改活动目录的源数据。
* 域命令主机（Domain Naming Master）：它的主要作用是管理森林中域的添加或者删除。

**Domain域级别，在域中只有一台DC拥有该角色**

* PDC模拟器（PDC Emulator）：Windows 2000域开始，不再区分PDC还是BDC，但实际上有些操作则必须要由PDC来完成，那就由PDC Emulator来完成。
* RID主（RID Master）：分配可用RID池给域内的DC和防止安全主体的SID重复。
* 基础架构主机（Infrastructure Master）：它的主要作用就是用来更新组的成员列表，因为在活动目录中很有可能有一些用户从一个域转移到另外一个域。

**在FSMO的规划时的原则**

1. 占有 Domain Naming Master 角色的域控制器必须同时也是GC;
2. 不能把 Infrastructure Master 和GC放在同一台DC上;
3. 建议将 Schema Master 和 Domain Naming Master 放在森林根域的GC服务器上;
4. 建议将 Schema Master和 Domain Naming Master 放在同一台域控制器上;
5. 建议将 PDC Emulator、RID Master及 Infrastructure Master 放在同一台性能较好的域控制器上;
6. 尽量不要把 PDC Emulator、RID Master及 Infrastructure Master 放置在GC服务器上;

> [Brock Bingham - What are FSMO roles?](https://www.pdq.com/blog/what-are-fsmo-roles/)

![ ](https://images.ctfassets.net/xwxknivhjv1b/4SKshu6HF8AYBOkyb3VdsT/6b2c09463c0571d27f9542c6a94eabd8/fsmo_1-1-.png)


**全局编录（global Catalog，GC）**

全局编录包含了各个活动目录中每一个对象的最重要的属性，是域林中所有对象的集合。在域林中，同一域林中的域控制器共享同一个活动目录，这个活动目录是分散存放在各个域的域控制器中的，每个域中的域控制器保存着该域的对象的信息（用户账号及目录数据库等）。

如果一个域中的用户要访问另一个域中的资源，则要先找到另一个域中的资源。为了让用户快速的查找到另一个域内的对象，微软设计了全局编录（global Catalog，GC）。全局编录包含了各个活动目录中每一个对象的最重要的属性（即部分属性），这样，即使用户或应用程序不知道对象位于哪个域，也可以迅速找到被访问的对象。

## 参考资料


* [百度百科 - FSMO](https://baike.baidu.com/item/FSMO/2914128)
* [何星星 - AD 域 FSMO 五大角色详解](https://hexingxing.cn/fsmo/)
* [iloli - AD中FSMO五大角色的介绍及操作（转移与抓取）](https://blog.csdn.net/iloli/article/details/6620033)
* [安全脉搏 - Active Directory 域服务–域控架构详解1](https://zhuanlan.zhihu.com/p/51266642)
* [青枫口 - 活动目录操作主机（FSMO）角色详解](https://blog.51cto.com/huanwenli/2176132)
* [ycrsjxy - Windows Server 2008 R2之五操作主控的管理](https://blog.51cto.com/ycrsjxy/203092)
* [ねこまるの AD フリーク -【AD基礎】FSMOとは？FSMOの各役割について詳説！](https://pkiwithadcs.com/about_fwsmo_role/)
