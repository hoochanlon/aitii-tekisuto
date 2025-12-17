# 组织单元与域用户还原（应急储备）

## 组织单元还原

### 删除组织单元

> [support.huawei.com - AD上删除OU失败，提示没有权限删除](https://support.huawei.com/enterprise/zh/knowledge/EKB1000494682)

你没有足够的权限删除，或者该对象受保护，以防止意外删除。

![ ](https://cdn.sa.net/2024/10/27/LbkXPYEHCepfgBG.png)

在“Active Directory用户和计算机”窗口中，点击菜单栏上的“查看”，然后选择“高级功能”。这一步是为了显示更多高级选项，包括组织单元的属性设置。

![ ](https://cdn.sa.net/2024/10/27/UXw1ageAfB4i9nG.png)

或者右键【查看】选择【高级功能】

![ ](https://cdn.sa.net/2024/10/27/QNTRE6zKJhZawjx.png)

在【属性】里反向勾选【防止对象意外删除】

![ ](https://cdn.sa.net/2024/10/27/lLbOI3nSNsH4gmQ.png)

记得转移用户，否则连在组内的用户也会一并删除。

![ ](https://cdn.sa.net/2024/10/27/wBxca5SKq4HZg1l.png)

### 恢复组织单元

有时过滤器条件过于具体，导致无法匹配到对象。例如，如果使用了特定的 samAccountName 或 Name 值，但在AD中不存在这个精确的值，那么搜索将返回空结果。可以尝试 ObjectClass 过滤器，以确保返回所有被删除的OU，而不是基于名称的特定过滤器。

一、查询被删除的组织单元

```
Get-ADObject -Filter { ObjectClass -eq "organizationalUnit" } -IncludeDeletedObjects -SearchBase (Get-ADDomain).DeletedObjectsContainer
```

二、找到相关GUID

```
Restore-ADObject -Identity "e419292d-bbf3-4d9d-9b09-34cac1676367"
```

![ ](https://cdn.sa.net/2024/10/27/CkSEtjQOUxgZ3Fn.png)


## 域用户还原

> 恢复域用户以前在文件夹的共享权限及安全权限都会复原，从未知用户变回来的。

### 恢复域用户

> [小k2023 - 恢复AD用户误删，给你3种方案！](https://blog.51cto.com/huangkui/2822132)


张三没有删除前 Deleted 后面是空值，同时也可查出一些同名的被删除。

```
Get-ADObject -Filter {samaccountname -eq " 张三"} -IncludeDeletedObjects
```

![ ](https://cdn.sa.net/2024/10/27/QbSJZInlqxmLCKj.png)


第一种方式

> https://learn.microsoft.com/zh-tw/powershell/module/activedirectory/restore-adobject?view=windowsserver2022-ps

```
Restore-ADObject -Identity fc9ef534-e4b4-4bda-b894-4e91797d233e"" -NewName "张三1" -TargetPath "OU=生产团队,DC=CSYLQ,DC=COM"
```

第二种方式

> https://www.manageengine.cn/ad-recovery-manager/powershell-backup-active-directory-restore-cmdlets.html


```
(Get-ADObject -SearchBase (get-addomain).deletedobjectscontainer -IncludeDeletedObjects -filter "samaccountname -eq '王诗诗'") | Restore-ADObject -NewName "王诗诗"
```

恢复账户后，通常需要设置密码强度来启用账户

```
Set-ADAccountPassword -Identity "王诗诗" -NewPassword (ConvertTo-SecureString -AsPlainText "Mima123" -Force)

Enable-ADAccount -Identity "王诗诗"
```

1. 如果操作对象的组织单元也没了，恢复则会报错：由于对象的父类不是未范例化就是被删除了，所以不能执行操作。
2. 如果重名：试图给目录添加一个名称已在使用中的对象。


## 图形界面

【管理工具】选择 【active directory 管理中心】（DSAC）

![ ](https://cdn.sa.net/2024/10/27/Zu1GqAjyip3COM5.png)

启用回收站

![ ](https://cdn.sa.net/2024/10/27/DWM3KQnwIlmEiaJ.png)

注意：回收站一旦开启将无法禁用，效果还挺好。

![ ](https://cdn.sa.net/2024/10/27/zbBuRKcYF9HfIEl.png)

