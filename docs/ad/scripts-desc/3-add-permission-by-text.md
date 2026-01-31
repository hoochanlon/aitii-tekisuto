# 根据文本内容批量添加相关权限

需求：根据文本内容批量添加相关权限，相关共享文件夹实际名称与文本提供的名称存在部分差异，但需要根据此类文本批量加入相关权限。

## 实现效果

首先是如下图的excel表格

![](https://cdn.sa.net/2024/11/13/unH2yzJcUaE9VQF.png)

然后复制这些内容到文本

![](https://cdn.sa.net/2024/11/13/WsucJVobKn139XM.png)

根据文本内容批量添加相关权限。

![](https://cdn.sa.net/2024/11/13/hOkRKmH6fB4asDJ.png)

![](https://cdn.sa.net/2024/11/13/sOm6dX4N1v9WK3x.png)

![](https://cdn.sa.net/2024/11/13/NHP8dbKogDRY9Gf.png)

## 实现方式

对文本内容进行切片，以空格、顿号、逗号、制表符的方式进行划分。然后以匹配关键字的方式如“访问”、“编辑”，进行不同的权限划分。

附源码及地址：

* https://github.com/hoochanlon/scripts/tree/main/d-pwsh-dc
  * 根据文本内容批量添加相关权限.ps1

```powershell
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


写完这个的脚本，基本上主要的批量加权限的工作内容也搞定了，剩下的也没什么编写脚本的需求，有的估计是简单的批处理。同事的想法是：在公司待一至二年，写脚本耗费时间过于麻烦，没必要交给下一任处理（和他交接的就是我...），不如把精力放在考证，以及相关专业上精进。
