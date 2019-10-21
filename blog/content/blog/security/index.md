---
title: 'Security: First Approach'
date: '2019-10-21T13:17:03.000Z'
description: 'In this blog post we describe our current plan for security measures of the project, both physical and virtual.'
---

# Preliminary Security Study

## Disclaimer

Ideas below can evolve depending on technical problems met (for example : stress test)

## Messages

- End to end encryption (no decryption on the server). We can then see 3 possibilities :
- First possibility :

    * For each newcomer in a conversation, his public key is sent to other participants
    * A random key (session key) is generated for the symetric algorithm (3DES, IDEA, AES, ...). The symetric encryption algorithm is then used to secure the message.
    * The session key is encrypted with the receiver's public key (RSA or ElGamal).
    * We send the encrypted message with the corresponding encrypted key.
    * The receiver decrypts the symetric key with his private key and via symetric decrypting, get back the message
    * Problem : who is in charge to generate the symetric keys? A priori, the first one to arrive

- Second possibilty (TLS equivalent):

    * Key exchange (Diffie-Hellman)
    * We sign the message with asymetric keys

- This two possibilities implie to do the implementation of the encryption algorithm by ourselves, at least partially. To do that, we can use Libsodium for the symetric encryption of message. Libsodium is already used, in particular by Discord. Libsodium is also available in a lot of programming languages
- Because of the difficulty and the problems caused by an implementation written by ourselves, we decided to go for another idea, which will be our third possibility : OTR.
- OTR (Off-the-Record Messaging):
    * Protocole combining an AES symetric keys algorithm, the keys exchange protocole Diffie-Hellman and the hash fonction SHA-1
    * OTR allows to have private conversation on multiple protocole
    * used in particular by Jitsi
    * available in C, Python, Java, Javascript, Go, OCaml, Objective-C, Perl

### Selected proposition for messages

OTR is the proposition actually selected because it will avoid most of the problems (in particular, the one linked to implementation) while satisfying our exigence in security.

## Voice/Video

- ZRTP (Z Real-time Transport Protocol).
- There is an implementation of ZRTP for C++ (GNU ZRTP C++), C (derived from the previous one) and JAVA (ZRTP4J). This implementation is used, in particular, by Jitsi.

## Data Redundancy

- We duplicate datas for the message and user's BDD parts.

## Data confindentiiality

- Privilegiated HTTPS
- Messages on the server can not be decrypted by someone who does not have the keys, which means only the users can do it.
- BDD:
    * Perimssions and access management
    * Encrypted data (messages)
    * Data base able to be separated (physically) from the messaging server => depending on the architecture
    * Externalized logs to control access
- Encrypted exchange historic

## Add-ons

- Official add-ons are guaranteed securised.
- Unofficial add-ons without any guaranty or responsability from our end.
