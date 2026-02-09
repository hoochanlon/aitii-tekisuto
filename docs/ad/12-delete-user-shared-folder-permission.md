# 十二、删除用户共享文件夹权限


## 查看用户有哪些文件夹的共享权限和安全权限

当钉钉流程提出变更权限的需求时，有时会因为无法清楚了解之前成员在各个文件夹中的权限而感到困扰。这时，可以通过脚本自动查看并列出用户在共享文件夹和安全权限方面的具体信息，避免依赖联系用户或相关人员。这样不仅提高了效率，也确保了权限变更的准确性和及时性。

```
# 配置域名
$domain = "CSXZX"
$userName = Read-Host "请输入目标用户名（用户名）"  # 输入用户名
$userName = "$domain\$userName"  # 构造完整用户名

# 获取用户的共享权限
Write-Host "检查 $userName 的共享权限："
Get-SmbShare | ForEach-Object {
    $shareName = $_.Name
    $access = Get-SmbShareAccess -Name $shareName | Where-Object { $_.AccountName -eq $userName }
    if ($access) {
        $access | ForEach-Object {
            Write-Host "$userName 在共享文件夹 '$shareName' 中的权限：$($_.AccessControlType) $($_.AccessRight)"
        }
    }
}

# 获取用户的NTFS权限
Write-Host "`n检查 $userName 的 NTFS 权限："
Get-SmbShare | ForEach-Object {
    $folderPath = $_.Path
    if ($folderPath -and (Test-Path $folderPath)) {  # 检查路径是否为空且存在
        $acl = Get-Acl -Path $folderPath
        $userAccess = $acl.Access | Where-Object { $_.IdentityReference -eq $userName }
        if ($userAccess) {
            $userAccess | ForEach-Object {
                Write-Host "$userName 在 '$folderPath' 中的 NTFS 权限：$($_.AccessControlType) $($_.FileSystemRights)"
            }
        }
    }
}

Write-Host "`n检查完成。"
```

![ ](https://cdn.sa.net/2024/11/10/XrEkuwsLHt1lPnf.png)

## 删除用户相关文件夹的共享及安全权限

在变更权限时，通常需要先移除用户原有的共享文件夹权限，然后根据新的需求赋予相应的共享文件夹权限。通过这种方式，确保权限变更过程既清晰又准确，避免不必要的权限冲突或遗漏，从而提升管理效率。

```
# 配置域名
$domain = "CSXZX"

# 提示用户输入用户名和共享文件夹名称
$userName = Read-Host "请输入目标用户名（用户名）"  # 仅输入用户名
$shareName = Read-Host "请输入共享文件夹名称"  # 输入共享文件夹名称

# 构造完整的用户名
$userName = "$domain\$userName"

# 获取共享文件夹路径
$folderPath = (Get-SmbShare -Name $shareName).Path

# 移除 NTFS 权限
$acl = Get-Acl -Path $folderPath
$acl.Access | Where-Object { $_.IdentityReference -eq $userName } | ForEach-Object {
    $acl.RemoveAccessRule($_)
}
Set-Acl -Path $folderPath -AclObject $acl
Write-Host "已成功移除 $userName 的 NTFS 权限"

# 移除共享权限
Revoke-SmbShareAccess -Name $shareName -AccountName $userName -Force
Write-Host "已成功移除 $userName 的共享权限"
```

![ ](https://cdn.sa.net/2024/11/10/hRXxu4ldTt1IjmK.png)


## 移除用户所有涉及到的共享文件夹权限

通过 Get-SmbShare 获取所有共享文件夹，排除一些系统级共享文件夹，进行遍历移除该用户涉及到的所有文件夹权限。此外还能进行手动例外的文件夹列表进行排除，以防不必要多余的权限移除。


```
# 配置域名
$domain = "CSXZX"
$userName = Read-Host "请输入目标用户名（用户名）"  # 输入用户名
$excludeShares = Read-Host "请输入排除的共享文件夹（用逗号或顿号分隔，不输入则默认移除所有共享文件夹）"

# 默认排除的共享文件夹
$defaultExcludeShares = @("ADMIN$", "C$", "IPC$", "NETLOGON", "SYSVOL")

# 构造完整的用户名
$userName = "$domain\$userName"

# 获取所有共享文件夹
$shares = Get-SmbShare

# 过滤需要排除的共享文件夹
if ($excludeShares) {
    $excludeSharesList = ($excludeShares -replace "、", ",").Split(",")
    $excludeSharesList += $defaultExcludeShares  # 合并默认排除共享文件夹
    $shares = $shares | Where-Object { $excludeSharesList -notcontains $_.Name }
} else {
    # 如果没有输入排除的共享文件夹，则使用默认排除列表
    $shares = $shares | Where-Object { $defaultExcludeShares -notcontains $_.Name }
}

# 遍历所有共享文件夹，移除用户权限
foreach ($share in $shares) {
    # 检查用户是否有共享权限
    $access = Get-SmbShareAccess -Name $share.Name | Where-Object { $_.AccountName -eq $userName }
    if ($access) {
        # 移除共享权限
        Revoke-SmbShareAccess -Name $share.Name -AccountName $userName -Force
        Write-Host -ForegroundColor Green "已移除 $userName 在共享文件夹 '$($share.Name)' 的共享权限"
    } else {
        Write-Host "$userName 在共享文件夹 '$($share.Name)' 中没有共享权限，无需移除"
    }

    # 获取文件夹路径并移除 NTFS 权限
    $folderPath = $share.Path
    $acl = Get-Acl -Path $folderPath
    $userAccess = $acl.Access | Where-Object { $_.IdentityReference -eq $userName }

    if ($userAccess) {
        # 移除用户的 NTFS 权限
        $userAccess | ForEach-Object {
            $acl.RemoveAccessRule($_)
        }
        Set-Acl -Path $folderPath -AclObject $acl
        Write-Host -ForegroundColor Green "已移除 $userName 在 '$folderPath' 的 NTFS 权限"
    } else {
        Write-Host "$userName 在 '$folderPath' 中没有 NTFS 权限，无需移除"
    }
}

Write-Host "权限移除完毕"

```

![ ](https://cdn.sa.net/2024/11/10/6xFeTEdOB5UY8nM.png)

![ ](https://cdn.sa.net/2024/11/10/fIL7mT5ySHacesb.png)

![ ](https://cdn.sa.net/2024/11/10/V3KDnqrwT7CBfUi.png)


## 批量删除未知用户的文件夹权限残留

如果用户此前在相关文件夹有对应的共享、安全权限，常规直接删除用户会留下残留，如图。

![ ](https://cdn.sa.net/2024/10/28/1cvfjOIPAxiEstG.png)

![ ](https://cdn.sa.net/2024/10/28/alWTyNHIMES2fXR.png)

### 删除安全权限

#### 删除文件夹未知用户的安全权限

```
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

![ ](https://cdn.sa.net/2024/10/28/ZnSOJNlWCwm7BkK.png)


#### 删除根目录中所有文件夹中包含未知用户的安全权限


```
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

![ ](https://cdn.sa.net/2024/10/28/kDamfRUSqgYXKlP.png)


### 删除共享权限

#### 删除未知用户共享权限

```
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

![ ](https://cdn.sa.net/2024/10/28/gyVwTYX3lMKauZ9.png)



#### 删除所有共享文件夹中的未知用户权限

```
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

![ ](https://cdn.sa.net/2024/10/28/csArnl3BzIw5Gq7.png)
