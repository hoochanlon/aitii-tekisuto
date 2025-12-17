## 月度防火墙备份

备份要求：外网，内网主备。每月备份一次防火墙配置，文件夹命名方式： \20241005\生产内网防火墙-备

**额外进行防火墙一周流量统计**

在面板的【接口流量统计】，点击设置按钮，选择流入或流出，每日登记按开始上班的时间的当天60分钟，统计高峰值。或者一周24小时或按30天来统计。


![ ](https://cdn.sa.net/2024/10/21/Er5Ma96mSxd2snF.png)

上行流入，下行流出，按此登记。

![ ](https://cdn.sa.net/2024/10/11/HmyXQ6FxwApg3Bq.png)

## 防火墙日志导出


配置允许规则

![ ](https://cdn.sa.net/2024/11/19/IDFsEhW83aLfewV.png)

```
ftp server enable
```

![ ](https://cdn.sa.net/2024/11/20/ylpGe2hEbvLTkQ4.png)


```
ftp <server ip>
binary
cd log
get xxxx.zip
```

![ ](https://cdn.sa.net/2024/11/19/aFoCG8LfzWinkJb.png)


还有种方式就是进入【监控】->【诊断中心】->【信息采集】，进行采集与导出工作。

![ ](https://cdn.sa.net/2024/11/19/2k5TItFg1HZzURi.png)


