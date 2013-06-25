js库使用文档
==========================

webim js库完成webim前端协议的逻辑处理，可根据此库自定义前端界面。该库提供webim上线、离线等操作，好友数据，聊天消息，群组管理等操作。

数据格式
-----------------------------------------------------

类似接口协议的数据格式，作为函数方法传输。

###&user 用户              

####属性

名称			|描述
------------------------|----
id			|唯一 
nick			|显示名称
pic\_url		|头像链接地址
default\_pic\_url	|默认头像链接地址
status			|状态
show			|['available', 'away', 'chat', 'dnd', 'invisible']
status\_time		|状态时间


###&buddy 联系人

####属性

名称			|描述
------------------------|------------
id			|唯一
nick			|显示名称
presence		|["online", "offline"]
group			|
pic\_url		|头像链接地址
default\_pic\_url	|默认头像链接地址
status			|状态
show			|['available', 'away', 'chat', 'dnd', 'invisible']
status\_time		|状态时间


###&room 群组

####属性

名称			|描述
------------------------|------------
id			|唯一
nick			|显示名称
pic\_url		|头像链接地址
default\_pic\_url	|默认头像链接地址
all\_count		|成员数
count			|在线成员数
blocked			|


###&member 群组成员

####成员

名称			|描述
------------------------|------------
id			|唯一
nick			|显示名称


###&message 消息

####属性

名称			|描述
------------------------|------------
type			|['unicast', 'multicast']
to			|接收者
from			|发送者
nick			|发送者名称
style			|消息css style
body			|消息
timestamp		|消息时间


###&status 输入状态

####属性

名称			|描述
------------------------|------------
to			|接收者
show			|输入状态: typing


###&presence 在线状态

####属性

名称			|描述
------------------------|------------
type			|['online', 'offline', 'show']
from			|发送者
nick			|发送者名称
status			|状态
show			|['available', 'away', 'chat', 'dnd', 'invisible']


配置
-----------------------------------------------------

###webim.route 接口地址

####属性

名称			|描述
------------------------|----------------------------
online			|
offline			|
deactivate		|
message			|
presence		|
status			|
setting			|
history			|
clear			|
download		|
members			|
join			|
leave			|
buddies			|
notifications		|


####示例

	webim.route( {
		online: "online.php",	
		offline: "offline.php",	
		deactivate: "refresh.php",	
		message: "message.php",	
		presence: "presence.php",	
		status: "status.php",	
		setting: "setting.php",	
		history: "history.php",	
		clear: "clear_history.php",	
		download: "download_history.php",	
		members: "members.php",	
		join: "join.php",	
		leave: "leave.php",	
		buddies: "buddies.php",	
		notifications: "notifications.php"
	} );


ClassEvent事件
-----------------------------------------------------

webim拥有自建的事件机制，大多数webim类都拥有事件方法

####方法

名称						|返回	|描述
------------------------------------------------|-------|------------
trigger( event, extraParameters )		|void	|触发事件
bind( type, listener )				|void	|绑定事件
unbind( type, listener )			|void	|取消绑定



webim对象实例
-----------------------------------------------------

创建一个im对象

	var im = new webim();

###im

####属性

名称			|Type		|描述
------------------------|---------------|------------
user			|&user		|
status			|status		|状态类对象
setting			|setting	|设置类对象
history			|history	|历史管理类对象
buddy			|buddy		|好友管理类对象
room			|room		|群组管理类对象

####事件

名称			|参数		|描述
------------------------|---------------|------------
beforeOnline		|params		|上线之前触发
online			|		|上线后触发
offline			|		|
message			|[&message]	|收到消息
presence		|[&presence]	|收到在线状态
status			|[&status]	|收到输入状态
sendMessage		|&message	|发送消息时触发
sendPresence		|&presence	|发送在线状态 
sendStatus		|&status	|发送输入状态

####方法

名称				|返回	|描述
--------------------------------|-------|------------
setUser( &user )		|void	|设置用户
online( params )		|void	|登录
offline()			|void	|离线
sendMessage( &message )		|void	|发消息
sendStatus( &status )		|void	|发输入状态
sendPresence( &presence )	|void	|发在线状态


###im.status


临时存储一些im状态，例如那个窗口打开了，以便刷新后保持状态

####方法

名称			|返回		|描述
------------------------|---------------|------------
get( key )		|		|根据key获取
set( key, value )	|		|根据key设置
clear()			|		|

###im.setting

永久存储状态，永久存储一些用户习惯数据，例如声音是否打开

####方法

名称			|返回		|描述
------------------------|---------------|------------
get( key )		|		|
set( key, value )	|		|

####事件

名称			|参数		|描述
------------------------|---------------|------------
update			|key, value	|


###im.history

历史消息管理，包括群消息和单个用户聊天消息，根据type区分
unicast表示和用户一对一类型纪录
multicast表示群消息

####事件

名称			|参数		|描述
------------------------|---------------|------------
unicast			|id, [&message]	|
multicast		|id, [&message]	|
clear			|type, id	|

####方法

名称			|返回		|描述
------------------------|---------------|------------
set( [&message] )	|void		|初始化聊天纪录
get( type, id )		|[&message]	|根据类型和id获取，类型包括unicast,multicast
load( type, id )	|void		|从服务器远程加载聊天纪录
clear( type, id )	|void		|清理历史消息


###im.buddy

联系管理类

####事件

名称			|参数		|描述
------------------------|---------------|------------
online			|&buddy		|某联系人上线
offline			|&buddy		|某联系人下线
update			|&buddy		|某联系人更新状态

####方法

名称			|返回		|描述
------------------------|---------------|------------
set( buddies )		|void		|初始化联系人列表
get( id )		|&buddy		|根据id获得联系人信息
presence( buddies )	|void		|根据联系人信息更新联系人状态
update( ids )		|void		|从服务器远程更新联系人信息
load( ids )		|void		|从服务器远程加载联系人信息
complete()		|void		|
count( conditions )	|int		|根据条件统计联系人数量
clear()			|void		|


###im.room

房间群组管理

####事件

名称			|参数		|描述
------------------------|---------------|------------
join			|&room		|加入某房间时触发
leave			|&room		|离开某房间
block			|&room		|屏蔽某房间
unblock			|&room		|取消屏蔽

####方法

名称			|返回		|描述
------------------------|---------------|------------
get( id )		|&room		|根据房间id获取房间信息
set( rooms )		|void		|初始化房间列表
join( id )		|void		|加入房间
leave( id )		|void		|离开房间
block( id )		|void		|屏蔽房间
unblock( id )		|void		|取消屏蔽
loadMember( id )	|void		|加载房间成员信息
addMember( id, info )	|void		|添加成员
removeMember( id, mid )	|void		|删除成员
initMember( id )	|void		|初始化房间成员



