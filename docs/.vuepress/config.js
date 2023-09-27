module.exports = {
    title: '《企业信息建设运维实战》',
    description: '系统主机及网络故障综合处理与信息安全自动化运维方案。',
    base: '/helpdesk-guide/', //项目文件夹设置目录
    head:[
      ['link', {rel:'icon', href:'favicon.ico'}]
    ],
    plugins: [
      // https://vuepress.github.io/zh/plugins 插件下载
      ['@vuepress/plugin-back-to-top'],//安装不了插件,建议非全局安装vue
      ['@vuepress/google-analytics',
      {
        'ga': 'UA-157837686-3' // UA-00000000-0
      }],
      // ['copyright', {
      //   noSelect: false,
      //   authorName:{
      //     "zh-CN": "hoochanlon",
      //     "en-US": "hoochanlon"
      //   }
      // }]
    ],
    themeConfig: {
      repo: 'https://github.com/hoochanlon/helpdesk-guide/',
      // search: false,
      // https://blog.csdn.net/weixin_44495599/article/details/132022146
      // https://baijiahao.baidu.com/s?id=1757414171117173845
      algolia: {
        appId: 'Q680O8BRDI',
        apiKey: 'f04165accbaa5767283d0416f0ac63a2',
        indexName: 'helpdesk-guide',
      },
      nav: [
        // { text: '跳转首页', link: '/' },
        { text: 'CC-BY-NC 4.0', link: 'http://creativecommons.org/licenses/by-nc/4.0/' },
      ],
      editLinks: false,
      // 自定义编辑链接的文本。默认是 "Edit this page"
      editLinkText: '帮助我们改善内容',
        sidebar: [
          // 我的计划是从边缘桌面走向内部业务IT维护

            {
                title: '桌维必修业务终端维护',   // 必要的
                collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 1,    // 可选的, 默认值是 1
                children: [
                  ['/express/star/cx','电脑硬件思维导图与软件程序采集'],
                  ['/express/star/cxpj','电脑程序软件被破解原因说明'],
                  ['/express/zd/qyzz.md','企业组装主机测试'],
                  ['/express/zd/cz.md','主机系统重装与硬件组装'],
                  ['/express/zd/printer','典型打印机使用安装及调试'],
                  ['/express/zd/tyy','吊顶式投影仪安装与调试'],
                  ['enhance/dsplus/ddvmt','办公视频会议'],
                  ['/express/star/zgbx','耗材自购与其他报销补贴'],
                  ['/enhance/ie/master','OA/ERP系统IE平台维护'],
                  ['/express/star/zic','供应链资产管理知识储备'],
                  ['/enhance/zd/mac-remote','Mac-Win跨平台建立远程桌面'],
                  ['/enhance/zd/mac-re','苹果重装与个人信息删除'],
                  ['/zjjy/rhjy','入行桌维章节结语']
                ]
              },
              {
                title: '岗位手册与季度报告',   // 必要的
                collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 1,    // 可选的, 默认值是 1
                children: [
                  ['/express/bid/gan-wei-man-gs','岗位手册编写格式'],
                  ['/express/bid/gan-wei-man','甲方公司岗位工作手册'],
                  ['/express/bid/ji-du-bao-gao','驻场IT运维服务季度报告'],
                  ['/express/bid/tou-biao-shu','甲方公司桌面运维项目服务（投标书）']
                ]
              },
              {
                title: '电话与主机网络维护',   // 必要的
                collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 1,    // 可选的, 默认值是 1
                children: [
                  ['/zjjy/dhkp','主机网络维护与信息安全章节说明'],
                  ['/enhance/net/bgsdhbs','办公室电话接入部署'],
                  ['/enhance/net/bq','搬迁遇到的上网问题'],
                  ['/enhance/net/sghdhyl','由施工后转向溯源电话运作原理'],
                  ['/enhance/net/netz','网络设备组装发展过程略'],
                  ['/express/net/jftx','办公网络接入层运营'],
                  ['/express/net/xdzhg','由园区停电账号认证报错引发的思考'],
                  ['/enhance/net/neta','彻底理清IP地址、子网掩码、网关'],
                  ['/enhance/net/dlyfw','多级SOHO路由访问原理'],
                  ['/enhance/net/dlsw','代理上网异常排查问题'],
                  ['/express/net/otr.md','其他上网问题']
                ]
              },
              {
                title: '主机信息安全',   // 必要的
                collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 1,    // 可选的, 默认值是 1
                children: [
                  ['/express/script/bat.md','Batch批量可并发业务编程'],
                  ['/express/secure/trojan','信息病毒防控录'],
                  ['/express/secure/aliyund','阿里云主机被攻击记录'],
                  ['/express/secure/blue','永恒之蓝再处理'],
                  ['/express/secure/fwmreg','防火墙邮件拦截与杀软残留项清除'],
                  ['/express/secure/cunchu','存储知识储备'],
                  ['/express/secure/bgx','业务故障类排查手法'],
                  ['/express/talk/iandc','关于ITIL及CISSP的想法'],
                  ['/express/notice/support','如何优化桌面维护工作？']
                ]
              },
              {
                title: '致谢',   // 必要的
                collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 1,    // 可选的, 默认值是 1
                children: [['thanks','感谢有你们在！']]
              }
            ]
          }
  }
