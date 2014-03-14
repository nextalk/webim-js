
New Room API
============

Invite
------------

Descr:

Create a temporary room and invite members

API: 

POST /webim/room/invite

Request:

    id: room id
    nick: room nick
    members: member id list

Response:
     
    {
     "id":"d94781a658a1a939",
     "nick":"TestRoom",
     "temporary":true,
     "pic_url":"images/chat.png",
     "all_count":1
    }

    
Join
------------

Descr:

Join a temporary room

API: 

POST /webim/room/join

Request:

    id: room id

Response:

    ok???


Leave
------------

Descr:

Leave a temporary room

API: 

POST /webim/room/leave

Request:

    id: room id

Response:

    ok???

Block
------------

Descr:

Block a room, don't receive messages

API:

POST /webim/room/block

Request:
    
    id: room id

Response: 
    ok


Unblock
------------

Descr:

Unblock a room

API:

POST /webim/room/unblock

Request:
    
    id: room id

Response: 
    ok


