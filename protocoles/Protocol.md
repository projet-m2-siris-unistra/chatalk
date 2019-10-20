# Protocols

The work is style in progress so some changes can be made, however the principle will hardly not change.

## Brainstorming and Conception

We need to set up prtocols that will allow the interactions between differents entities.
There is three entities :
    * users,
    * the server,
    * and conversations (groups of users).

Conversations are considered as an entity because the message from a user is broadcast to a group of users.
A conversation is much like a multicast group in a network.

### Message basic structure

We thought of the easier way to analyse a message. To parse a message, we need to know its type.
It will give us two informations, the type of course but also the destination entity type.
As said before some message can only be send in a conversation (e.g. data : text, audio, video).
Once, we know this two informations, we need to know precisely to which entity we have to send the messages.
So, we need an id (userId, conversationId or server : by default, 0). Then we will also need the sender id,
e.g. for example, to know which user sent the data.

So far, each message will have the following structure : 
1      | 2                | 3          |
------ | ---------------- | -----------|
*Type* | *Destination Id* | *Sender Id*|

## Protobuf

### Examples

### Add a message