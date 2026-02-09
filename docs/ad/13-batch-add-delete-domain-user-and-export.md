# 十三、批量对人员进行文件夹授权

>1. 操作文件夹均以开启共享，以及域名方面，根据实际环境修改对应域名。
>2. edge浏览器，右击图片，在新标签页中打开图像，或放大图像。

## 缘起

由于每个消费业务的同事都需要登录域用户上机操作的，分配不同的组长，因此有着不同组长共享文件夹访问权限，以及通用的质检文件夹访问权限，这就需要根据人事已提供的 ”域控权限申请登记表“，繁复的进行对人员的域账户添加及相关文件授权。

![ ](https://cdn.sa.net/2024/10/27/nghrE4ysNVWmjFS.png)

相关要求：

* 读取权限说明：共享权限：读取；安全权限（NTFS权限）读取。
* 编辑、读写权限说明：共享权限：读取、更改；安全权限：读取、读取和执行、列出文件内容、修改、写入。

质检文件夹权限是通用的，所以可以做成规模化的脚本执行。组员不同所属组长的文件夹权限，可以用简单的命令形式执行。

## 单个文件夹批量授权

### 起手

从最简单的起手，单个用户设置文件夹权限

> 更多模板：[suv789 - 当使用 PowerShell 管理 Active Directory（AD）域用户时，以下是一些初级的示例和操作：PowerShell 在进行 AD 域用户管理时的强大功能和灵活性。PowerShell 在自动化和管理 Active Directory 域用户方面的强大能力，能够高效处理复杂的管理任务和安全操作
](https://www.cnblogs.com/suv789/p/18284489)

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

### 成型

以批量授权用户质检文件夹访问权限只读为例

![ ](https://cdn.sa.net/2024/10/27/CoyB1I27hMtcJL9.png)

```
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

![ ](https://cdn.sa.net/2024/10/27/aEDfri2lAuOSMZX.png)

![ ](https://cdn.sa.net/2024/10/27/DfJXyzmaEvhWtQk.png)

### 优化 （灵活加权限）

根据相关人员姓名，添加其对应权限。

```
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

![ ](https://cdn.sa.net/2024/11/09/gkPfXEKSDQuewYp.png)


## 多个文件夹批量授权

### 多个文件夹批量读写

对 生产作业1、生产作业2 授权读写的批量操作。

```
# 定义共享名称和文件夹路径
$shares = @(
    # 定义了一个包含两个共享的数组 $shares。在循环中，我们为每个用户和每个共享依次添加权限。
    # 这样，用户将同时获得对“生产作业1”和“生产作业2”两个文件夹的相关定义权限。
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

        # 1. 添加共享权限（读写）
        try {
            Grant-SmbShareAccess -Name $share.Name -AccountName $fullUserName -AccessRight Change -Force
            Write-Host "共享权限：用户 $fullUserName 已被授予 $($share.Name) 的读写访问权限。"
        } catch {
            Write-Host "共享权限：无法为用户 $fullUserName 添加访问权限到 $($share.Name)，可能该用户已存在或发生其他错误。"
        }

        # 2. 添加NTFS权限（读写）
        try {
            $icaclsCommand = "icacls `"$($share.Path)`" /grant `"${fullUserName}:(OI)(CI)(M)`" /t" # 显示权限
            # 将字符串转换为命令
            Invoke-Expression $icaclsCommand
            Write-Host "NTFS权限：用户 $fullUserName 已被授予 $($share.Name) 的读写权限。"
        } catch {
            Write-Host "NTFS权限：无法为用户 $fullUserName 添加访问权限到 $($share.Name)，可能发生错误。"
        }
    }
}

```

效果：

![ ](https://cdn.sa.net/2024/10/27/3hofrswHJpy1ZY5.png)

![ ](https://cdn.sa.net/2024/10/27/7YdOu843rxvSi5j.png)


### 两个不同文件夹分别进行读取和写入授权

对 生产作业1 读取、生产作业2 读写的批量操作。

```
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

![ ](https://cdn.sa.net/2024/11/09/V1d3v4e9FJXshTi.png)

![ ](https://cdn.sa.net/2024/11/09/n5NqXvjm8zMtWJy.png)


## 批量特定授权

如图，我们既要对相关文件夹（比如：共享文件夹名是“徐冬冬组”，但也有可能是“徐冬冬”）进行授权，也要对固定文件夹“质检”进行授权。

![ ](https://cdn.sa.net/2024/10/27/nghrE4ysNVWmjFS.png)

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

![ ](https://cdn.sa.net/2024/11/09/jGP5J2Du6xgNrFn.png)

![ ](https://cdn.sa.net/2024/11/09/CPNz96UmrZjsBe2.png)

![ ](https://cdn.sa.net/2024/11/09/CPNz96UmrZjsBe2.png)

## 根据文本内容批量添加相关权限

需求：根据文本内容批量添加相关权限，相关共享文件夹实际名称与文本提供的名称存在部分差异，但需要根据此类文本批量加入相关权限。

首先是如下图的excel表格

![ ](https://cdn.sa.net/2024/11/13/unH2yzJcUaE9VQF.png)

然后复制这些内容到文本

![ ](https://cdn.sa.net/2024/11/13/WsucJVobKn139XM.png)

根据文本内容批量添加相关权限。

![ ](https://cdn.sa.net/2024/11/13/hOkRKmH6fB4asDJ.png)


![ ](https://cdn.sa.net/2024/11/13/sOm6dX4N1v9WK3x.png)

![ ](https://cdn.sa.net/2024/11/13/NHP8dbKogDRY9Gf.png)

实现方式：对文本内容进行切片，以空格、顿号、逗号、制表符的方式进行划分。然后以匹配关键字的方式如“访问”、“编辑”，进行不同的权限划分。

```
# 定义主目录路径
$baseFolderPath = "C:\共享文件夹"  # 基础路径
$userFile = "C:\Users\Administrator\Desktop\权限分配列表.txt"  # 替换为实际的 TXT 文件路径

# 读取用户文件的每一行
Get-Content $userFile | ForEach-Object {
    # 按空格分隔每一行的内容
    # $parts = $_ -split '\s+'
    $parts = $_ -split '[\s,\t、]+'  # 正则表达式包含空格、制表符、逗号和顿号
    if ($parts.Length -ge 8) {
        $username = $parts[0]
        $folder2 = $parts[5]  # 组文件夹
        $folder3 = $parts[6]  # 公共目录文件夹
        $permissionType = $parts[7]

        # 设置 NTFS 权限类型
        $ntfsPermission = if ($permissionType -like "*访问*") {
            "(OI)(CI)(R)"  # 只读权限
        } elseif ($permissionType -like "*编辑*" -or $permissionType -like "*读写*" -or $permissionType -like "*保存*") {
            "(OI)(CI)(M)"  # 修改权限
        } else {
            "(OI)(CI)(R)"  # 默认读权限
        }

        # 设置共享权限类型
        $sharePermission = if ($permissionType -like "*访问*") {
            "Read"  # 共享只读权限
        } elseif ($permissionType -like "*编辑*" -or $permissionType -like "*读写*" -or $permissionType -like "*保存*") {
            "Change"  # 共享更改权限
        } else {
            "Read"  # 默认共享只读权限
        }

        # 处理 folder2（组文件夹）路径，去掉“组”字
        $folder2WithoutGroup = if ($folder2 -like "*组") {
            $folder2 -replace "组$", ""  # 去掉“组”字（结尾）
        } else {
            $folder2  # 如果没有“组”字，保持原样
        }

        # 构建完整的文件夹路径
        $fullPath1 = Join-Path -Path $baseFolderPath -ChildPath $folder2  # 原始组文件夹路径
        $fullPath2 = Join-Path -Path $baseFolderPath -ChildPath $folder3  # 公共目录文件夹路径
        $fullPath3 = Join-Path -Path $baseFolderPath -ChildPath $folder2WithoutGroup  # 去掉“组”字后的文件夹路径

        # 为每个文件夹路径分配权限
        $folders = @($fullPath1, $fullPath2, $fullPath3)

        foreach ($folderPath in $folders) {
            # 检查文件夹路径是否存在
            if (-Not (Test-Path $folderPath)) {
                Write-Output "路径 $folderPath 不存在，跳过该路径。"
                continue
            }

            # 使用 icacls 设置 NTFS 权限
            icacls "$folderPath" /grant ${username}:$ntfsPermission /t
            Write-Host "已为用户 $username 在文件夹 $folderPath 分配 NTFS $ntfsPermission 权限。" -ForegroundColor Yellow

            # 检查共享是否存在
            $netShareName = (Get-Item $folderPath).Name  # 使用文件夹名称作为共享名称

            if (Get-SmbShare -Name $netShareName -ErrorAction SilentlyContinue) {
                # 如果共享存在，添加共享权限
                Grant-SmbShareAccess -Name $netShareName -AccountName "$username" -AccessRight $sharePermission -Force
                Write-Host "已为用户 $username 在共享 $netShareName 分配共享 $sharePermission 权限。" -ForegroundColor Yellow
            } else {
                Write-Output "共享 $netShareName 不存在，跳过共享权限分配。"
            }
        }
    }
    else {
        Write-Output "行格式不匹配，跳过：$_"
    }
}

Write-Output "所有用户权限已成功添加。"

```



