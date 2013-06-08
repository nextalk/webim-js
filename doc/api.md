JS API
==========================

###配置

配置接口

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


###创建im实例

	var im = new webim();


###im对象相关操作

上线

	im.online();

离线

	im.offline();

发消息

	im.sendMessage( {
                type: "unicast", 
                offline: false, 
                to: "susan",
                body: "sdf",
                style: "color:red"
        } );

发现场状态

	im.sendMessage( {
                show: "away",
                status: "I'm not here right now."
        } );

发聊天状态

	im.sendStatus( {
                to: "11",
                show: "typing"
        } );


事件


###好友信息管理

	var buddy = im.buddy;


###群组信息管理

	var room = im.room;

###历史聊天管理

	var history = im.history;

###永久配置管理

	var setting = im.setting;


###临时状态配置管理

	var status = im.status;







