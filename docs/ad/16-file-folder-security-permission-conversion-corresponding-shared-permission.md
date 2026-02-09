# 文件夹安全权限转换对应的共享权限

需求：公司域控及共享服务器硬件升级，由普通的台式主机更换成专业的服务器。这就需要搭建备域控，并对共享文件进行完整的迁移。

## 使用 robocopy 工具（以管理员权限运行CMD）

> 参考：[Jack_孟 - robocopy命令简介](https://www.cnblogs.com/mq0036/p/15918926.html)，ROBOCOPY source destination [file [file]...] [options]

复制文件夹全部内容及保留所有文件信息，同时保留用户相关 NTFS 权限。如果不在一个域中，就会出现未知用户。

```
ROBOCOPY \\Cs-dc2\张三组 E:\张三组 /E /COPYALL
```

![ ](https://cdn.sa.net/2024/11/11/KMwyIlrDuABVW32.png)


## 编写脚本实现安全权限转换对应的共享权限

首先打开共享设置

![ ](https://cdn.sa.net/2024/11/11/iRQySKOZkvMfXY6.png)

共享文件夹的名称往往与文件夹的实际名称相同，一来是系统默认便是如此，二来方便管理。

![ ](https://cdn.sa.net/2024/11/11/eFQU9aq7ZlgtJk3.png)


```
# 接收用户输入的文件夹路径
$folderPath = Read-Host -Prompt "请输入文件夹路径（例如：C:\共享文件夹\质检）"

# 接收用户输入的共享名称
$shareName = Read-Host -Prompt "请输入共享名称（例如：质检）"

try {
    # 获取文件夹的 NTFS 安全权限
    $acl = Get-Acl -Path $folderPath

    # 禁用文件夹的权限继承，并将现有的继承权限转换为显式权限
    $acl.SetAccessRuleProtection($true, $false)
    Set-Acl -Path $folderPath -AclObject $acl
    Write-Output "已禁用权限继承并设置显式权限。"
} catch {
    Write-Output "获取文件夹权限或禁用继承时出错: $_"
    exit
}

# 建立有效的 NTFS 用户权限列表
$ntfsUsers = @{ }

foreach ($access in $acl.Access) {
    $user = $access.IdentityReference.Value
    $permissions = $access.FileSystemRights.ToString()

    if ($permissions.Contains("FullControl")) {
        $ntfsUsers[$user] = "Full"
    }
    elseif ($permissions.Contains("Modify")) {
        $ntfsUsers[$user] = "Change"
    }
    elseif ($permissions.Contains("ReadAndExecute") -or $permissions.Contains("Read")) {
        $ntfsUsers[$user] = "Read"
    }
    else {
        Write-Output "未匹配权限类型：$permissions，跳过用户 $user 的共享权限设置"
    }
}

# 定义例外列表，仅适用于 NTFS 权限（不加入共享权限）
$exceptionList = @(
    "CREATOR OWNER",
    "SYSTEM",
    "Users",
    "Administrators",
    "BUILTIN\Administrators",
    "NT AUTHORITY\SYSTEM",
    "NT AUTHORITY\Authenticated Users"
)

try {
    # 清除现有的共享权限，确保只为 NTFS 权限中非例外用户添加共享权限
    Get-SmbShareAccess -Name $shareName | ForEach-Object {
        Revoke-SmbShareAccess -Name $shareName -AccountName $_.AccountName -Force
    }
    Write-Output "已清除现有共享权限。"

    # 设置共享权限为 NTFS 权限中非例外用户的权限
    foreach ($user in $ntfsUsers.Keys) {
        if (-not $exceptionList.Contains($user)) {
            try {
                # 检查用户是否为SID格式（避免没有账户名的错误）
                if ($user -match "^S-\d-\d+-(\d+-){1,14}\d+$") {
                    Write-Output "跳过SID格式用户 $user 的共享权限设置。"
                } else {
                    Grant-SmbShareAccess -Name $shareName -AccountName $user -AccessRight $ntfsUsers[$user] -Force
                    Write-Output "已为用户 $user 设置共享权限：$ntfsUsers[$user]"
                }
            } catch {
                Write-Output "为用户 $user 设置共享权限时出错（账户名与安全标识无映射）: $_"
            }
        }
    }
} catch {
    Write-Output "清除共享权限时出错: $_"
}

try {
    # 移除非 NTFS 列表中的用户，并为例外用户添加自定义 NTFS 权限
    foreach ($access in $acl.Access) {
        $user = $access.IdentityReference.Value
        if (-not $ntfsUsers.ContainsKey($user) -and -not $exceptionList.Contains($user)) {
            $acl.RemoveAccessRule($access)
            Write-Output "已移除用户 $user 的NTFS权限"
        }
    }

    # 删除 Everyone 的共享和 NTFS 权限
    Revoke-SmbShareAccess -Name $shareName -AccountName "Everyone" -Force
    $acl.Access | Where-Object { $_.IdentityReference -eq "Everyone" } | ForEach-Object { $acl.RemoveAccessRule($_) }
    Write-Output "已删除 Everyone 的共享和 NTFS 权限。"

    # 添加例外列表中的系统账户权限
    $usersRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Users", "ReadAndExecute, ListDirectory, Read", "ContainerInherit, ObjectInherit", "None", "Allow")
    $adminsRule = New-Object System.Security.AccessControl.FileSystemAccessRule("BUILTIN\Administrators", "FullControl", "ContainerInherit, ObjectInherit", "None", "Allow")
    $systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule("NT AUTHORITY\SYSTEM", "FullControl", "ContainerInherit, ObjectInherit", "None", "Allow")
    $creatorOwnerRule = New-Object System.Security.AccessControl.FileSystemAccessRule("CREATOR OWNER", "FullControl", "ContainerInherit, ObjectInherit", "InheritOnly", "Allow")

    # 将新的规则添加到 ACL 中
    $acl.AddAccessRule($usersRule)
    $acl.AddAccessRule($adminsRule)
    $acl.AddAccessRule($systemRule)
    $acl.AddAccessRule($creatorOwnerRule)

    # 将更改后的 ACL 应用到文件夹
    Set-Acl -Path $folderPath -AclObject $acl
    Write-Output "共享和 NTFS 权限设置已完成，保留了系统级用户，并已删除多余的成员。"
} catch {
    Write-Output "设置或更新 NTFS 权限时出错: $_"
}

```

## 后话

### 文件迁移工具实测后对比

#### FMST

看了 [虎头 - 利用FSMT进行文件服务器迁移及整合](https://blog.51cto.com/88asd/775490) 提到的FSMT，光是找资源都费了老半天，在server2019上使用较为麻烦，需要额外安装 .net2.0，以及界面老旧，看英文也挺不方便。安装上了，但操作有报错提示，于是不再深究，直接换方案了。

#### Windows迁移工具

[老收藏家 - 浅谈NTFS权限迁移与共享权限迁移(上)](https://blog.51cto.com/wzde2012/1873754) 提到安装 ，也就是Windows迁移工具。

当时安装完，使用时一直处于以下状态，于是也放弃了。

* 正在打开连接。请在目标服务器上运行 Receive-SmigServerData。
* 正在打开连接。请在源服务器上运行 Send-SmigServerData。
* Send-SmigServerData : 开始连接的传输失败。
此 cmdlet 无法连接到目标服务器。有关详细信息，请转到 Windows Server 2016 TechCenter，参阅《文件服务迁移指南》中“疑难解答”部分的“数据迁移连接”。

#### 其他方法

[老收藏家 - 浅谈NTFS权限迁移与共享权限迁移(下)](https://blog.51cto.com/wzde2012/1874132) 提到的 Permcopy 使用效果不理想，以及相关搜索到的注册表导入的方式，也行不通。
