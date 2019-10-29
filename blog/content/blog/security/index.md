---
title: 'Security: First Approach'
date: '2019-10-21T13:17:03.000Z'
description: 'In this blog post we describe our current plan for the security measures of the project, both physical and virtual.'
---

# Preliminary Security Study

## Disclaimer

Ideas below can evolve depending on technical problems met (for example : stress test)

## Messages

We are implementing hybrid encryption

- When a conversation is created, the person who created it generates a session key with a symetrical algorithm (3DES, IDEA, AES,… ). This key will be used to encrypt messages
- Each time a new participant is added by an active member of the conversation, his public key (saved before on the server (RSA, ElGamal)) is sent to the member who added him.
- The session key is encrypted with the public key of the newcomer, then everything is sent to him.
- The newcomer decrypts the session key with his private key, then can participate to the conversation
- The server will wave the encrypted session keys with participants public keys (there would be an entry per participant), so we can handle the deconnections/reconnections and archives.
- After a given interval of time (protocol defined), the session key will be reset. This implies that the server will have to save all this keys (encrypted)

## Voice/Video

For voice and video, we will use ZRTP, and more specifically the GNU implementation

- ZRTP has been "invented" by Phil Zimmermann, also known for PGP. ZRTP is defined in [RFC6189](https://tools.ietf.org/html/rfc6189)
- GNU ZRTP is published under general [GNU public licence](https://www.gnu.org/licenses/lgpl-3.0.fr.html)
- It's a C++ implentation, but it exists a C wrapper and a linked Java implementation : <https://www.gnu.org/software/ccrtp/zrtp.html>, <https://github.com/wernerd/ZRTPCPP>
- GNU ZRTP is a mix between ZRTP, which does authentification, key exchange and SRTP for encryption.
- ZRTP usage:
  - Phase 1: discover (ZRTP supported by peer?)
  - Phase 2: key exchange (Diffie-Hellman based, plus some other secrets to prevent man in the middle attacks) to generate a session key
  - Phase 3: SRTP
- SRTP defines :
  - which packet part has to be encrypted
  - which packet part has to be authentificated, so you can prevent manipulations
  - which encrypting algorithm to use
  - how to generate keys
- GNU ZRTP documentation is precise and well furnished

#### Pro-Contra

- no problems with :
  - documentation
  - saves
- a good control of what we are doing
- a good flexibility

But:

- we have to implement the message encryption ourselves (pre-exisiting libraries)
- langage problem (no JS implementation)

## Data Redundancy

- We duplicate datas for the message and user's DB parts.

## Data confidentiality

- Privilegiated HTTPS
- Messages on the server can not be decrypted by someone who does not have the keys, which means only the users can do it.
- DB:
  - Permissions and access management
  - Encrypted data (messages)
  - The DB will be able to be separated physically from the server. This will depend on the architecture.
  - Externalized logs to control access
- Encrypted exchange history

## Add-ons

- Official add-ons are guaranteed securised.
- Unofficial add-ons without any guaranty or responsability from our end. However, we propose to evaluate custom-made add-ons to be validated and become official add-ons.
