# SSH配置后登录失败排查

> 注： v200R019C10 版本开始默认不支持 sha2_256_96、md5等低版本的弱算法，需要安装weakea插件,然后undo算法

undo算法会将交换机恢复为默认支持全部算法。

```
load-module weakea
install-module xxx.mod
undo ssh server publickey
```

## SSH配置


```
stelnet server enable #开启ssh服务器功能
ssh server port 2299 #修改ssh服务器服务端口（默认是22）
ssh server-source all-interface # 指定端口 -i vlanif 10（新版本必须配置）

ssh user huchenglong
ssh user huchenglong authentication-type password
ssh user huchenglong service-type stelnet #类型字段必须是 stelnet，写错将出现可以连接但不能登录的情况

user-interface vty 0 4
 authentication-mode aaa # 用户认证方式采用aaa本地认证
 protocol inbound all # 允许用户接入协议全部开启（ssh telnet http ftp tftp等）


aaa
 local-user  huchenglong password irreversible-cipher p@ssw0rd
 local-user  huchenglong privilege level 15
 local-user  huchenglong service-type terminal ssh http

 local-aaa-user password policy administrator （取消首次登陆强制修改密码功能）
  undo password alert original
```
