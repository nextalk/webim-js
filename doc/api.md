JS API
==========================

常用数据
-----------------------------------------------------

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


###&status

####属性

名称			|描述
------------------------|------------
to			|接收者
show			|输入状态: typing


###&presence

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



对象实例
-----------------------------------------------------

	var im = new webim();

###im

####属性

名称			|Type	|描述
------------------------|-------|------------
user			|&user	|
status			|status	|
setting			|setting|
history			|history|
buddy			|buddy	|
room			|room	|

####事件

名称			|参数		|描述
------------------------|---------------|------------
beforeOnline		|params		|
online			|		|
offline			|		|
message			|[&message]	|
presence		|[&presence]	|
status			|[&status]	|
sendMessage		|&message	|
sendPresence		|&presence	|
sendStatus		|&status	|

####方法

名称				|返回	|描述
--------------------------------|-------|------------
setUser( &user )		|void	|
online( params )		|void	|
offline()			|void	|
sendMessage( &message )		|void	|
sendStatus( &status )		|void	|
sendPresence( &presence )	|void	|


###im.status

Ready switch to localStorage

Temporary data storage.

####方法

名称			|返回		|描述
------------------------|---------------|------------
get( key )		|		|
set( key, value )	|		|
clear()			|		|

###im.setting

Permanent data storage.

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

####事件

名称			|参数		|描述
------------------------|---------------|------------
unicast			|id, [&message]	|
multicast		|id, [&message]	|
clear			|type, id	|

####方法

名称			|返回		|描述
------------------------|---------------|------------
set( [&message] )	|void		|
get( type, id )		|[&message]	|
load( type, id )	|void		|
clear( type, id )	|void		|


###im.buddy

####事件

名称			|参数		|描述
------------------------|---------------|------------
online			|&buddy		|
offline			|&buddy		|
update			|&buddy		|

####方法

名称			|返回		|描述
------------------------|---------------|------------
set( buddies )		|void		|
get( id )		|&buddy		|
presence( buddies )	|void		|
update( ids )		|void		|
load( ids )		|void		|
complete()		|void		|
count( conditions )	|int		|
clear()			|void		|


###im.room

####事件

名称			|参数		|描述
------------------------|---------------|------------
join			|&room		|
leave			|&room		|
block			|&room		|
unblock			|&room		|

####方法

名称			|返回		|描述
------------------------|---------------|------------
get( id )		|&room		|
set( rooms )		|void		|
join( id )		|void		|
leave( id )		|void		|
block( id )		|void		|
unblock( id )		|void		|
loadMember( id )	|void		|
addMember( id, info )	|void		|
removeMember( id, mid )	|void		|
initMember( id )	|void		|


