# 网络不稳定

>  例如：把一台使用100M网卡的计算机连接到1000M的交换机上，假如交换机的端口设置为自动协商，最终交换机的端口会协商为100M全双工模式。假如交换机的端口强制设置为1000M，将导致自协商不能通过，此计算机无法连接网络。
>
> 自协商完全由物理层芯片设计实现，因此并不使用专用数据包或带来任何高层协议开销。如果协商通过，网卡就把链路置为激活状态，可以开始传输数据了。如果不能通过，则该链路不能使用。如果有一端不支持自动协商，则支持自动协商的一端选择一种默认的方式工作，一般情况下是10M半双工模式。
> 
>
> 摘自 [yuyin86 - 以太网接口的双工模式及自动协商原理](https://blog.csdn.net/yuyin86/article/details/25460029)



## 参考资料

* [流水灯 - 以太网 ------ Auto-Negotiation（自动协商）](https://www.cnblogs.com/god-of-death/p/9362841.html)
* [yuyin86 - 以太网接口的双工模式及自动协商原理](https://blog.csdn.net/yuyin86/article/details/25460029)
* [zhuloong - 有线网设置网速、解决有线网网速太慢、路由器无线网能达到百兆100M有线网只有十兆10M](https://blog.csdn.net/qq_45094823/article/details/132509778)
* [tp-link - 电脑有线连接千兆路由器/千兆交换机，协商速率只有百兆？](https://smb.tp-link.com.cn/service/detail_article_3522.html)