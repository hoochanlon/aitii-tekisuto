# 光纤跳纤

输入命令 `dis trans diag int XG 0/0/4`

* RX Power：光模块接收功率。
* TX Power：光模块发送功率。
* 详情，且包括其他配置诊断参考：[FIT AP V200R010C00 命令参考](https://support.huawei.com/enterprise/zh/doc/EDOC1100064380/97e36da4)

如图，范围值正常，小于-10就属于收光弱，大于2.5，收光强也没用，要用光衰，把光降到正常范围。

![](https://i.postimg.cc/HnHwCSkL/Pix-Pin-2024-10-02-21-20-44.png)

一般光收发问题，需要联系联通、电信业务弱电施工，进入弱电井进行光纤跳纤。把红光笔怼到光缆这头的光纤头子上，调节按钮为一直发光或者脉冲式发光，光缆另外一头安排个人盯着，看到光纤头子有光了，就通了。

红光笔如图示及[相关视频操作](http://baike.baidu.com/l/BXPeRiJI)。

![PixPin_2024-10-12_11-46-47.png](https://cdn.sa.net/2024/10/12/JE4nMypsvOF8wrL.png)

实际上施工师傅是从有问题的端口线路插到正常的端口线路就行了。以下视频，我们仅做了解，综合布线方向，需要专精。

* [内部培训专用 - 现场综合化维护实操专题学习之《线路维护》](https://www.bilibili.com/video/BV1Uq4y1N7qb)
* [亮哥带你学通信 - FTTH驻地网家庭宽带](https://www.bilibili.com/video/BV1tt4y1W7f4)
