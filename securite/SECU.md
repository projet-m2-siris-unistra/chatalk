# IDEES

## Remarque

Les idées ci-dessous sont succeptibles d'évoluer en fonction des problèmes techniques rencontrés (test de charge)

## Messages

- Chiffement de bout en bout (pas de déchiffrement sur le serveur)
- Première possiblité: 
    * Pour chaque nouvel arrivant (dans une conversation), celui-ci envoie sa clé public aux autres participants
    * Une clé aléatoire (clé de session) est générée pour l’algorithme symétrique (3DES, IDEA, AES, ...). L'algorithme de chiffrement symétrique est ensuite utilisé pour chiffrer le message. 
    * La clé de session est chiffrée grâce à la clé publique du destinataire (RSA ou ElGamal).
    * On envoie le message chiffré avec l'algorithme symétrique et accompagné de la clé chiffrée correspondante. 
    * Le destinataire déchiffre la clé symétrique avec sa clé privée et via un déchiffrement symétrique, retrouve le message.
    * Problème: qui est responsable de générer les clés symétriques? (si serveur, problème potentiel): plutôt le premier arrivé
- Deuxième possibilité (<=> TLS):
    * On s'échange des clés (Diffie-Hellman)
    * On signe les messages avec des clés asymétriques
- Implémentation: on peut utiliser Libsodium pour toute la partie chiffrement symétrique des messages. Libsodium est déjà utilisée, entre autre, par Discord. Libsodium est disponible dans énormement de langages
- (Trouver une implem correspondant mieux à nos besoins?)

## Video/Voix

- ZRTP (Z Real-time Transport Protocol).
- Il existe une implémentation de ZRTP pour C++ (GNU ZRTP C++), C (dérivée de la précédente) et Java (ZRTP4J). Cette implem est utilisée entre autre par Jitsi

## Redondance des données

- Duplication des données (Messages, BDD des utilisateurs)

## Confidentialité des données

- HTTPS privilégié
- Les messages sur le serveur ne peuvent pas être déchiffrés par qui ne possède pas les clés (à priori, seulement les utilisateur les ont)
- BDD: 
    * gestion de permissions et des accès
    * données chiffrées (les messages)
    * (bases de données pouvant être séparé (physiquement) du serveur de messagerie) => dépend de l'architecture
    * logs externalisés afin de pouvoir contrôler les accès
- Historique chiffré

## Modules

- Modules officiels garantis sécurisés
- Modules non-officiels sans garanties ni responsabilités de notre part