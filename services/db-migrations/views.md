    93	## Views
    94	
    95	### archived_messages
    96	
    97	*A view of the table `messages` which only shows the messages that have been archived by setting the `archived` flag to true.*
    98	
    99	```SQL
   100	CREATE VIEW archived_messages AS SELECT * FROM messages WHERE archived == true;
   101	```
   102	
   103	### active_messages
   104	
   105	*A view of the table `messages` which only shows the messages that have not been archived by setting the `archived` flag to false.*
   106	
   107	```SQL
   108	CREATE VIEW active_messages AS SELECT * FROM messages WHERE archived == false;
   109	```
   110	
   111	### active_keys
   112	
   113	*A view of the table `keys` which only shows the keys that have not expired.*
   114	
   115	```SQL
   116	CREATE VIEW active_keys AS SELECT * FROM keys WHERE timeto > now;
   117	```
   118	
   119	### recent_messages
   120	
   121	*A view of the table `messages` which only shows the messages sent today or yesterday in a conversation.*
   122	
   123	```SQL
   124	CREATE VIEW recent_messages AS SELECT * FROM messages WHERE time > yesterday;
   125	```
