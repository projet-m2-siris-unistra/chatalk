# Protocols

As the projects goes on some changes to these protocols might be required, however their principle should hardly change.

## Brainstorming and Conception

We need to set up protocols that will allow interactions between different entities.
There are three entities:

    * users
    * server
    * conversations (groups of users).

Conversations are considered as an entity because the message from a user is broadcast to a group of users. A conversation is much like a multicast group in a network.

### Message basic structure

- We thought of the easiest way to analyze a message. To parse a message, we need to know its type.
  - It will give us two informations, the type of course but also the destination entity type.
  - As said before some messages can only be send in a conversation (e.g. data : text, audio, video).
- Once, we know these two informations, we need to know precisely to which entity we have to send the message.
- Therefore, we need an ID (userId, conversationId or server : by default, 0). Then we will also need the sender ID, e.g. to know which user sent the data.

So far, each message will have the following structure:

| 1      | 2                | 3           |
| ------ | ---------------- | ----------- |
| _Type_ | _Destination Id_ | _Sender Id_ |

### Message Exchange between client and server

In this section, we will describe different messages that will be needed for the proper functioning of the application.

#### Init messages

From clients to the server:

    - SignIn : with the username and the password,
    - SignOut
    - SignUp : with the username, password and the email adress.

From the server to clients:

    - SignedIn
    - SignedOut
    - SignedUp : it can pass and the user will get his userId, but it can also fail. It it fails the user has to retry.
    - SendInfo : this message is send after a SignedIn or a SignedUp message. It will contain other user informations as well as conversations informations.

#### Security Messages

The client has to send his SSH public key, while the server will send a common encrypted key for each conversation.
(c.f. securite section)

#### Conversation Management Messages

- A user can be added to a conversation by another user.
- If a user is writing a text message, a "UserIsWriting" message will be sent to other members until the content is sent by the user.
- The conversation name, picture and topic can be changed as well. - Those messages will go through the server and be sent to the users in the conversation. - The data will also be stored in the server database. - The server might have to check if the user has the right to do it.
- A new entity channel will be created for the users streams (audio, video). - The user will have to register to a channel and chose the desired content. - The server will broadcast the content to users in that given channel.

Messages Examples :

```
Client -( Conversation Management) -> server
  add user
  UserIsWriting
  Change: - name
		  - picture
		  - topic
		  - pseudo in the conversation

Client -( Register )-> Server
  Sign to channel
  Sign to audio stream
  Sign to video stream
  Unsign from channel
  Unsign from audio stream
  Unsign from video stream

Server -( Conv. Management)-> Client
  ChangeDenied
  User Is Writing
  Someone Left
  Uptime
  Connexion Quality
  Someone changed:
	  - his name
	  - his picture
	  - the conversation name
  Someone Is Streaming
  Audio
  Video
```

#### Profile Management Messages

Clients can manage their profile. Other options will be added if needed.

Messages Examples :

```
Client -( Profile Management )-> Server
  Change avatar
  Change username
  Change password
Server -( Profile Management )-> Client
  Changed avatar
  Changed username
  Changed password
```

#### Data Messages

The data from a user is broadcast to the conversation and stored in a database.

- The content is encrypted with the conversation common key, so that the client can decrypt it, but the server cannot.

Messages Examples :

```
Client -( Data )-> Server
Server -( Data )-> Client
Server -( Data )-> Database
  Text
  Video
  Audio
  File
  … other
```

#### Request Messages

- Request messages are used by the server to check if the user is active or not.
- The user can request archives which will be sent in the same message as the data one.
- In case the user changes his IP address (e.g. activate the mobile data and turn off the wifi), he can update his IP address. - This means that the server will have to store multiple keys for the same user. - When the address is updated, the client sends an info request. - The server will then send a "SendInfo" message (see Init messages).

Messages Examples :

```
Client -( Request )-> Server
  Archives

Server -( Keep Alive )-> Client
Client -( Update )-> Server
  Update Current IP
Client -( Info Request ) -> Server
```

## Protobuf

To manage the protocols, we will use `protobuf`. It allows to get a parsed object instead of the raw data.

### Add a message type

- To add a message, one has to modify the _.proto_ file.
- Those are the step to do it : - Create the message structure with `message MessageName {attributes}`. - MessageName become the type of the message. - Add fields that will be in the message, each field is add with this line : `type name = 1;`, - the type of the attribut (e.g. int, string, ...), - the name of the attribut, - the number of this field in the message. - Then add the message type, in the Client or the Server Message, inside the _oneof_. - You will just have to increment by one the highest number in the _oneof_.

### Examples

Here is an example:

- I want to add a conversation delete message, this will not be possible for our application. - Indeed, a conversation is deleted only when all the members left it.
- I create the structure.

```
message ConvDelete {
	/* this field contain the conversation id, so no need to specify it again */
	int64 destination_id = 1;
	int64 sender_id = 2;
}
```

- Now, I add it to the client message :

```
message MessageClient {
	oneof payload {
		[...]
		RequestInfo request_info = 13;
		ConvDelete conv_delete = 14;
		// add the structure and increment the last field number
		// oneof functioning is similar to union in c
	}
}
```
