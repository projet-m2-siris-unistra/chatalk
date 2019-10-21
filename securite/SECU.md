# Preliminary Security Study

## Disclaimer

Ideas below can evolve depending on technical problems met (for example : stress test)

## Messages

- End to end encryption (no decryption on the server). We can then see 3 possibilities:
- First possibility (hybrid encryption):
    * When a conversation is created, the creator generates the session key with a symetric algorithm (3DES, IDEA, AES, ...). This key will be used to secure messages.
    * Each time a new participant is added by an active member of the conversation, his public key (previously stored by the server) is sent to that member.
    * The session key is encrypted with the receiver's public key (RSA or ElGamal), and sent to him.
    * The receiver decrypts the symetric key with his private key and via symetric decrypting, get messages.
    * The server would save the symetric key encrypted with the public keys of each participant (one entry per participant), in order to allow reconnection and archiving.
    * After a given time interval (defined by the protocol), the session key will reinitialized. The server will then have to store all the encrypted session keys.

- Second possibilty (TLS equivalent):
    * Key exchange (Diffie-Hellman)
    * We sign the message with asymetric keys

- This two possibilities imply to do the implementation of the encryption algorithm by ourselves, at least partially.
- We can use Libsodium for the symetric encryption of message. Libsodium is already used, in particular by Discord. Libsodium is also available in a lot of programming languages

- Because of the difficulty and the problems caused by an implementation written by ourselves, we might want to find existing implementation
- A possibility to do that would be OTR or Signal Protocol

- OTR (Off-the-Record Messaging):
    * Protocole combining an AES symetric keys algorithm, the keys exchange protocole Diffie-Hellman and the hash fonction SHA-1
    * OTR allows to have private conversation on multiple protocole
    * used in particular by Jitsi
    * available in C, Python, Java, Javascript, Go, OCaml, Objective-C, Perl
    * Problem: there is no documentation for the last version (verson 4) exept a README. The version 3 didn't allow multi-user group chat

- Signal Protocol:
    * used by Signal
    * end-to-end encryption for voice calls, video calls and instant messaging conversations
    * available in C, Java, Javascript
    * combines the Double Ratchet algorithm, prekeys, and a triple Elliptic-curve Diffie–Hellman (3-DH) handshake, and uses Curve25519, AES-256, and HMAC-SHA256 as primitives

## Voice/Video

- ZRTP (Z Real-time Transport Protocol).
- There is an implementation of ZRTP for C++ (GNU ZRTP C++), C (derived from the previous one) and JAVA (ZRTP4J). This implementation is used, in particular, by Jitsi.

- Signal Protocol

## Choice for securing conversations

As it is, we would recommend using hybrid encryption for securing messages and ZRTP for the VoIP communication, in order to be sure to have no problem with the protocols used for exchanging messages.
If it appears to be possible (considering the future infrastructure and protocols), we believe it would be far better to use Signal Protocol, in order to ensure the security level.

## Data Redundancy

- We duplicate datas for the message and user's DB parts.

## Data confindentiality

- Privilegiated HTTPS
- Messages on the server can not be decrypted by someone who does not have the keys, which means only the users can do it.
- DB:
    * Permissions and access management
    * Encrypted data (messages)
    * The DB will be able to be separated physically from the server. This will depend on the architecture.
    * Externalized logs to control access
- Encrypted exchange history

## Add-ons

- Official add-ons are guaranteed securised.
- Unofficial add-ons without any guaranty or responsability from our end. However, we propose to evaluate custom-made add-ons to be validated and become official add-ons.
