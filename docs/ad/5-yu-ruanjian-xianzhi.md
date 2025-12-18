# 添加计算机到域，测试软件限制

### 软件限制规则

参考：https://learn.microsoft.com/zh-cn/windows-server/identity/software-restriction-policies/work-with-software-restriction-policies-rules

#### 路径规则

路径规则只能限制在某个具体路径下的程序，如果域用户将记事本的程序文件复制到别的位置（比如桌面），那么这个限制便不起作用了。

#### 哈希规则

哈希规则是指将所要限制的程序文件生成一个唯一的哈希值，这样无论这个程序文件被放在什么路径下，只要哈希值相符，那么它便会被禁用。

但是使用这种方法需要有一个前提，即在制定限制策略时所选择的生成哈希值的文件与所要限制的文件必须是一摸一样，也就是要求这两个程序文件的版本要一致。


## 使用组策略集中管理计算机和用户

> 管理计算机（计算机配置）和管理用户（用户配置）是两回事。计算机、用户分别对应计算机配置、用户配置，并在其对应的组织单元有相应的计算机名、用户名，组策略才会生效。


### 管理计算机（以软件限制作为测试）

使用域控将计算机添加到域的组织单元。

![ ](https://s2.loli.net/2024/10/06/lbp4uD1dw9qyMFW.png)

软件策略采用哈希规则对 notepad 进行限制。

![ ](https://s2.loli.net/2024/10/06/bCjcYqz597Vfpre.png)

![ ](https://s2.loli.net/2024/10/06/GgdBKbki4O9otUw.png)


### 管理域用户（以注册表限制作为测试）

创建组织单元用户

![ ](https://s2.loli.net/2024/10/06/HX2J65w8nL7FE4G.png)

在【用户配置】->【管理模板】->【系统】中，找到“阻止访问注册表编辑工具”。

![ ](https://s2.loli.net/2024/10/06/LR5OwVqbn9rUCIt.png)

之后，在一台非域计算机上进行加域，加域重启后打开注册表。

![ ](https://s2.loli.net/2024/10/06/8dRi5aWgrtQAm39.png)

![ ](https://s2.loli.net/2024/10/06/uL7p3FA6Erei85m.png)

