<?php
include_once("common.php");
if($connection["ticket"] == gp("ticket")){
	echo callback(array("message" => "禁止关键词xxx"));
}else{
	header("HTTP/1.0 404 Not Found");
	echo "No client.";
}
?>
