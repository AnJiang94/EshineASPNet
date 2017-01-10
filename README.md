# EshineASPNet
笔者从事asp.NET开发多年，这里把一套基于asp.Net的比较完善的网站开源分享给大家，主要是帮助新人学习。本框架包含了诸多功能，在实际项目中使用了超过4年时间，相关的工具和核心代码可靠性相对比较完善。不过部分页面由实习生参与完成，会包含有不够简洁的代码，全当样例，具体在自己的项目实施过程中优化。本框架的思想是，简单和快速，实现方式的利弊在后续章节会讨论。
1：项目完整源代码：https://github.com/lyxzhl/EshineASPNet
2：项目Demo：http://eshine.chinacloudapp.cn:100      用户名及密码：eshine
3：使用教程：http://blog.csdn.net/lyx_zhl/article/details/54313495
4：技术交流QQ群：143246220

本套框架包含功能模块和特色：

前台：
    用户登录 - 用户名/邮箱/手机多匹配登陆，md5加密方式，登陆多重定向<br>
    幻灯片放映 - 基于jQuery的炫丽切换效果<br>
    中英文双语 - 采用公共资源文件的多语言实现<br>
    安全中心 - 含忘记密码，安全提问，绑定邮箱更换等<br>
    单用户登陆 - 采用Hashtable禁用多点登陆，踢出逻辑<br>
    页面超时退出 - 采用Session超时增强安全性<br>
    省市区三级联动 - 内置数据库，用于地址输入<br>
    百度地图模块 - 根据经纬度在百度地图标注多个门店（支持谷歌地图）<br>
    身份证检查 - 严格检查身份证号码每一位确保是正确的身份证号<br>
    图片验证码 - 简单字符验证码图片生成<br>
    商城模块 - 轻量化的小型电商，含展示页面，购物车，收货地址及结算<br>
    支付模块 - 含支付宝即时到账及银行列表<br>
    自适应 - 自适应屏幕宽度<br>
    
后台：
    权限管理 - 高可复用的权限-角色-员工模块，权限具体到页面粒度<br>
    用户管理 - 用户的编辑、筛选、信息展开<br>
    公司管理 - 公司信息的管理<br>
    商品管理 - 商场管理<br>
    订单管理 - 订单的管理<br>

涵盖技术：
Asp.net Webform，Sql Server，三层架构，用户控件，页面继承

使用的第三方组件：
Bootstrap, Kindeditor, Senparc.Weixin
