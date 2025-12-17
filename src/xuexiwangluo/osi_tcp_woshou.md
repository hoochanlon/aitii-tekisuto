# 面试TCP三次握手的学习理解

[eNSP全套软件下载地址汇总-华为企业互动社区](https://forum.huawei.com/enterprise/cn/zh/thread/blog/580934378039689216?blogId=580934378039689216)


## OSI 各层作用

![PixPin_2024-12-16_11-38-50](https://img.yonrd.com/i/2024/12/16/ixd7bd.png)

## TCP/IP层

![](https://www.sdada.edu.cn/__local/A/9D/17/FCA60C83850B8113BB5E61C11F9_F9BF22D2_2A8EF.png)

## 数据传输过程

![](https://www.sdada.edu.cn/__local/D/5F/FD/3DBBFB1760B257993ACD81359B1_5AE5ABB8_2E061.png)

## TCP三次握手过程

syn：同步；seq：序号；ack：确认码。

![PixPin_2024-12-16_11-07-53](https://img.yonrd.com/i/2024/12/16/ic9qy8.png)

理解方式，双方对话：1、我发送消息。2、你确认接收。3、我回复已读。

## TCP三次握手应用

![PixPin_2024-12-16_10-57-23](https://img.yonrd.com/i/2024/12/16/hilakl.png)

## TCP四次挥手

四次挥手则是指终止TCP连接协议时，需要在客户端和服务器之间发送四个数据包。

![PixPin_2024-12-16_11-18-09](https://img.yonrd.com/i/2024/12/16/ii9dya.png)

理解方式，如双方会话：

* 我想关闭。

* 你已读，发送是否确认关闭。

* 你发送关闭通知。

* 我已读，回复确认消息。

## 网络设备分层设计

![PixPin_2024-12-16_21-18-57](https://img.yonrd.com/i/2024/12/16/z2at5e.png)

![PixPin_2024-12-16_21-23-27](https://img.yonrd.com/i/2024/12/16/z47tr7.png)

## 常用网络协议神图

![网络协议神图](https://img.yonrd.com/i/2024/12/16/j03ok5.jpeg)

参考

* [【网络】【TCP】TCP 连接断开（四次挥手详解） - 酷酷- - 博客园](https://www.cnblogs.com/kukuxjx/p/17507676.html)

* [什么是TCP三次握手和四次挥手，TCP协议详细解析！](https://baijiahao.baidu.com/s?id=1812306326876653483&wfr=spider&for=pc)

* [【图解】三次握手，四次挥手 —— 用心看这一篇就够了-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/2015692)

* [📡OSI七层协议大揭秘🔍](https://mbd.baidu.com/newspage/data/dtlandingsuper?nid=dt_5088967090732549889&sourceFrom=search_a)

* [一文搞懂OSI参考模型与TCP/IP-山东工艺美术学院网络信息管理中心](https://www.sdada.edu.cn/wl/info/1073/1627.htm)
