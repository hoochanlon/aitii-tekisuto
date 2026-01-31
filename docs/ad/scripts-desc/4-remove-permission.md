# 查看用户在哪些共享文件夹涉及相关权限，以及移除相关权限

当钉钉流程提出变更权限的需求时，有时会因为无法清楚了解之前成员在各个文件夹中的权限而感到困扰。这时，可以通过脚本自动查看并列出用户在共享文件夹和安全权限方面的具体信息。

## 查看用户有哪些文件夹的共享权限和安全权限

```powershell
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

![](https://cdn.sa.net/2024/11/10/XrEkuwsLHt1lPnf.png)


## 删除用户相关共享文件夹的共享及安全权限

根据用户输入的共享名，再通过共享名进行文件定位，再通过 `-RemoveAccessRule` 参数删除用户 NTFS 权限。共享权限移除，直接进行 `Revoke-SmbShareAccess` 移除就好了。

```powershell
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

![](https://cdn.sa.net/2024/11/10/hRXxu4ldTt1IjmK.png)

## 移除用户所有涉及到的共享文件夹权限

通过 Get-SmbShare 获取所有共享文件夹，排除一些系统级共享文件夹，进行遍历移除该用户涉及到的所有文件夹权限。此外还能进行手动例外的文件夹列表进行排除，以防不必要多余的权限移除。

```powershell
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

![](https://cdn.sa.net/2024/11/10/6xFeTEdOB5UY8nM.png)

![](https://cdn.sa.net/2024/11/10/fIL7mT5ySHacesb.png)

![](https://cdn.sa.net/2024/11/10/V3KDnqrwT7CBfUi.png)

源码地址：https://github.com/hoochanlon/scripts/tree/main/d-pwsh-dc 及以下对应名称：

* 查看用户在哪些共享文件夹有相关权限.ps1
* 移除权限模板.ps1
* 移除用户所有涉及到的共享文件夹权限.ps1
