# R430服务器两块硬盘组硬件 RAID

## 基础知识

**RAID-1**

基础要求：磁盘空间大小一致。

至少两块盘，完全复制另一块数据盘，一半的空间是一模一样的数据，可以容错。空间不变，性能不变，读文件相对较快，磁盘浪费50%。

**RAID-5**

基础要求：磁盘空间大小一致。

RAID-5最少需要是三块盘，把三块盘设置动态磁盘，设置RAID-5，RAID-5估算两块盘空间值作为数据备份存储，备份存储的是总容量1/3，比方说三块150G的硬盘，有两块存数据，有效存储就是300G，浪费了1/3，可以接受。

RAID-5最多六块盘，不管几块盘，RAID5只能同时坏一块盘，坏了一块盘性能就慢了，写的时候由于需要算值，性能没有多少提高。

## 从零开始组 RAID

### 设置 RAID

将两块硬盘插入服务器，安装硬盘需带有硬盘架子，如图。

![ ](https://cdn.sa.net/2024/10/26/MXLEYfNT6OCb5eZ.png)


F2 进入 BIOS 设置，设置成 RAID 模式，保存。

![ ](https://cdn.sa.net/2024/10/26/KB6YTj4GJPi1x3Q.jpg)

![ ](https://cdn.sa.net/2024/10/26/lz3Jevn4XifSBgh.jpg)

![ ](https://cdn.sa.net/2024/10/26/pRK5jI7ltNcULkJ.png)

进入 virtual disk management 设置 raid 1。

![ ](https://cdn.sa.net/2024/10/26/LPViwcDjUo68tTB.png)

选择两块磁盘点应用。

![ ](https://cdn.sa.net/2024/10/26/dnIhWyYzjtZNXHc.png)

进行 RAID 模式启用状态排查，分别查看 physical disk management、virtual disk management，发现 RAID 并未生效

![ ](https://cdn.sa.net/2024/10/26/GrYPaOzKW62FVip.png)

![ ](https://cdn.sa.net/2024/10/26/ZBixQ2FqTwk76yD.png)

### 安装 RAID 驱动

R430 参数如下

![ ](https://cdn.sa.net/2024/10/26/C8VPBsiazItrNkU.png)

根据如图标识，选择 PERC S130，进入官网下载驱动。

![ ](https://cdn.sa.net/2024/10/26/fgTysQubPFJiktL.png)

![ ](https://cdn.sa.net/2024/10/26/X24gr7zfIhwWd5q.png)

做一个启动U盘，将驱动 exe 解压放入启动盘，并用启动盘安装系统

![ ](https://cdn.sa.net/2024/10/26/7vMZmwCld2VUTfS.png)

![ ](https://cdn.sa.net/2024/10/26/FpKbqBo9tdvwVyC.png)

选择 one-shot，选择启动U盘

![ ](https://cdn.sa.net/2024/10/26/ZqvfQASwJknYsUV.png)

![ ](https://cdn.sa.net/2024/10/26/N6qjhLb1GwVlHdW.png)

在浏览处选择【加载驱动程序】。

![ ](https://cdn.sa.net/2024/10/26/YiWvwfJ26UPFG95.png)

![ ](https://cdn.sa.net/2024/10/26/58hpMXQ6U1betsw.png)

选择之前解压驱动所放入的启动盘，接着就会识别到驱动配置，点安装。

![ ](https://cdn.sa.net/2024/10/26/FJZIXajoevy4PSM.png)

![ ](https://cdn.sa.net/2024/10/26/8sKScmfQOeT2u6n.png)

此时已经可以发现硬盘了。

![ ](https://cdn.sa.net/2024/10/26/lnr4xaMkFQJoHXm.png)


安装完系统在【设备管理器】查看驱动详细

* 磁盘驱动器、存储控制器，关键字：S130
* 其他设备，关键字：RAID。

## 没装 RAID 驱动的比照图

硬 raid 不像软 raid 能够一眼看出，硬 RAID 效果如图

![ ](https://cdn.sa.net/2024/10/26/nGa3ALZkNgcWO67.png)

![ ](https://cdn.sa.net/2024/10/26/DpCea6XOgusoH9w.png)


对比之前没装过 RAID驱动，软 raid 实现是需要三块硬盘组 raid 1的。

![ ](https://cdn.sa.net/2024/10/26/2AyIdEYk7XL6QCM.jpg)

![ ](https://cdn.sa.net/2024/10/26/oEF3mHfiYCnheNk.jpg)

online 与 unknown。

![ ](https://cdn.sa.net/2024/10/26/XYGfb8VWcEQp3KD.png)

![ ](https://cdn.sa.net/2024/10/26/ZBixQ2FqTwk76yD.png)

## BIOS固件更新与驱动安装

### BIOS固件更新

将网线把电脑和服务器连接起来，配置好IP，在这里可以设置IP。

![ ](https://cdn.sa.net/2024/10/26/3fwyRIYMLz7n5om.png)

这里不是装驱动，这里是 iDRAC 远程控制 web 界面刷新、更新那个BIOS固件，固件和驱动不是一回事，别乱刷把主板刷疯掉。操作可参考：[丁辉博客 - DELL服务器使用iDRAC升级BIOS等固件版本](https://www.dinghui.org/dell-idrac-upgrade.html)

![ ](https://cdn.sa.net/2024/10/26/SJEfAopx6P7zQNi.png)

### 组RAID完成后，安装系统驱动

按照默认提示的server系统版本安装：芯片组、网卡、显卡等。

![ ](https://cdn.sa.net/2024/10/26/ItidWzRCYVE1mLv.png)


## 参考资料

* [安迪克斯.NET - 图文详解：如何在Windows系统中构建raid磁盘阵列](https://andyx.net/create_raid_disk_array_in_windows_system/)
* [csdn100861 - 什么是RAID？ 硬RAID 和软RAID的区别是什么？](https://blog.csdn.net/csdn100861/article/details/51439718)
* [丁辉博客 - DELL服务器使用iDRAC升级BIOS等固件版本](https://www.dinghui.org/dell-idrac-upgrade.html)