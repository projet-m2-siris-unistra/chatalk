# Database schemas

## Tables

### users

*Contains the informations for every user of the ChaTalK service, except the conversations to which they participate which are stored in the `keys` table.*

```SQL
users (user-id: SERIAL, username: VARCHAR(255), pw-hash: VARCHAR(255), pubkey: VARCHAR(1024), email: VARCHAR(255), disp-name: VARCHAR(255), status-msg: VARCHAR(512), pic-url: VARCHAR(64))
```

* `user-id` ( *SERIAL is an auto-incrementing non-null INTEGER* ) : The User ID is a unique number set at the user creation, which allows to identify it amongst others and link it to other tables.
* `username` : The username is the login name and the unique name of the user.
* `pw-hash` : The hashed sum of the password of the user.
* `pubkey` : The public RSA key set up by the user.
* `email` : The recovery e-mail address of the user.
* `disp-name` : The displayed name of the user.
* `status-msg` : The customized status message of the user.
* `pic-url` : The URL of the profile picture of the user.

### conversations

*Table containing every chat room in the ChaTalK server and relevant informations, except participating users and corresponding keys which are both stored in the `keys` table.*

```SQL
conversations (conv-id: SERIAL, convname: VARCHAR(255), topic: VARCHAR(512), pic-url: VARCHAR(64), archived: BOOLEAN)
```

* `conv-id` ( *SERIAL is an auto-incrementing non-null INTEGER* ) : The Conversation ID is a unique number set at the conversation creation, which allows to identify it amongst others and link it to other tables.
* `convname` : The name of the conversation.
* `topic` : The customized topic of the conversation.
* `pic-url` : The URL of the conversation picture.
* `archived` : The status of the conversation : `false` is active, `true` is archived.

### keys

*Stores the conversations to which a user participates and the corresponding shared keys used.*

```SQL
keys (user-id: INTEGER, conv-id: INTEGER, timefrom: TIMESTAMP, timeto: TIMESTAMP, shared-key: VARCHAR(1024))
```

* `user-id` : The User ID to identify which user the key corresponds to and which conversations the user belongs to.
* `conv-id` : The Conversation ID to know which conversation the users and the key belongs to.
* `timefrom` : The time stamp when the key started being in use.
* `timeto` : The time stamp when the key stopped or will stop being in use.
* `shared-key` : The shared conversation key for that time period, encrypted with the public key of the user identified by `user-id`.

### messages

*Stores every message ever, with the associated conversation, user and timestamp.*

```SQL
messages (mid: SERIAL, time: TIMESTAMPTZ, user-id: INTEGER, conv-id: INTEGER, content: VARCHAR(4096), archived: BOOLEAN)
```

* `mid` ( *SERIAL is an auto-incrementing non-null INTEGER* ) : Message ID is a field used to identify each message individually.
* `time` ( *TIMESTAMPTZ is an abbreviation for TIMESTAMP WITH TIMEZONE* ) : Time is the field identifying the exact moment the message was sent by the user.
* `user-id` : User ID tells us which user sent the message.
* `conv-id` : Conversation ID tells us in which conversation the message was sent.
* `content` : The actual content of the message. Should accept Markdown formatting.
* `archived` : The status of the message : `false` is active, `true` is archived.

### seen

*Stores the last messages seen by a user. There will be several messages per user, one for each conversation.*

```SQL
seen (message-id: INTEGER, user-id: INTEGER)
```

* `message-id` : The Message ID of the last message seen by the user identified by `user-id`.
* `user-id` : The User ID of the user that has seen the message.

## Views

Written in human comprehensible pseudo-code

### archived-messages

*A view of the table `messages` which only shows the messages that have been archived by setting the `archived` flag to true.*

```SQL
SELECT FROM messages EVERY ROW WHERE archived == true;
```

```SQL
CREATE VIEW archived-messages AS SELECT * FROM messages WHERE archived == true;
```

### active-messages

*A view of the table `messages` which only shows the messages that have not been archived by letting the `archived` flag to false.*

```SQL
SELECT FROM messages EVERY ROW WHERE archived == false;
```

```SQL
CREATE VIEW active-messages AS SELECT * FROM messages WHERE archived == false;
```

### active-keys

*A view of the table `keys` which only shows the keys that have not expired.*

```SQL
SELECT FROM keys EVERY ROW WHERE timeto > current_date();
```

```SQL
CREATE VIEW active-keys AS SELECT * FROM keys WHERE timeto > now;
```

### recent-messages

*A view of the table `messages` which only shows the messages sent today or yesterday in a conversation.*

```SQL
CREATE VIEW recent-messages AS SELECT * FROM messages WHERE time > yesterday;
```
