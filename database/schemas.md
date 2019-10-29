# Database schemas

## Tables

### users

*Contains the informations for every user of the ChaTalK service, except the conversations to which they participate which are stored in the `keys` table.*

```
users (user-id: SERIAL, username: VARCHAR(255), pw-hash: VARCHAR(255), pubkey: VARCHAR(1024), email: VARCHAR(255), disp-name: VARCHAR(255), pic-url: VARCHAR(64))
```

 * `user-id` ( *SERIAL is an auto-incrementing non-null INTEGER* ) :
 * `username` :
 * `pw-hash` :
 * `pubkey` :
 * `email` :
 * `disp-name` :
 * `pic-url` :

### conversations

*Table containing every chat room in the ChaTalK server and relevant informations, except participating users and corresponding keys which are both stored in the `keys` table.*

```
conversations (conv-id: SERIAL, convname: VARCHAR(255), pic-url: VARCHAR(64), archived: BOOLEAN)
```

 * `conv-id` ( *SERIAL is an auto-incrementing non-null INTEGER* ) :
 * `convname` :
 * `pic-url` :
 * `archived` :

### keys

*Stores the conversations to which a user participates and the corresponding shared keys used.*

```
keys (kid: SERIAL, user-id: INTEGER, conv-id: INTEGER, timefrom: TIMESTAMP, timeto: TIMESTAMP, shared-key: VARCHAR(1024))
```

 * `kid` :
 * `user-id` :
 * `conv-id` :
 * `timefrom` :
 * `timeto` :
 * `shared-key` :

### messages

*Stores every message ever, with the associated conversation, user and timestamp.*

```
messages (mid: SERIAL, time: TIMESTAMPTZ, user-id: INTEGER, conv-id: INTEGER, content: VARCHAR(4096), archived: BOOLEAN)
```

 * `mid` ( *SERIAL is an auto-incrementing non-null INTEGER* ) : Message ID is a field used to identify each message individually.
 * `time` ( *TIMESTAMPTZ is an abbreviation for TIMESTAMP WITH TIMEZONE* ) : Time is the field identifying the exact moment the message was sent by the user.
 * `user-id` : User ID tells us which user sent the message.
 * `conv-id` : Conversation ID tells us in which conversation the message was sent.
 * `content` : The actual content of the message. Should accept Markdown formatting.
 * `archived` : Informs whether or not the message has been archived.

### seen

*Stores the last message seen by a user on a conversation*

```
seen (message-id: INTEGER, user-id: INTEGER, conv-id: INTEGER)
```

 * `message-id` :
 * `user-id` :
 * `conv-id` :

## Views

Written in human comprehensible pseudo-code

### archived-messages

*A view of the table `messages` which only show the messages that have been archived by setting the `archived` flag to true.*

`SELECT FROM messages EVERY ROW WHERE archived == true;`

```
CREATE VIEW archived-messages AS SELECT * FROM messages WHERE archived == true;
```

### active-messages

*A view of the table `messages` which only show the messages that have not been archived by letting the `archived` flag to false.*

`SELECT FROM messages EVERY ROW WHERE archived == false;`

```
CREATE VIEW active-messages AS SELECT * FROM messages WHERE archived == false;
```

### active-keys

*A view of the table `keys` which only show the keys that have not expired.*

`SELECT FROM keys EVERY ROW WHERE timeto > current_date();`

```
CREATE VIEW active-keys AS SELECT * FROM keys WHERE timeto > now;
```
