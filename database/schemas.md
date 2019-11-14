# Database schemas

## Tables

### users

*Contains the informations for every user of the ChaTalK service, except the conversations to which they participate which are stored in the `keys` table.*

```
users ([user_id: SERIAL], username: VARCHAR(255), pw_hash: VARCHAR(255), email: VARCHAR(255), disp_name: VARCHAR(255), status_msg: VARCHAR(512), pic_url: VARCHAR(64))
```

 * `user_id` - **PRIMARY KEY** ( *SERIAL is an auto-incrementing non-null INTEGER* ) : The User ID is a unique number set at the user creation, which allows to identify it amongst others and link it to other tables.
 * `username` - **NOT NULL**, **UNIQUE** : The username is the login name and the unique name of the user.
 * `pw_hash` - **NOT NULL**, **UNIQUE** : The hashed sum of the password of the user.
 * `email` - **UNIQUE** : The recovery e-mail address of the user.
 * `disp_name` : The displayed name of the user.
 * `status_msg` : The customized status message of the user.
 * `pic_url` : The URL of the profile picture of the user.

### pubkeys

*Table containing the multiple public keys of a user, and the device to which they belong.*

```
pubkeys ({user_id: INTEGER}, [pubkey: VARCHAR(1024)], device_id: INTEGER, last_used: TIMESTAMPTZ, desc_string: VARCHAR(256))
```

 * `user_id` - **FOREIGN KEY** references `users(user_id)` : The user who uses this public key.
 * `pubkey` - **PRIMARY KEY** : A public key for a user on a device.
 * `device_id` - **NOT NULL** : The identifier of the device.
 * `last_used` - **NOT NULL** : The time when this key was last used.
 * `desc_string` : A user written description of the public key.

### conversations

*Table containing every chat room in the ChaTalK server and relevant informations, except participating users and corresponding keys which are both stored in the `keys` table.*

```
conversations ([conv_id: SERIAL], convname: VARCHAR(255), topic: VARCHAR(512), pic_url: VARCHAR(64), archived: BOOLEAN)
```

 * `conv_id` - **PRIMARY KEY** ( *SERIAL is an auto-incrementing non-null INTEGER* ) : The Conversation ID is a unique number set at the conversation creation, which allows to identify it amongst others and link it to other tables.
 * `convname` - **NOT NULL**, **UNIQUE** : The name of the conversation.
 * `topic` : The customized topic of the conversation.
 * `pic_url` : The URL of the conversation picture.
 * `archived` - **NOT NULL** : The status of the conversation : `false` is active, `true` is archived.

### conv_keys

*Stores the conversations to which a user participates and the corresponding shared keys used.*

```
conv_keys ([key_id: SERIAL], {user_id: INTEGER}, {conv_id: INTEGER}, timefrom: TIMESTAMP, timeto: TIMESTAMP, shared_key: VARCHAR(1024), favorite: BOOLEAN, audio: BOOLEAN)
```

 * `key_id` - **PRIMARY KEY** : Identifies a shared key uniquely.
 * `user_id` - **FOREIGN KEY** references `users(user_id)` : The User ID to identify which user the key corresponds to and which conversations the user belongs to.
 * `conv_id` - **FOREIGN KEY** references `conversations(conv_id)` : The Conversation ID to know which conversation the users and the key belongs to.
 * `timefrom` - **NOT NULL** : The time stamp when the key started being in use.
 * `timeto` : The time stamp when the key should stop being in used, then when it effectively stopped being in use.
 * `shared_key` - **NOT NULL**, **UNIQUE** : The shared conversation key for that time period, encrypted with the public key of the user identified by `user_id`.
 * `favorite` - **NOT NULL** : Informs if a `user_id` has set `conv_id` as his favorite.
 * `audio` - **NOT NULL** : Informs us if the key was generated for an audio conversation. If so it should be deleted

### messages

*Stores every message ever, with the associated conversation, user and timestamp.*

```
messages ([msg_id: SERIAL], time: TIMESTAMPTZ, {user_id: INTEGER}, {conv_id: INTEGER}, content: VARCHAR(4096), archived: BOOLEAN)
```

 * `msg_id` - **PRIMARY KEY** ( *SERIAL is an auto-incrementing non-null INTEGER* ) : Message ID is a field used to identify each message individually.
 * `time` - **NOT NULL** ( *TIMESTAMPTZ is an abbreviation for TIMESTAMP WITH TIMEZONE* ) : Time is the field identifying the exact moment the message was sent by the user.
 * `user_id` - **FOREIGN KEY** references `users(user_id)` : User ID tells us which user sent the message.
 * `conv_id` - **FOREIGN KEY** references `conversations(conv_id)` : Conversation ID tells us in which conversation the message was sent.
 * `content` - **NOT NULL** : The actual content of the message. Should accept Markdown formatting.
 * `archived` - **NOT NULL** : The status of the message : `false` is active, `true` is archived.

### seen

*Stores the last messages seen by a user. There will be several messages per user, one for each conversation.*

```
seen ([sid: SERIAL], {msg_id: INTEGER}, {user_id: INTEGER})
```

 * `sid` - **PRIMARY KEY** : Seen ID used to identify rows in the seen table.
 * `msg_id` - **FOREIGN KEY** references `messages(mid)` : The Message ID of the last message seen by the user identified by `user-id`.
 * `user_id` - **FOREIGN KEY** references `users(user_id)` : The User ID of the user that has seen the message.

## Views

### archived_messages

*A view of the table `messages` which only shows the messages that have been archived by setting the `archived` flag to true.*

```SQL
CREATE VIEW archived_messages AS SELECT * FROM messages WHERE archived == true;
```

### active_messages

*A view of the table `messages` which only shows the messages that have not been archived by setting the `archived` flag to false.*

```SQL
CREATE VIEW active_messages AS SELECT * FROM messages WHERE archived == false;
```

### active_keys

*A view of the table `keys` which only shows the keys that have not expired.*

```SQL
CREATE VIEW active_keys AS SELECT * FROM keys WHERE timeto > now;
```

### recent_messages

*A view of the table `messages` which only shows the messages sent today or yesterday in a conversation.*

```SQL
CREATE VIEW recent_messages AS SELECT * FROM messages WHERE time > yesterday;
```
