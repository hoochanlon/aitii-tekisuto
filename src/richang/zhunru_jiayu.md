# 上网许可与加域

> 图片字体太小，右击在【新标签页中打开图片】

## 上网许可

### 上网准入

上网准入使用华三inode软件，在inode的控制台添加账户，根据相应格式批量加入。

![ ](https://cdn.sa.net/2024/10/10/tJb6PlMafFCsGnY.png)

在接入用户管理界面，注销账户

![ ](https://cdn.sa.net/2024/10/10/DwCWMzcK9TF6PAI.png)

![ ](https://cdn.sa.net/2024/10/10/fLFgmxEBzPQV9j6.png)

可以在桌面创建记事本，然后将需要加入inode的成员复制进记事本，然后编写程序生成批量导入的格式。

```
# 设置输入和输出文件路径
$inputFile = "C:\Users\Administrator\Desktop\添加用户.txt"
$outputFile = "C:\Users\Administrator\Desktop\inode_exportAccount.txt"

# 如果输出文件已经存在，先清空内容
if (Test-Path $outputFile) {
    Clear-Content $outputFile
}

# 读取输入文件的每一行并处理
Get-Content $inputFile -Encoding UTF8 | ForEach-Object {
    $name = $_.Trim()  # 去除前后的空格或换行符
    if ($name -ne "") {  # 确保行不为空
        $formattedName = "$name $name 消费业务 Mima12345 $name 生产专用(最终版)"
        # 将格式化后的字符串写入输出文件
        Add-Content -Path $outputFile -Value $formattedName
    }
}

Write-Host "名字处理完成，结果已写入到 $outputFile"
```

### 准入移除

批量操作 -> 进入批量账户维护 -> 选择相关文件，选择 注销账号 下一步。

![ ](https://cdn.sa.net/2024/11/09/xN3uAo9rHP1jFyX.png)

![ ](https://cdn.sa.net/2024/11/09/VvbzY1mpSyukJjX.png)

不被允许注销的用户可以单个处理，点击相关姓名进行强制注销。

## 域成员管理

域账号开通：在“用户和组”的控制台，并在对应的部门添加域账户。

![ ](https://cdn.sa.net/2024/10/10/WHrXoF3kx4edGQs.png)

域账户解锁：解锁输入密码错误次数过多的用户。找到对应组织单元，点击查找，选中对应查找到的账户，点击属性，找到【账户】，勾选解锁账户，确认后可解锁。

![ ](https://cdn.sa.net/2024/10/10/4ADjt3F81lVHKNo.png)

开通文件夹权限：访问权限，在【共享】和【安全】仅勾选只读；读写权限，则在默认权限基础上勾选修改、写入。

**访问只读**

> 注意共享文件夹内的文件夹，为了安全隔离，需要删除 Everyone 的读取权限。

在【共享】属性界面中，点击【高级共享】，【权限】，输入名字，点击检查名称，然后勾选对应权限，确定。

![ ](https://cdn.sa.net/2024/10/10/4KGdnhw13WuvC2I.png)

![ ](https://cdn.sa.net/2024/10/10/ypPw6CfidTWnk9x.png)

![ ](https://cdn.sa.net/2024/10/10/g9cG6EVUas7nTdq.png)

在【安全】属性界面中，点击【编辑】，输入名字，点击检查名称，然后勾选对应权限，确定。

![ ](https://cdn.sa.net/2024/10/10/froEyikIV2wTGzX.png)

![ ](https://cdn.sa.net/2024/10/10/627wzAoZbKNBeIa.png)

**读写权限**

共享基础权限，勾选【更改】

![ ](https://cdn.sa.net/2024/10/10/XWYhEfmiOPAIty8.png)

安全选择以下五项：修改、读取和执行、列出文件夹内容、读取、写入。

![ ](https://cdn.sa.net/2024/10/10/gX4AKQ1pk6neB3s.png)

## 遇到的问题

1. win10提示不允许使用你正在尝试的登录方式。请联系你的网络管理员了解详细信息。其实是普通用户是不能登录主备DC的。

2. 服务器上的安全数据库没有此工作站信任关系的计算机帐户。原因：换新升级 DC，容易导致计算机脱域，需要重新退域，再加域。