# WebSocket and Protobuf

## Explanation

There are differents application protocols that facilitate communications in form of text.
Here are some examples XMPP (Extensible Messaging and Presence Protocol) previously known as Jabber or IRC (Internet Relay Chat).

We chose to use the WebSocket protocol on which we use protobuf that will be useful to describe the data structure used between the client and the server. The WebSocket API was for us a natural choice as we decided to use a web client to meet the requirement for the user interface that had to be accessible from a great majority of devices.

We have to work on a centralized server as asked in the contract specifications. On that point, the WebSocket protocol which relies on a centralized architecture is the best one out the 3, as XMPP and IRC utilize a decentralized architecture.

The file sharing (picture, for example) is not supported by IRC and the sending binary data is difficult in XMPP because of the use of an XMPP standard.

The use of protobuf make the protocol is more expandable addind new features as well as simplicifying the protocol. As a matter of fact, we set our own security mechanism up.

So the use of protobuf allows us to add features that are asked as well as not use features that are not usefull for the project.
