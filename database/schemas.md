# Schémas de base de donnée envisagés

## Tables

### table

*Commentaire*

```
table (champ1: type, champ2: type)
```

 * `champ1` : description
 * `champ2` : description

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

## Vues

Written in human comprehensible pseudo-code

### archived-messages

```
SELECT FROM messages EVERY ROW WHERE archived == true;
```

### active-messages

```
SELECT FROM messages EVERY ROW WHERE archived == false;
```

### active-keys

```
SELECT FROM keys EVERY ROW WHERE timeto > current_date();
```
