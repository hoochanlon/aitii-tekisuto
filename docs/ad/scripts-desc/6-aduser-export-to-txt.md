# 域用户导出到txt文件汇总

需求：公司每月需要对生产人员总数进行核对，域账户导出相关生产人员与人事进行核对，确认无误上报给领导。

实现：导出指定的几个相关组织单元进行汇总统计，排除系统自带用户。

源码地址：https://github.com/hoochanlon/scripts/blob/main/d-pwsh-dc/%E5%9F%9F%E7%94%A8%E6%88%B7%E5%AF%BC%E5%87%BA.ps1

```powershell
# 导出文件路径
$outputFile = "C:\Users\Administrator\Desktop\域用户清单.txt"

# 清空或创建导出文件
Out-File -FilePath $outputFile # -Encoding UTF8 -Force

# 导入 Active Directory 模块
Import-Module ActiveDirectory

# 设置组织单元的 DistinguishedName
$ous = @(
    "OU=生产团队,DC=CSXZX,DC=com",
    "OU=培训,DC=CSXZX,DC=com",
    "OU=临时保存权限,DC=CSXZX,DC=com"
)

foreach ($ou in $ous) {
    # 获取组织单元中的所有用户
    $users = Get-ADUser -Filter * -SearchBase $ou -Properties Name

    # 将用户名字写入文件
    if ($users) {
        $ouName = (Get-ADOrganizationalUnit -Identity $ou).Name  # 获取 OU 名称
        Add-Content -Path $outputFile -Value "组织单元：$ouName"
        foreach ($user in $users) {
            Add-Content -Path $outputFile -Value $user.Name  # 只保留用户名称
        }
        Add-Content -Path $outputFile -Value "`r`n"  # 添加换行分隔符
    } else {
        Write-Host "未找到任何用户在组织单元 $ouName 中。"
    }
}

Write-Host "已导出所有指定组织单元中的用户名字到 $outputFile"

# 暂停 5 秒
Start-Sleep -Seconds 5
```

![](https://cdn.sa.net/2024/11/09/MTlqRW1XKI5VuSQ.png)


再打开 vscode 使用正则表达式

* 匹配 所有 组织单元 及后续字符所有的行：`^.*组织单元.*$`
* 匹配 所有 生产 及后续字符所有的行：`^.*生产.*$`
* 匹配 所有 测试 及后续字符所有的行：`^.*测试.*$`
* 删除所有空白行：`^\s*\n`

去除不必要的域控测试账户，以及相关公共账户，删除后再删除空白行即可。

![](https://cdn.sa.net/2024/11/09/xCmnw36g2H7TUPc.png)

![](https://cdn.sa.net/2024/11/09/D3mdk6BoLCTaGvN.png)
