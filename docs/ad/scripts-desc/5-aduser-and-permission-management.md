# 域用户人员增删、文件授权、组织单元与域用户恢复

三大主题：

* 批量添加、删除域用户
* 批量对人员进行文件夹授权
* 组织单元与域用户还原

## 批量添加、删除域用户

缘起：由于每个消费业务的同事都需要登录域用户上机操作的，分配不同的组长，因此有着不同组长共享文件夹访问权限，以及通用的质检文件夹访问权限，这就需要根据人事已提供的 ”域控权限申请登记表“，繁复的进行对人员的域账户添加及相关文件授权。

![](https://cdn.sa.net/2024/10/27/nghrE4ysNVWmjFS.png)

### 批量添加域用户

一、以添加新用户到组织单元【生产团队】里的子级【售后】单元为例

二、域名以 CSYLQ 为例

三、初始密码固定，登录需要更改初始密码，域用户都在其业务的组织单元内。

```powershell
# 导入Active Directory模块
Import-Module ActiveDirectory

# 测试一行命令
# New-ADUser -Name "王光光" -SamAccountName "王光光" -UserPrincipalName "王光光@CSYLQ.com" `
#            -Path "OU=消费业务,OU=生产团队,DC=CSYLQ,DC=com" -GivenName "光光" -Surname "王" `
#            -AccountPassword (ConvertTo-SecureString "Mima12345" -AsPlainText -Force) `
#            -Enabled $true -ChangePasswordAtLogon $true

<# 参考资料：https://learn.microsoft.com/en-us/powershell/module/activedirectory/new-aduser?view=windowsserver2022-ps #>

# 读取txt文件中的用户列表
$filePath = "C:\Users\Administrator\Desktop\添加用户.txt"  # 替换为实际的文件路径
$userList = Get-Content -Path $filePath  # -Encoding UTF8

# 固定密码
$password = "Mima12345"

# 循环处理用户列表
foreach ($userName in $userList) {
    # 尝试创建用户
    try {
        New-ADUser -Name $userName -SamAccountName $userName -UserPrincipalName "$userName@csylq.com" `
                   -Path "OU=售后,OU=生产团队,DC=CSYLQ,DC=com" `
                   -AccountPassword (ConvertTo-SecureString $password -AsPlainText -Force) `
                   -Enabled $true -ChangePasswordAtLogon $true

        Write-Host "用户 $userName 已成功创建。"
    } catch {
        Write-Host "创建用户 $userName 时发生错误: $_"
    }
}

# 暂停脚本
Read-Host "按 Enter 键继续..."
```

![](https://cdn.sa.net/2024/10/27/FxUu2zvlBTV9d53.png)


### 批量删除域用户


```powershell
# 导入Active Directory模块
Import-Module ActiveDirectory

# 读取txt文件中的用户列表
$filePath = "C:\Users\Administrator\Desktop\删除用户.txt"  # 替换为实际的文件路径
$userList = Get-Content -Path $filePath # -Encoding UTF8

# 循环删除用户
foreach ($user in $userList) {
    try {
        Remove-ADUser -Identity $user -Confirm:$false -ErrorAction Stop
        Write-Host "已删除用户: $user"
    } catch {
        Write-Host "用户 $user 不存在，已忽略错误。"
    }
}

# 暂停脚本
Read-Host "按 Enter 键继续..."
```

![](https://cdn.sa.net/2024/10/27/aupKFxJOd3mftZR.png)

## 批量对人员进行文件夹授权

![](https://cdn.sa.net/2024/10/27/nghrE4ysNVWmjFS.png)

相关要求：

* 读取权限说明：共享权限：读取；安全权限（NTFS权限）读取。
* 编辑、读写权限说明：共享权限：读取、更改；安全权限：读取、读取和执行、列出文件内容、修改、写入。

质检文件夹权限是通用的，所以可以做成规模化的脚本执行。组员不同所属组长的文件夹权限，可以用简单的命令形式执行。

### 单个文件夹批量授权

起手

从最简单的起手，单个用户设置文件夹权限。其他相关处理，可参考这篇文章：[suv789 - 当使用 PowerShell 管理 Active Directory（AD）域用户时，以下是一些初级的示例和操作：PowerShell 在进行 AD 域用户管理时的强大功能和灵活性。PowerShell 在自动化和管理 Active Directory 域用户方面的强大能力，能够高效处理复杂的管理任务和安全操作](https://www.cnblogs.com/suv789/p/18284489)

```
<#安全权限#>

# 安全权限设置为只读。
icacls "C:\共享文件夹\谢多意组" /grant "csylq\王诗语:(OI)(CI)(R)" /t # /t 表示递归

# 安全权限设置为编辑
icacls "C:\共享文件夹\樊小华" /grant "csylq\王诗语:(OI)(CI)(M)" /t

# 安全权限设置为读取、读取和执行、列出文件内容
icacls "C:\共享文件夹\谢多意组" /grant "csylq\王诗语:(OI)(CI)(RX)" /t

# 删除用户文件夹权限
icacls "C:\共享文件夹\谢多意组" /remove "csylq\王诗语" /t

<#共享权限#>

# 读写权限
Grant-SmbShareAccess -Name "樊小华组" -AccountName "csylq\王诗语" -AccessRight Change -Force

# 只读权限
Grant-SmbShareAccess -Name "谢多意组" -AccountName "csylq\王诗语" -AccessRight Read -Force

# 完全控制
Grant-SmbShareAccess -Name "朱爱梅组" -AccountName "csylq\王诗语" -AccessRight Full -Force

# 删除权限
Revoke-SmbShareAccess -Name "谢多意组" -AccountName "csylq\王诗语" -Force

<#
同一用户不能同时使用 -ReadAccess 和 -ChangeAccess，因为这会产生冲突。
你需要选择一种权限方式，要么是读取，要么是修改（Change 权限已经包含了读取权限）。
所以在这种情况下，给用户直接赋予 Change 权限就足够了，因为它包括读取和写入权限。
之所以精准定位是因为共享名称唯一，共享文件夹改名变成独立的非共享文件夹。
#>
```

成型

以批量授权用户质检文件夹访问权限只读为例

![](https://cdn.sa.net/2024/10/27/CoyB1I27hMtcJL9.png)

```powershell
# 定义共享名称和文件夹路径
$shareName = "质检"  # 共享名称
$folderPath = "C:\共享文件夹\质检"  # 共享文件夹的实际路径
$domainUsersFile = "C:\Users\Administrator\Desktop\质检名单.txt"  # 包含用户的txt文件路径（不带域名）

# 定义域名
$domain = "CSYLQ"

# 读取txt文件，假设每行是一个用户名（不带域名）
$domainUsers = Get-Content -Path $domainUsersFile

foreach ($user in $domainUsers) {
    # 为每个用户加上域名前缀
    $fullUserName = "$domain\$user"

    Write-Host "正在为用户 $fullUserName 添加权限..."

    # 1. 添加共享权限（只读）
    try {
        Grant-SmbShareAccess -Name $shareName -AccountName $fullUserName -AccessRight Read -Force
        Write-Host "共享权限：用户 $fullUserName 已被授予只读访问权限。"
    } catch {
        Write-Host "共享权限：无法为用户 $fullUserName 添加访问权限，可能该用户已存在或发生其他错误。"
    }

    # 2. 添加NTFS权限（只读）
    try {
        # 使用icacls命令授予用户只读权限
        # 显式 vs 继承权限：普通权限界面显示的是显式设置的权限，而“高级”选项中还会显示从父文件夹或其他权限继承而来的权限。
        # $icaclsCommand = "icacls `"$folderPath`" /grant `"${fullUserName}:(R)`" /t" # 隐示权限
        #(OI) 是“对象继承”，表示权限将应用到文件夹内的文件。
        #(CI) 是“容器继承”，表示权限将应用到文件夹内的子文件夹。
        $icaclsCommand = "icacls `"$folderPath`" /grant `"${fullUserName}:(OI)(CI)R`" /t" # 显示权限
        # 将字符串转换为命令
        Invoke-Expression $icaclsCommand
        Write-Host "NTFS权限：用户 $fullUserName 已被授予只读访问权限。"
    } catch {
        Write-Host "NTFS权限：无法为用户 $fullUserName 添加访问权限，可能发生错误。"
    }
}
```

![](https://cdn.sa.net/2024/10/27/aEDfri2lAuOSMZX.png)

![](https://cdn.sa.net/2024/10/27/DfJXyzmaEvhWtQk.png)


### 多个文件夹批量授权

对生产作业1、生产作业2文件夹进行批量授权相关用户读写操作。

```powershell
# 定义共享名称和文件夹路径
$shares = @(
    # 定义了一个包含两个共享的数组 $shares。在循环中，我们为每个用户和每个共享依次添加权限。
    # 这样，用户将同时获得对“生产作业1”和“生产作业2”两个文件夹的访问权限。
    @{ Name = "生产作业1"; Path = "C:\共享文件夹\生产作业1" },
    @{ Name = "生产作业2"; Path = "C:\共享文件夹\生产作业2" }
)

$domainUsersFile = "C:\Users\Administrator\Desktop\生产作业名单.txt"  # 包含用户的txt文件路径（不带域名）

# 定义域名
$domain = "CSYLQ"

# 读取txt文件，假设每行是一个用户名（不带域名）
$domainUsers = Get-Content -Path $domainUsersFile

foreach ($user in $domainUsers) {
    # 为每个用户加上域名前缀
    $fullUserName = "$domain\$user"

    foreach ($share in $shares) {
        Write-Host "正在为用户 $fullUserName 添加权限到共享 $($share.Name)..."

        # 1. 添加共享权限（只读）
        try {
            Grant-SmbShareAccess -Name $share.Name -AccountName $fullUserName -AccessRight Change -Force
            Write-Host "共享权限：用户 $fullUserName 已被授予 $($share.Name) 的只读访问权限。"
        } catch {
            Write-Host "共享权限：无法为用户 $fullUserName 添加访问权限到 $($share.Name)，可能该用户已存在或发生其他错误。"
        }

        # 2. 添加NTFS权限（只读）
        try {
            $icaclsCommand = "icacls `"$($share.Path)`" /grant `"${fullUserName}:(OI)(CI)(M)`" /t" # 显示权限
            # 将字符串转换为命令
            Invoke-Expression $icaclsCommand
            Write-Host "NTFS权限：用户 $fullUserName 已被授予 $($share.Name) 的只读访问权限。"
        } catch {
            Write-Host "NTFS权限：无法为用户 $fullUserName 添加访问权限到 $($share.Name)，可能发生错误。"
        }
    }
}
```

![](https://cdn.sa.net/2024/10/27/3hofrswHJpy1ZY5.png)

![](https://cdn.sa.net/2024/10/27/7YdOu843rxvSi5j.png)

## 批量删除文件夹权限的未知用户残留

如果用户此前在相关文件夹有对应的共享、安全权限，常规直接删除用户会留下残留，如图。

![](https://cdn.sa.net/2024/10/28/1cvfjOIPAxiEstG.png)

![](https://cdn.sa.net/2024/10/28/alWTyNHIMES2fXR.png)

### 删除安全权限：删除文件夹未知用户的安全权限

```powershell
# 定义共享文件夹路径
$folderPath = "C:\共享文件夹\生产作业2"

# 获取文件及文件夹的现有权限
$acl = Get-Acl -Path $folderPath

# 查找并删除所有未知用户（使用 SID 表示的权限）
$acl.Access | Where-Object { $_.IdentityReference -match "^S-1-" } | ForEach-Object {
    $acl.RemoveAccessRule($_)
}

# 应用更改后的 ACL
Set-Acl -Path $folderPath -AclObject $acl

Write-Output "已成功删除文件夹 $folderPath 中的未知用户权限"
```

![](https://cdn.sa.net/2024/10/28/ZnSOJNlWCwm7BkK.png)

删除根目录中所有文件夹中包含未知用户的安全权限

```powershell
# 定义根文件夹路径
$folderPath = "C:\共享文件夹"  # 替换为实际路径

# 递归遍历指定文件夹及其子文件夹
Get-ChildItem -Path $folderPath -Recurse | ForEach-Object {
    # 获取当前文件或文件夹的 ACL
    $acl = Get-Acl -Path $_.FullName

    # 查找所有未知用户（SID 格式且没有解析为用户名的账户）
    $unknownSIDs = $acl.Access | Where-Object { $_.IdentityReference -match "^S-1-" }

    # 删除每个未知用户的权限
    foreach ($rule in $unknownSIDs) {
        $acl.RemoveAccessRule($rule)
        Write-Output "已删除文件/文件夹 $($_.FullName) 中的未知用户权限: $($rule.IdentityReference.Value)"
    }

    # 将更改后的 ACL 应用到文件或文件夹
    Set-Acl -Path $_.FullName -AclObject $acl
}

Write-Output "已成功删除文件夹 $folderPath 中所有未知用户的安全权限"
```

![](https://cdn.sa.net/2024/10/28/kDamfRUSqgYXKlP.png)

### 删除共享权限：删除未知用户共享权限

```powershell
# 定义共享名称
$shareName = "生产作业2"  # 替换为实际共享名称

# 获取共享的访问权限
$accessRules = Get-SmbShareAccess -Name $shareName

# 筛选未知用户（匹配 AccountName 包含 SID 的条目）
$unknownSIDs = $accessRules | Where-Object { $_.AccountName -match "S-1-" }

# 遍历并删除每个未知用户的共享权限
foreach ($rule in $unknownSIDs) {
    $unknownSID = $rule.AccountName
    Write-Output "正在删除共享 '$shareName' 中的未知用户权限: $unknownSID"
    Revoke-SmbShareAccess -Name $shareName -AccountName $unknownSID -Force
}

Write-Output "已成功删除共享 '$shareName' 中所有未知用户的权限"
```

![](https://cdn.sa.net/2024/10/28/gyVwTYX3lMKauZ9.png)

删除所有共享文件夹中的未知用户权限

```powershell
# 获取所有共享
$shares = Get-SmbShare

# 遍历每个共享
foreach ($share in $shares) {
    $shareName = $share.Name
    Write-Output "正在处理共享文件夹: $shareName"

    # 获取当前共享的访问权限
    $accessRules = Get-SmbShareAccess -Name $shareName

    # 筛选未知用户（匹配 SID 格式的账户）
    $unknownSIDs = $accessRules | Where-Object { $_.AccountName -match "S-1-" }

    # 删除每个未知用户的共享权限
    foreach ($rule in $unknownSIDs) {
        $unknownSID = $rule.AccountName
        Write-Output "  删除共享 '$shareName' 中的未知用户权限: $unknownSID"
        Revoke-SmbShareAccess -Name $shareName -AccountName $unknownSID -Force
    }
}

Write-Output "已成功删除所有共享文件夹中的未知用户权限"
```

![](https://cdn.sa.net/2024/10/28/csArnl3BzIw5Gq7.png)

## 组织单元与域用户还原

### 组织单元还原：删除组织单元

[support.huawei.com - AD上删除OU失败，提示没有权限删除](https://support.huawei.com/enterprise/zh/knowledge/EKB1000494682)

![](https://cdn.sa.net/2024/10/27/LbkXPYEHCepfgBG.png)

在“Active Directory用户和计算机”窗口中，点击菜单栏上的“查看”，然后选择“高级功能”。这一步是为了显示更多高级选项，包括组织单元的属性设置。

![](https://cdn.sa.net/2024/10/27/UXw1ageAfB4i9nG.png)

或者右键【查看】选择【高级功能】

![](https://cdn.sa.net/2024/10/27/QNTRE6zKJhZawjx.png)

在【属性】里反向勾选【防止对象意外删除】

![](https://cdn.sa.net/2024/10/27/lLbOI3nSNsH4gmQ.png)

记得转移用户，否则连在组内的用户也会一并删除。

![](https://cdn.sa.net/2024/10/27/wBxca5SKq4HZg1l.png)

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

![](https://cdn.sa.net/2024/10/27/CkSEtjQOUxgZ3Fn.png)


### 域用户还原：恢复域用户

> 恢复域用户以前在文件夹的共享权限及安全权限都会复原，从未知用户变回来的。

张三没有删除前 Deleted 后面是空值，同时也可查出一些同名的被删除。

```
Get-ADObject -Filter {samaccountname -eq " 张三"} -IncludeDeletedObjects
```

![](https://cdn.sa.net/2024/10/27/QbSJZInlqxmLCKj.png)

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

图形界面

【管理工具】选择 【active directory 管理中心】（DSAC）

![](https://cdn.sa.net/2024/10/27/Zu1GqAjyip3COM5.png)

启用回收站

![](https://cdn.sa.net/2024/10/27/DWM3KQnwIlmEiaJ.png)

注意：回收站一旦开启将无法禁用，效果还挺好。

![](https://cdn.sa.net/2024/10/27/zbBuRKcYF9HfIEl.png)

## 对批量授权方面进行补充

两个不同文件夹分别进行读取和写入授权

注：之前批量文件夹授权读写的脚本代码注释存在笔误，已更正。

对 生产作业1 读取、生产作业2 读写的批量操作。

```powershell
# 定义域名
$domain = "CSXZX"

# 定义共享名称和文件夹路径
$shareName1 = "生产作业1"  # 共享名称
$folderPath1 = "C:\共享文件夹\生产作业1"  # 共享文件夹的实际路径

$shareName2 = "生产作业2"  # 共享名称
$folderPath2 = "C:\共享文件夹\生产作业2"  # 共享文件夹的实际路径

$domainUsersFile = "C:\Users\Administrator\Desktop\生产作业名单.txt"  # 包含用户的txt文件路径（不带域名）

# 读取txt文件，假设每行是一个用户名（不带域名）
$domainUsers = Get-Content -Path $domainUsersFile

foreach ($user in $domainUsers) {
    # 为每个用户加上域名前缀
    $fullUserName = "$domain\$user"

    Write-Host "正在为用户 $fullUserName 添加权限..."

    # 1. 添加共享权限
    try {
        Grant-SmbShareAccess -Name $shareName1 -AccountName $fullUserName -AccessRight Read -Force
        Write-Host "共享权限：用户 $fullUserName 已被授予  $shareName2 访问权限。"

        Grant-SmbShareAccess -Name $shareName2 -AccountName $fullUserName -AccessRight Change -Force
        Write-Host "共享权限：用户 $fullUserName 已被授予 $shareName2 读写权限。"

    } catch {
        Write-Host "共享权限：无法为用户 $fullUserName 添加访问权限，可能该用户已存在或发生其他错误。"
    }

    # 2. 添加NTFS权限（只读）
    try {
        $icaclsCommand1 = "icacls `"$folderPath1`" /grant `"${fullUserName}:(OI)(CI)R`" /t" # 显示权限
        $icaclsCommand2 = "icacls `"$folderPath2`" /grant `"${fullUserName}:(OI)(CI)M`" /t" # 显示权限
        # 将字符串转换为命令
        Invoke-Expression $icaclsCommand1
        Invoke-Expression $icaclsCommand2
        Write-Host "NTFS权限：用户 $fullUserName 已被授予 $folderPath1 只读访问权限。"
         Write-Host "NTFS权限：用户 $fullUserName 已被授予 $folderPath2 读写权限。"
    } catch {
        Write-Host "NTFS权限：无法为用户 $fullUserName 添加访问权限，可能发生错误。"
    }
}
```

效果

![](https://cdn.sa.net/2024/11/09/V1d3v4e9FJXshTi.png)

![](https://cdn.sa.net/2024/11/09/n5NqXvjm8zMtWJy.png)

批量特定授权

如图，我们既要对相关文件夹（比如：共享文件夹名是“徐冬冬组”，但也有可能是“徐冬冬”）进行授权，也要对固定文件夹“质检”进行授权。

![](https://cdn.sa.net/2024/10/27/nghrE4ysNVWmjFS.png)

出现这种情况就的编程思路：

* 以txt模板的形式，根据txt内容行列对称来逐个添加相关权限
* 检索文件夹名，如果没检索到就在文件夹名末尾添加“组”字，达到效果
* 以关键字内容匹配，如“访问”，则为名单人员添加相关文件夹读取权限（没有读写需求，已剔除）
* 针对固定文件夹，另写新代码文件，测试好后，直接放入上述功能代码末尾，完成所有功能实现

```
Write-Host "授权组员访问组长文件夹权限"

# 定义文件路径
$membersFile = "C:\Users\administrator\Desktop\授权名单.txt"   # 存放组员名字的文件，每行一个
$foldersFile = "C:\Users\administrator\Desktop\权限模板.txt"   # 存放文件夹描述的文件，每行一个

# 读取文件内容
$members = Get-Content -Path $membersFile | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
$folderEntries = Get-Content -Path $foldersFile | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

# 获取组员数量和文件夹数量
$memberCount = $members.Count
$folderCount = $folderEntries.Count

# 确保组员和文件夹数量相同
if ($memberCount -ne $folderCount) {
    Write-Host "组员数量 ($memberCount) 和文件夹数量 ($folderCount) 不匹配，无法继续。"
    exit
}

# 遍历每个文件夹，为对应的组员赋予读取访问权限
for ($i = 0; $i -lt $memberCount; $i++) {
    $member = $members[$i]
    $folderEntry = $folderEntries[$i]

    # 提取文件夹名称并忽略描述部分
    $folderName = ($folderEntry -split "[,、]")[0].Trim()

    # 去除“组”字后缀以实现模糊匹配
    $normalizedFolderName = $folderName -replace "组$", ""

    # 定义共享文件夹路径，并尝试匹配
    $folderPathWithGroup = "C:\共享文件夹\" + $folderName  # 带“组”字的路径
    $folderPathWithoutGroup = "C:\共享文件夹\" + $normalizedFolderName  # 去掉“组”字的路径

    # 检查文件夹路径是否存在，以决定使用带“组”或不带“组”的文件夹路径
    if (Test-Path $folderPathWithGroup) {
        $folderPath = $folderPathWithGroup
        $shareName = $folderName
    } elseif (Test-Path $folderPathWithoutGroup) {
        $folderPath = $folderPathWithoutGroup
        $shareName = $normalizedFolderName
    } else {
        Write-Host "文件夹 $folderName 或 $normalizedFolderName 不存在，跳过此项。"
        continue
    }

    # 统一分配读取权限
    $smbAccessRight = "Read"
    $fileSystemRight = "(OI)(CI)R"  # 读取权限

    # 添加SMB共享权限
    Grant-SmbShareAccess -Name $shareName -AccountName $member -AccessRight "${smbAccessRight}" -Force
    Write-Host "已为 $member 添加 $shareName 共享的读取权限"

    # 添加文件系统访问权限
    icacls "$folderPath" /grant "${member}:${fileSystemRight}"
    Write-Host "已为 $member 添加 $folderPath 文件夹的读取权限"
}

<# 质检TO项目公共目录 #>
Write-Host "质检文件夹批量授权"

# 定义共享名称和文件夹路径
$shareName = "质检"  # 共享名称
$folderPath = "C:\共享文件夹\质检"  # 共享文件夹的实际路径
$domainUsersFile = "C:\Users\administrator\Desktop\授权名单.txt"  # 包含用户的txt文件路径（不带域名）

# 定义域名
$domain = "CSXZX"

# 读取txt文件，假设每行是一个用户名（不带域名）
$domainUsers = Get-Content -Path $domainUsersFile

foreach ($user in $domainUsers) {
    # 为每个用户加上域名前缀
    $fullUserName = "$domain\$user"

    Write-Host "正在为用户 $fullUserName 添加权限..."

    # 1. 添加共享权限（只读）
    try {
        Grant-SmbShareAccess -Name $shareName -AccountName $fullUserName -AccessRight Read -Force
        Write-Host "共享权限：用户 $fullUserName 已被授予只读访问权限。"
    } catch {
        Write-Host "共享权限：无法为用户 $fullUserName 添加访问权限，可能该用户已存在或发生其他错误。"
    }

    # 2. 添加NTFS权限（只读）
    try {
        # 使用icacls命令授予用户只读权限
        # 显式 vs 继承权限：普通权限界面显示的是显式设置的权限，而“高级”选项中还会显示从父文件夹或其他权限继承而来的权限。
        # $icaclsCommand = "icacls `"$folderPath`" /grant `"${fullUserName}:(R)`" /t" # 隐示权限
        #(OI) 是“对象继承”，表示权限将应用到文件夹内的文件。
        #(CI) 是“容器继承”，表示权限将应用到文件夹内的子文件夹。
        $icaclsCommand = "icacls `"$folderPath`" /grant `"${fullUserName}:(OI)(CI)R`" /t" # 显示权限
        # 将字符串转换为命令
        Invoke-Expression $icaclsCommand
        Write-Host "NTFS权限：用户 $fullUserName 已被授予只读访问权限。"
    } catch {
        Write-Host "NTFS权限：无法为用户 $fullUserName 添加访问权限，可能发生错误。"
    }
}
```

效果如下：

![](https://cdn.sa.net/2024/11/09/jGP5J2Du6xgNrFn.png)

![](https://cdn.sa.net/2024/11/09/CPNz96UmrZjsBe2.png)


单个文件夹批量授权（优化 ：灵活加权限）

根据相关人员姓名，添加其对应权限

```powershell
# 读取用户输入
$userInput = Read-Host "请输入用户名（支持以空格、中文逗号、英文逗号、顿号分隔多个用户批量添加）"

# 定义域名
$domain = "CSXZX"

# 读取共享名称的关键字（支持模糊匹配）
$shareNameKeyword = Read-Host "请搜索共享文件名称（支持模糊匹配）"

# 查找所有共享文件夹并进行模糊匹配
$allShares = Get-SmbShare | Where-Object { $_.Name -like "*$shareNameKeyword*" }

if ($allShares.Count -eq 0) {
    Write-Host "没有找到匹配的共享名称。请检查关键字后再试。"
    Start-Sleep -Seconds 5
    exit
}

# 输出匹配到的共享文件夹名，并给出选择提示
Write-Host "匹配到以下共享文件夹，请选择一个共享文件夹进行权限设置："
$allShares | ForEach-Object { Write-Host "$($_.Name)" }

# 获取用户选择的共享文件夹
$shareNameSelection = Read-Host "请输入要选择的共享文件夹名称"

# 验证选择的共享文件夹是否在匹配结果中
$selectedShare = $allShares | Where-Object { $_.Name -eq $shareNameSelection }

if (-not $selectedShare) {
    Write-Host "无效的选择，退出脚本。"
    Start-Sleep -Seconds 5
    exit
}

# 读取权限设置
$permissionsInput = Read-Host "请输入权限设置（只读/读取、编辑/读写）"

# 将权限映射为对应的共享权限和NTFS权限
$sharePermission = ""
$ntfsPermission = ""

switch ($permissionsInput) {
    "只读" {
        $sharePermission = "(OI)(CI)(R)"
        $ntfsPermission = "Read"
        break
    }
    "读取" {
        $sharePermission = "(OI)(CI)(R)"
        $ntfsPermission = "Read"
        break
    }
    "编辑" {
        $sharePermission = "(OI)(CI)(M)"
        $ntfsPermission = "Change"
        break
    }
    "保存" {
        $sharePermission = "(OI)(CI)(M)"
        $ntfsPermission = "Change"
        break
    }
    "读写" {
        $sharePermission = "(OI)(CI)(M)"
        $ntfsPermission = "Change"
        break
    }
    default {
        Write-Host "无效的权限输入。"
        exit
    }
}

# 分割用户输入，支持空格、中文逗号、英文逗号、顿号作为分隔符
$usernames = $userInput -split '[ ,，、]'

# 循环为每个用户设置共享和安全权限
foreach ($username in $usernames) {
    # 去除首尾空格
    $username = $username.Trim()

    # 检查用户名是否为空
    if ($username) {
        # 共享权限设置
        Grant-SmbShareAccess -Name "$($selectedShare.Name)" -AccountName "$domain\$username" -AccessRight $ntfsPermission -Force

        # NTFS权限设置
        icacls "C:\共享文件夹\$($selectedShare.Name)" /grant "$domain\${username}:$sharePermission" /t

        Write-Host "已为用户 '$username' 设置权限：共享权限 '$sharePermission'，NTFS权限 '$ntfsPermission'，共享文件夹：$($selectedShare.Name)。"
    }
}

# 暂停5秒
Start-Sleep -Seconds 5

# 退出脚本
exit
```

效果如图：

![](https://cdn.sa.net/2024/11/09/gkPfXEKSDQuewYp.png)
