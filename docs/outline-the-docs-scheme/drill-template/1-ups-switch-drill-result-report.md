# UPS切换演练结果报告

## 一、演练目的

验证长沙分中心UPS在市电中断时的自动切换能力及续航性能，确保业务连续性与数据安全。

## 二、演练时间与范围

时间：20XX-XX-XX XX:XX–XX:XX

范围：

* 一楼整层职场
* 核心机房（含生产、非生产网域控服务器及监控设备）

### **三、演练步骤与结果**

#### **3.1** **市电拉闸前检查**

| 检查项       | 状态       | 备注              |
| ------------ | ---------- | ----------------- |
| 供电来源     | 市电       | —                 |
| UPS电量      | 100%       | 主机、电池组正常  |
| 生产业务验证 | 正常       | —                 |
| 监控业务     | 正常       | —                 |
| 域控服务器   | 已安全关闭 | 生产网 / 非生产网 |

#### **3.2** **市电中断后UPS供电观察**

- **XX:XX** 市电拉闸，UPS无缝切换至电池供电。

<img src="https://i.see.you/2026/02/14/5aIv/e4838a2.png" width="50%" style="max-width:480px;height:auto;" />

<img src="https://i.see.you/2026/02/14/Sa9u/68503fb.png" width="50%" style="max-width:480px;height:auto;" />


XX:XX 启动域控服务器，业务恢复验证：生产网业务：正常；外网办公：正常；监控系统：正常。

`![](生产验证图)`

<img src="https://i.see.you/2026/02/14/Nl0q/8582b97.png" width="50%" style="max-width:480px;height:auto;" />


XX:XX–XX:XX 整层职场满负荷运行30 min，UPS电量：100% → 60%（消耗40%）

<img src="https://i.see.you/2026/02/14/Oi2o/bd8e77d.png" width="50%" style="max-width:480px;height:auto;" />

XX:XX 关闭职场配电闸，UPS仅供电给机房

<img src="https://i.see.you/2026/02/14/9eFj/59bb90e.png" width="50%" style="max-width:480px;height:auto;" />

XX:XX–XX:XX 机房独立运行30 min，UPS电量：60% → 59%（消耗1%）

<img src="https://i.see.you/2026/02/14/3lTt/46788f2.png" width="50%" style="max-width:480px;height:auto;" />

推算：机房4小时续航仅需≈20%电量，满足≥4小时要求。



#### **3.3 市电恢复与回切**

**XX:XX** 恢复市电，UPS自动回切

**验证结果**：UPS、业务、监控均正常

<img src="https://i.see.you/2026/02/14/jB8l/faf6096.png" width="50%" style="max-width:480px;height:auto;" />

`![](生产验证图)`

<img src="https://i.see.you/2026/02/14/Nl0q/8582b97.png" width="50%" style="max-width:480px;height:auto;" />

### **四、演练结论**

| 评估维度     | 结论     | 备注              |
| ------------ | -------- | ----------------- |
| UPS主机状态  | 良好     | 无告警、无异常    |
| 电池组储能   | 正常     | 无衰减、无风险    |
| 自动切换功能 | 符合预期 | 0中断             |
| 职场续航     | ≥30 min  | 实测30 min剩余60% |
| 机房续航     | ≥4 h     | 实测推算满足要求  |

**报告人**：XX运维部

 **日期**：20XX-XX-XX
