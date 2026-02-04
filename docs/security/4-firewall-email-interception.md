## 防火墙邮件拦截

检查邮件服务器地址无误，邮件运营商服务器地址如图

![image-20201211095826527.png](https://i.loli.net/2020/12/11/YMTcCpUqZehwykd.png)

在取消勾选SSL切换邮件协议依旧无效后决定重装。重装还是出现异常，再卸载时发现有一段关于指定程序防火墙的命令提示。

![image-20201211094643105.png](https://i.loli.net/2020/12/11/hoZEABmzDfre7Tx.png)

防火墙选择允许通过，输入`firewall.cpl`

![image-20201211095259708.png](https://i.loli.net/2020/12/11/wKJmGRYvgtkMEun.png)

通过之后即可正常接收邮件了。

![image-20201211095456267.png](https://i.loli.net/2020/12/11/zrCRWf6vqs8Sdtx.png)

## 防邮箱冒用

有些别有用心的人将自己名称更换成别人的邮箱账号冒用他人，其实仔细注意还是能够分别的。我们查看邮箱源码还能够发现额外的端倪，如主机IP地址，确认是否由对方常驻地发出。

![Snipaste_2021-01-30_19-18-26.png](https://i.loli.net/2021/01/30/VM3jPrCbcuBS1qv.png)


## IT人员发送邮件注意事项

注意批处理文件、加壳小工具软件易被厂商邮箱系统识别为木马病毒，导致发送的邮件被识别为垃圾邮件。
