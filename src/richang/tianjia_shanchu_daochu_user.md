#  批量添加、删除域用户及导出

## 批量添加域用户

**缘起**

由于每个消费业务的同事都需要登录域用户上机操作的，分配不同的组长，因此有着不同组长共享文件夹访问权限，以及通用的质检文件夹访问权限，这就需要根据人事已提供的 ”域控权限申请登记表“，繁复的进行对人员的域账户添加及相关文件授权。

![ ](https://cdn.sa.net/2024/10/27/nghrE4ysNVWmjFS.png)

**批量添加域用户**

一、以添加新用户到组织单元【生产团队】里的子级【售后】单元为例

二、域名以 CSYLQ 为例 

三、初始密码固定，登录需要更改初始密码，域用户都在其业务的组织单元内。

```
# 导入Active Directory模块
Import-Module ActiveDirectory

# 测试一行命令
# New-ADUser -Name "王光光" -SamAccountName "王光光" -UserPrincipalName "王光光@CSYLQ.com" `
#            -Path "OU=消费业务,OU=生产团队,DC=CSYLQ,DC=com" -GivenName "光光" -Surname "王" `
#            -AccountPassword (ConvertTo-SecureString "Mima12345" -AsPlainText -Force) `
#            -Enabled $true -ChangePasswordAtLogon $true

<# 参考资料：https://learn.microsoft.com/en-us/powershell/module/activedirectory/new-aduser?view=windowsserver2022-ps #>


# 导入Active Directory模块
Import-Module ActiveDirectory

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

![ ](https://cdn.sa.net/2024/10/27/FxUu2zvlBTV9d53.png)

## 批量删除域用户


```
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

![ ](https://cdn.sa.net/2024/10/27/aupKFxJOd3mftZR.png)

## 导出域用户说明

每月需要导出域用户与人事核对离职人数，核对完成发送信安主管，抄送给IT部门总负责人。以下原因：

1. **确保账户安全：** 离职员工的账户一旦未及时禁用或删除，可能会带来潜在的安全隐患，尤其是如果这些账户还具有访问公司敏感数据或系统的权限。对比人事数据可以确保所有离职员工的账户都已按时处理。
2. **防止数据泄露：** 人事部门确认员工已经离职后，IT部门和信息安全部门需要确保他们不再拥有公司系统的访问权，以防止敏感信息的泄露或被误用。
3. **合规性要求：** 许多行业和公司都要求遵守信息安全和数据隐私的相关法规。定期对比和清理离职人员账户是满足这些法规要求的一部分，避免因管理不善而受到法律或金融处罚。
4. **内部控制和审计要求：** IT 和信安部门领导收到该报告可以确保流程的透明性和可审计性。它还为内部控制提供了基础，证明公司在信息系统的安全管理方面有一个清晰和严格的流程。

通过每月定期导出和核对数据，可以确保离职员工的账户不被遗漏。将这些信息汇报给信安主管并抄送给 IT 领导，既有助于管理层的知情，也能够提升整个流程的严谨性和效率。

## 导出域用户操作

导出域用户，执行相关脚本

```
# 导出文件路径
$outputFile = "C:\Users\Administrator.CSXZX\Desktop\域用户清单.txt"

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

![ ](https://cdn.sa.net/2024/11/09/MTlqRW1XKI5VuSQ.png)

再打开 vscode 使用正则表达式

* 匹配 所有 组织单元 及后续字符所有的行：`^.*组织单元.*$`
* 匹配 所有 生产 及后续字符所有的行：`^.*生产.*$`
* 匹配 所有 测试 及后续字符所有的行：`^.*测试.*$`
* 删除所有空白行：`^\s*\n`

去除不必要的域控测试账户，以及相关公共账户，删除后再删除空白行即可。

![ ](https://cdn.sa.net/2024/11/09/xCmnw36g2H7TUPc.png)

![ ](https://cdn.sa.net/2024/11/09/D3mdk6BoLCTaGvN.png)