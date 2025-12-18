# 安装 Windows Server更新服务

## wsus安装流程

首先要保证主机能联网，接着开始安装 wsus。

![ ](https://cdn.sa.net/2024/10/19/MzrPHGhQvClcyYZ.png)

默认就行

![ ](https://cdn.sa.net/2024/10/19/XrJVh2EvWCg7u4x.png)

选择一个新创建的空文件夹

![ ](https://cdn.sa.net/2024/10/19/UEXmHfIL8SDGvMh.png)

继续默认，直至安装完成。

![ ](https://cdn.sa.net/2024/10/19/lzC1XmPfFI7VxhB.png)

启动后安装任务

![ ](https://cdn.sa.net/2024/10/19/SuLf7NHmAVnoW6v.png)

在【管理工具】打开【Windows Server更新服务】

![ ](https://cdn.sa.net/2024/10/19/TvKgCGM8iDH25Fk.png)


是上游就选“从微软更新同步”，下游就选从其他。
 
![ ](https://cdn.sa.net/2024/10/19/F94BiDEvZTVW5fK.png)

如果 wsus 不联网这需要选择代理服务器。

![ ](https://cdn.sa.net/2024/10/19/iLdOENkUAMI9yvX.png)

选择开始连接，完成的时间取决于网速。

![ ](https://cdn.sa.net/2024/10/19/jKpm9R3uhDiTaMo.png)

![ ](https://cdn.sa.net/2024/10/19/r1LZ98bOgJBFQ2Y.png)

选择中文就好

![ ](https://cdn.sa.net/2024/10/19/yUcPaE1zGmSb4R8.png)

一般是取决于公司用的哪些系统，这里是：Server 2019、Windows 10。

![ ](https://cdn.sa.net/2024/10/19/TbMutJpBLXoizaU.png)

默认就行，驱动别选，不同机器适配驱动不一样，易造成蓝屏。

![ ](https://cdn.sa.net/2024/10/19/qBnEtOUPNIuXDof.png)

选择手动同步

![ ](https://cdn.sa.net/2024/10/19/GkESvPw2RYX9lhc.png)

也可进入到【Windows server服务】控制台进行初始同步，建议勾选，然后下一步。

![ ](https://cdn.sa.net/2024/10/19/LiUD5Y8RBxEkFmq.png)

![ ](https://cdn.sa.net/2024/10/19/xKoUH8LOpdQ4qN6.png)

执行同步

![ ](https://cdn.sa.net/2024/10/19/CQ2MU7h36dYwyp1.png)

![ ](https://cdn.sa.net/2024/10/19/SIA2kTCyncGrX6R.png)


## 遇到的问题

**WSUS连接错误需要重置服务器**

将虚拟机内存大小调高一些

![ ](https://cdn.sa.net/2024/10/19/46S9dxkbpmOQe1R.png)

IIS中 wsus pool 的专用内存限制从1.2G 设置成 3G

![ ](https://cdn.sa.net/2024/10/19/6uHWeYi4cX8m3oE.png)

![ ](https://cdn.sa.net/2024/10/19/Hl2nerNJdPAGk3I.png)


**IE浏览器老是弹出信任网站**

【本地服务器】-> 【IE增强的安全配置】将启用改成关闭

![ ](https://cdn.sa.net/2024/10/28/Kf5nNtYlq43om6V.png)


**microsoft system clr types for sql server 2012 资源查找**

Microsoft Report Viewer 2012可由分发组件，请关闭控制台，然后再安装此程序包。但需要 microsoft system clr types for sql server 2012。

![ ](https://cdn.sa.net/2024/10/28/cliSWHgR1Cfewy6.png)

见文：https://community.spiceworks.com/t/microsoft-system-clr-types-for-sql-server-2012/789626/6 ，原理是通过 SQL server 的功能包下载。

找到 SQLSysClrTypes.msi 下载

下载地址：https://www.microsoft.com/en-us/download/details.aspx?id=56041

![ ](https://cdn.sa.net/2024/10/28/dgRCOqLXhAPpDGJ.png)


## 参考资料

* [WSUS补丁服务器部署详细 利用WSUS部署更新程序](https://blog.csdn.net/z136370204/article/details/109736394)
* https://learn.microsoft.com/zh-cn/windows/deployment/update/waas-manage-updates-wsus
* [freeliver - 部署Windows Server Update Services 4.0](https://www.cnblogs.com/cmt110/p/14174151.html)
* [qishine - WSUS连接错误需要重置服务器](https://www.cnblogs.com/qishine/p/12727982.html)
* [WSUS服务器设置解析（一）](https://www.cnblogs.com/cabin/archive/2010/09/01/1814649.html)
* [AydenForYou - Windows Server 2012 R2 WSUS-6：配置计算机组和客户端目标](https://cloud.tencent.com/developer/news/897247)
* [羊村懒哥 - WSUS部署与规划](https://blog.csdn.net/m0_68472908/article/details/134919291)