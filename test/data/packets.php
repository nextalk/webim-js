<?php 
header("Content-type: application/javascript");
$callback = empty($_GET["callback"]) ? "" : $_GET["callback"];
$timeout = empty($_GET["timeout"]) ? 5 : $_GET["timeout"];
sleep( $timeout );
$data = '{"status": "ok", "messages": [{"type":"chat","to":"1","from":"2","nick":"Susan","style":"color:red;","body":"Hi.","timestamp":'.(string)(microtime(true)*1000).'},{"type":"grpchat","to":"2","from":"2","nick":"Susan","style":"","body":"Someone.","timestamp":'.(string)(microtime(true)*1000).'}], "statuses": [], "presences": [{"from": "3", "to": "1", "type": "offline"}, {"from": "2", "to": "1", "type": "show", "show": "invisible"}, {"from": "5", "to": "1", "type": "online", "show": "away"}]}';
if(empty($callback)){
	echo $data;
}else{
	echo $callback."(".$data.")";
}
?>
