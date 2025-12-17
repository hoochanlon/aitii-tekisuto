# 组织单元人员迁移

需求：由于质检组成员需要搬迁到其他楼层，逐一安装软件显然效率较低。为了提高工作效率，决定将质检组内的成员统一转移到"WPS下发"组织单元应用组策略，以便集中部署WPS软件。

1. 首先，让质检主管统计一份需要安装WPS的人员名单。
2. 然后依据名单，执行脚本，进行批量迁移

![ ](https://cdn.sa.net/2024/11/13/6WMoLRu4XG5l91A.png)

![ ](https://cdn.sa.net/2024/11/13/MBRTXEtS6Ui2CAg.png)

```
# 定义目标 OU 路径
# $targetOU = "OU=wps下发,OU=常用软件下发,DC=CSXZX,DC=com"
$targetOU = "OU=质检,OU=生产团队,DC=CSXZX,DC=com"

# 读取用户名名单文件
$userListPath = "C:\Users\Administrator\Desktop\需开通WPS权限的质检人员.txt"
$userNames = Get-Content -Path $userListPath

# 遍历名单并移动用户
foreach ($userName in $userNames) {
    # 获取用户的完整 DistinguishedName
    $user = Get-ADUser -Filter {SamAccountName -eq $userName}
    
    if ($user) {
        # 移动用户到目标OU
        Move-ADObject -Identity $user.DistinguishedName -TargetPath $targetOU
        Write-Host "用户 $userName 已移动到 $targetOU"
    } else {
        Write-Host "未找到用户 $userName"
    }
}
```

