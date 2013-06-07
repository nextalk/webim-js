js库接口协议
======================

如果使用webim js库，需要web服务器遵循此协议提供数据接口，HTTP请求返回数据格式使用[json][json]格式或者字符串`ok`。

返回结果需要支持jsonp，使用jsonp时会加callback参数，使用jsonp时返回的http status类错误无效。


常用数据
-----------------------

###连接信息connection


	{
	        "domain": "www.uchome.com",
	        "ticket": "8633d182-b7fe-42a3-8466-0c4134cfebf2",
	        "server": "http://ucim.webim20.cn:8000/packets"
	}


参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
domain			|string	|true	|域名，API注册域名
ticket			|string	|true	|本次通信令牌，用于浏览器与消息服务器建立JSONP长连接
server			|string	|true	|im服务器地址

###用户信息userInfo              

####示例                         

	{
		"id": 'jack',
	        "nick": "Jack",
	        "pic_url": "jack.jpg",
	        "default_pic_url": "default.jpg",
	        "url": "space.php?uid=2",
	        "status": "I'm free.", 
	        "show": "available",
	        "status_time": "10:55"
	}

参数名			|类型	|必需	|描述
------------------------|-------|-------|----
id			|string	|true	|用户唯一ID
nick			|string	|true	|用户昵称或姓名
pic\_url		|string	|false	|用户头像地址
default\_pic\_url	|string	|false	|用户头像默认地址，当头像加载失败时显示
status			|string	|false	|用户状态显示信息
show			|string	|false	|用户状态['available', 'away', 'chat', 'dnd', 'invisible']
status\_time		|string	|false	|用户状态时间

###聊天记录logItem

####示例

	{
	        "type": "unicast",
	        "to": "susan",
	        "from": "jack",
		"nick": "Jack",
	        "style": "color:#bbb;",
	        "body": "Hello.",
	        "timestamp": 1246883572400
	}

参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
type			|string	|true	|记录类型，unicast: 一对一, multicast: 多对多群组, broadcast: 全站广播
to			|string	|true	|接收消息用户ID
from			|string	|true	|发送消息用户ID
nick			|string	|true	|发送消息用户名称
style			|string	|false	|消息css样式
body			|string	|true	|消息内容
timestamp		|int	|true	|消息发送时间，时间为javascript时间，php中使用microtime(true)\*1000

###聊天记录列表history

####示例

	[&logItem]
	
###联系人信息buddyInfo

	{
		"id": 'susan',
	        "nick": "Susan",
	        "group": "friend", 
	        "pic_url": "susan.jpg",
	        "default_pic_url": "default.jpg",
	        "url": "space.php?uid=2",
	        "presence": "online",
	        "status": "I'm buzy.", 
	        "show": "buzy",
	        "status_time": "10:55",
		"history": &history
	}

参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
id			|string	|true	|联系人唯一ID
nick			|string	|true	|联系人昵称或姓名
presence		|string	|false	|联系人是在线离线["online", "offline"],默认offline
group			|string	|false	|联系人所属分组
pic\_url		|string	|false	|联系人头像地址
default\_pic\_url	|string	|false	|联系人头像默认地址，当头像加载失败时显示
status			|string	|false	|联系人状态显示信息
show			|string	|false	|联系人状态['available', 'away', 'chat', 'dnd', 'invisible']
status\_time		|string	|false	|联系人状态时间
incomplete		|bool	|false	|标志返回信息不完整，比如登录时未返回分组头像等信息，前端界面会在需要时重新读取，默认false
history			|object	|false	|联系人和当前用户聊天记录，如果没有则会新建连接从webim/history读取


###群组成员信息roomMemberInfo

####示例

	{
	        "id": 'jack',
	        "nick": "Jack"
	}

###群组成员列表members

####示例

	[&roomMemberInfo]

###群组信息roomInfo

####示例

	{
		"id": "room1",
	        "nick": "Free space",
	        "pic_url": "room1.jpg",
		"default_pic_url": "",
	        "url": "group.php?uid=2",
		"all_count": 10,
	        "count": 5,
		"blocked": false,
	        "members": &members,
	        "history": &history 
	}

参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
id			|string |true	|群组唯一ID
nick			|string	|true	|群组名称
pic\_url		|string	|false	|群组图片地址
default\_pic\_url	|string	|false	|群组图片默认地址，当图片加载失败时显示
all\_count		|int 	|true	|群组所有用户数
count			|int 	|true	|群组在线用户数
blocked			|bool	|false	|是否被当前用户屏蔽，此字段存在settings的blocked\_rooms中
members			|object	|false	|群组在线成员，如果没有会新建连接从webim/members读取
history			|object	|false	|群组聊天记录，如果没有则会新建连接从webim/history读取

###联系人列表buddies

####示例

	[&buddyInfo]

###群组列表rooms

####示例

	[&roomInfo]


接口说明
--------------------------

###上线登录 POST webim/online

####请求参数

        {
		show: "away",
		buddy_ids: "1,34,34",
		room_ids: "1,34,34",
		username: "jack",
		password: "jack111",
		question: "name",
		answer: "jack"
        }

参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
show			|string |false	|用户状态
buddy\_ids		|string |false	|显示在tabs中的联系人列表，需要online后取得联系人信息和聊天记录
room\_ids		|string	|false	|显示在tabs中的群组列表，需要online后取得联系人信息和聊天记录
username		|string |false	|登录用户名, 需要登录验证时使用
password		|string |false	|登录密码, 需要登录验证时使用
question		|string |false	|安全验证问题, 需要登录验证时使用
answer			|string |false	|安全验证答案, 需要登录验证时使用

####返回参数

成功

        {
		success: true,
                server_time: 1281443447248, 
                user: &userInfo,
                connection: &connection,
                buddies: &buddies, 
                rooms: &rooms, 
                new_messages: []
        }

失败

        {
		success: false,
		error_msg: 'Not Authorized'
	}

参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
success			|bool	|true	|上线成功或失败
server\_time		|int	|true	|服务器当前时间，解决本地时差，返回js时间戳。microtime(true)\*1000
user			|object	|true	|当前用户信息
connection		|object	|true	|当前用户连接信息
buddies			|object	|true	|根据请求参数中buddy\_ids和离线消息取得联系人信息
rooms			|object	|true	|所有群组列表
new\_messages		|object	|true	|未收到的离线消息
error\_msg		|string	|false	|错误消息 Not Found, Forbidden, Not Authorized, IM Server Not Found, IM Server Not Authorized


###离线 POST webim/offline

####请求参数

	&connection

####返回参数

        ok

###刷新页面 POST webim/refresh

####请求参数

	&connection

####返回参数

        ok

###获取好友列表 GET webim/buddies

####请求参数

        {
                ids:"susan,josh"
        }

####返回参数

        &buddies


###获取房间列表 GET webim/rooms

####请求参数

        {
                ids:"room1,room2"
        }

####返回参数

        &rooms

###加入房间 POST webim/join

####请求参数

	&connection
	{
                id: "room1"
        }

####返回参数

        &roomInfo

###离开房间 POST webim/leave

####请求参数

	&connection
        {
                id:"room1"
        }

####返回参数

	ok

###获得房间成员 GET webim/members

####请求参数

	&connection
        {
                id: "room1"
        }

####返回参数

        	&members

###获得历史记录 GET webim/history

####请求参数

        {
                id: "susan",
		type: "unicast"
        }

参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
ids			|string	|true	|需要取得的历史记录联系人或群组列表
type			|string	|true	|取得历史记录类型，unicast: 联系人, multicast: 群组


####返回参数

        	&history


###发送消息 POST webim/message

####请求参数

	&connection
        {
                type: "unicast", 
                offline: false, 
                to: "susan",
                body: "sdf",
                style: "color:red"
        }

参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
type			|string	|true	|记录类型，unicast: 一对一, multicast: 多对多群组, broadcast: 全站广播
offline			|bool	|false	|是否离线消息，默认false
to			|string	|true	|接收消息用户ID
style			|string	|false	|消息css样式
body			|string	|true	|消息内容


####返回参数

        ok

###清除历史记录 POST webim/clear_history

####请求参数

        {
                id: 'susan'
        }

####返回参数

        ok


###发送现场状态 POST webim/presence

####请求参数

	&connection
        {
                show: "away",
                status: "I'm not here right now."
        }

####返回参数

        ok


###发送聊天状态 POST webim/status

####请求参数

	&connection
        {
                to: "11",
                show: "typing"
        }

####返回参数

        ok


###设置 POST webim/setting

####请求参数

	data: "{play_sound: true,buddy_sticky: true}"

参数名			|类型	|必需	|描述
------------------------|-------|-------|------------
data			|string	|true	|所有参数的JSON字符串(用户数据库存储)
play\_sound		|bool	|false	|是否播放提示音
buddy\_sticky		|bool	|false	|保持聊天窗口始终打开
minimize\_layout	|bool	|false	|收缩工具条
msg\_auto\_pop		|bool	|false	|新消息时自动弹出聊天窗口
blocked\_rooms		|array	|false	|被屏蔽的群组

####返回参数

        ok

扩展接口
--------------------

###站内通知 GET webim/notification

####请求参数

无

####返回参数

	[{"text":"Susan wants to be friends with you.",
		"link":"http://test.com/s?id=5"}]

###陌生人

在 **POST webim/online** 中

添加参数

	{stranger_ids: "1,2,5"}

无添加返回


参考
--------------------

*	[rfc3921](http://xmpp.org/rfcs/rfc3921.html)



[json]: http://json.org/
