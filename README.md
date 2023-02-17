# 球球大作战小游戏

在线访问：https://app383.acapp.acwing.com.cn:4432/

![](https://raw.githubusercontent.com/YangQing-Lin/AcApp-BattleOfBalls/master/game/static/image/menu/bg_1.png)

![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/202302171304561.png)

## 游戏介绍

- 操控球球发射技能击败所有敌人获得游戏胜利
- 打开游戏并注册/登录之后可以选择“单人模式”或“多人模式”
- “单人模式”会生成8个机器人自动移动和攻击
- “多人模式”会先进入匹配状态，当有三个游戏分数相近的人在匹配时就会匹配成功并进入战斗状态，胜者获得10分，败者失去5分（可以和自己匹配，刷新网页并点击“多人模式”重复三遍即可，也可以开三个网页）
- “多人模式”按Enter键会唤醒多人聊天面板，每个用户可以“畅所欲言”，死亡之后也可以继续发言


## 操作方式

WEB端：鼠标右键移动，鼠标左键攻击，Q选中火球技能后左键发射火球，F选中闪现技能后左键闪现

移动端：摇杆控制玩家移动，点击技能攻击

## 技术栈

- 语言：JavaScript、html、css、python、shell
- Docker：运行一个Ubuntu容器，在其中搭建运行环境
- Django：python后端框架
- Django Channels：websocket长连接实现联机对战功能
- thrift：将匹配服务解耦到另一台服务器上，降低主服务器负载
- nginx：部署网络服务、配置https证书
- uwsgi：替换掉效率低的runserver 
- shell：更方便启动项目、打包合并所有JavaScript代码到一个文件中（可选用terser加密）
- Redis数据库：存储用户账号和头像数据
- OAuth2技术：实现一键登录功能
- Ajax：请求网站接口并处理返回的数据
- Git：项目版本控制


## 开发日志

### 2022-05-22

- 将追踪导弹和护盾适配到多人模式
- 解决多人模式图标显示和技能冷却bug

### 2022-05-15

- 添加护盾技能和血条
- 重构技能图标对象，以后加技能更轻松
- 添加追踪子弹技能
- 给技能加上按键提示

### 2022-05-12

- 优化了全屏的逻辑，对ACAPP端做了点特殊判断
- 当AcWing端关闭小窗时删除小窗内所有对象

### 2022-05-11

- 实现全屏功能
- 适配移动端页面、摇杆、玩家移动、技能图标位置、技能选择
- 完成移动端对多人联机的适配

### 2022-05-10

- 实现单机版聊天框功能
- 实现联机版聊天框功能
- 修改逻辑，玩家死亡之后也可以发言（泉水指挥官）
- 实现部分联机对战：用thrift向匹配服务器发送匹配请求、匹配服务器根据分数来匹配玩家、生产者消费者模型
- 实现完成的联机对战和匹配系统
- 实现对战胜利和失败逻辑、清理多余的监听函数、对局结束后清理剩余网页对象
- 新加了普通子弹作为普攻，将绘制技能图标的代码分理出成为一个新的类

### 2022-05-09

- 实现多人联机功能
- 实现火球技能冷却、图标和蒙版
- 实现单机版闪现技能
- 实现联机版闪现技能

### 2022-05-08

- 自动resize窗口大小，统一长度单位
- 实现部分联机功能

### 2022-05-07

- 编写账号系统
- 编写登录和注册系统
- 为用户数据库表添加openid字段
- 编写WEB端acwing一键登录
- 编写ACAPP端acwing一键登录

### 2022-05-06

- 对接AcApp
- 添加Player数组表
- 检测用户是否登录：getinfo函数
- 绘制头像

### 2022-05-05

- 编写player类，绘制小球
- 编写火球类
- 编写中弹的粒子效果
- 编写简单的自动攻击AI

### 2022-05-03

- 创建.gitignore
- start game app
- 创建简单的路由
- 创建文件格式
- 编写菜单界面和游戏界面
- 编写简单的游戏引擎

### 2022-05-01

- 配置服务器环境
- 创建django项目