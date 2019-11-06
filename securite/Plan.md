# La sécurité dans ChaTalK

## Authentification:

- On stocke les clés publiques des utilisateurs sur le serveur
- Pour s'inscrire/s'authentifier (la première fois, lors de la création de compte, afin d'être sûr que la clé public est légitime), on peut utiliser quelque chose comme TLS, l'important étant de se garantir contre une attaque de l'homme au milieu

## Messages

On fait du chiffrement hybride:

- Lors de la création d'une conversation, la personne à son origine génère une clé de session grâce à un algorithme symétrique (3DES, IDEA, AEs, ...). C'est cette clé qui sera utilisée pour chiffrer les messages
- Chaque fois qu'un nouveau participant est ajouté par un membre actif à la conversation, sa clé public (enregistrée auparavant sur le serveur, RSA ou ElGamal) est envoyé au membre l'ayant ajouté
- La clé de session est chiffrée avec la clé publique du nouvel arrivant, puis lui est envoyée
- Le nouvel arrivant déchiffre la clé de session grâce à sa clé privée, puis il peut participer à la conversation
- Le serveur sauvegarderait les clés de sessions chiffrées avec les clés publiques des participants (il y aurait donc une entrée par participant), ceci afin de permettre les dé/reconnection et l'archivage
- Après un interval de temps donné (défini dans le protocol), la clé de session sera réinitialisée. Ceci implique que le serveur devra sauvegarder toutes ces clé (chiffrées)
- La légitimité est garantie par la fait que les clés publiques sont enregistrées sur le serveur de
-  La librairie Bouncy Castle me semble très complète (licence MIT), mais il y en a d'autres (entre autre sous licence GNU): <https://en.wikipedia.org/wiki/Comparison_of_cryptography_libraries> (En JS ?!)
- Longueur des clés par défaut: AES -> 128 bits, RSA -> 1024 bits

## Voix/Video

- SRTP est un profil de sécurié qui ajoute de la confidentialité, l'authentification des messages, et une protection contre les replay à RTP (Real-Time Protocol):
  - la RFC : <https://tools.ietf.org/html/rfc3711>
  - utilise AES par défaut (128 bits)
  - toutes les features sont optionnelles dans SRTP (de base, SRTP = RTP), elles doivent donc être activée (c'est à ça que sert ZRTP...)
  - Note: WebRTC utilise SRTP par défaut
- Couplage avec SIP-TLS? (à l'air recommandé, à creuser)