# La sécurité dans ChaTalK

## Base pour la présentation au client

### Choix 1:  Signal

Le chiffrement serait assuré par libsignal, l'implémentation du protocole signal

#### Motivations

- libsignal est une librairie maintenue par Signal Messenger: <https://signal.org/>, <https://signal.org/docs/>
- Signal Messenger est le développeur de l'application Signal, connue pour sa sécurité (cette application est notamment recommandée par Snowden)
- il existe trois implémentations officielles de libsignal: en c, Java et JavaScript
- le protocole Signal permet le chiffrement de bout en bout:
  - d'appels vocaux
  - d'appels videos
  - de conversations par messagerie instantanée
- le protocole signal est utilisé par:
  - Facebook Messenger
  - Skype
  - WhatsApp

#### Le protocole

Le fonctionnement du protocole signal est le suivant:

- à l'installation, puis de temps en temps, Alice et Bob enregistrent leurs identitées et un ensemble de clés publics (appelées PreKeys ) sur le serveur
- afin d'établir une communication sécurisée avec Bob, Alice télécharge les PreKeys de Bob et les utilisent afin de préparer la session et générer la clé de chiffrement symétrique initiale (ceci utilise le protocole X3DH, pour "Extended Triple Diffie-Hellman")
- la communication des messages repose sur le protocole/algorithme Double-Ratchet (double cliquet), qui permet d'échanger des messages chiffrés en se basant sur un secret partagé, le renouvellement des clés et se base sur OTR (Off-the-Record Messaging)
- lorsque plus de deux appareils sont impliqués, on utilise l'algorithme Sesame (en plus des deux précédents)
- pour les appels vocaux/videos, le chiffrement repose sur SRTP et l'authentification sur un équivalent maison à ZRTP

#### Surface d'attaque

- serveur compromis, cela pourrait permettre de saboter les PreKeys (voir plus bas)
- pair malicieux, qui pourrait commetre des attaques de type Unknown key-share attack
- failles dans le code tier

Ces risquent seront toujours présents quoi que l'on fasse, ces problèmes relèvent de la sécurisation de l'infrastructure et de nos choix quant aux librairies utilisées.

#### Licence

- Copyright 2013-2016 Open Whisper Systems
- Licensed under the GPLv3: <http://www.gnu.org/licenses/gpl-3.0.html>

#### Problèmes

- une doc inexistante
- j'ai de gros doutes quant au chiffrement des appels vocaux/videos

#### Réflexions

- résultats de libsignal avec Skype privé:
  - aucun (appels vocaux/videos pas encore implémentés) -> tester avec Messenger ou Whatsapp?
- sauvegarde des messages? -> implique d'enregistrer les clés, mais elles sont éphémeres... (Skype enregistre les messages manifestement en local... ce qui fait sens d'un point de vue confidentialité)

### Choix 2: Bidouillages? + ZRTP

Ce choix serait motivé par la complexité d'utiliser libsignal, et afin de s'assurer le contrôle

#### Fonctionnement

##### Messages

On fait du chiffrement hybride:

- Lors de la création d'une conversation, la personne à son origine génère une clé de session grâce à un algorithme symétrique (3DES, IDEA, AEs, ...). C'est cette clé qui sera utilisée pour chiffrer les messages
- Chaque fois qu'un nouveau participant est ajouté par un membre actif à la conversation, sa clé public (enregistrée auparavant sur le serveur, RSA ou ElGamal) est envoyé au membre l'ayant ajouté
- La clé de session est chiffrée avec la clé public du nouvel arrivant, puis lui est envoyée
- Le nouvel arrivant déchiffre la clé de session grâce à sa clé privée, puis il peut participer à la conversation
- Le serveur sauvegarderait les clés de sessions chiffrées avec les clés publics des participants (il y aurait donc une entrée par participant), ceci afin de permettre les dé/reconnection et l'archivage
- Après un interval de temps donné (défini dans le protocol), la clé de session sera réinitialisée. Ceci implique que le serveur devra sauvegarder toutes ces clé (chiffrées)

##### Voix/Video

Pour la voix et la video, on utiliserait ZRTP et plus particulièrement l'implémentation GNU

- ZRTP a été "inventé" par Phil Zimmermann, aussi connu pour PGP, ZRTP est défini dans <https://tools.ietf.org/html/rfc6189>
- GNU ZRTP est publié sous Licence publique générale GNU amoindrie <https://www.gnu.org/licenses/lgpl-3.0.fr.html>
- c'est une implémentation en C++, mais il existe un wrapper en C et une implémentation en Java liées: <https://www.gnu.org/software/ccrtp/zrtp.html>, <https://github.com/wernerd/ZRTPCPP>
- GNU ZRTP est un mélange entre ZRTP (Zimmermann Real-time Transport Protocol), qui assure l'authentification et l'échange des clés, et SRTP (Secure Real-time Transport Protocol) pour le chiffrement
- ZRTP:
  - Phase 1: découverte (les pairs supportent-ils ZRTP?)
  - Phase 2: échange des clés (basé sur Diffie-Hellman, plus éventuellement d'autres secrets afin de se prémunir contre les attaques de l'homme au milieu) pour générer une clé de session
  - Phase 3: passage à SRTP
- SRTP (pas à proprement parler un protocole, plutôt une specification) défini;
  - quelle partie du paquet doit être encodée
  - quelle partie du paquet doit être authentifiée afin de se prémunir des manipulations
  - quel algorithme de chiffrement utiliser
  - comment générer les clés
- La doc de GNU ZRTP est précise et bien fournie

#### Pro-Contra

- pas de problèmes avec:
  - la documentation
  - les sauvegardes
- un plus grand contrôle sur ce qu'on fait
- une plus grande flexibilité

Mais:

- nécessité d'implémenter le chiffrement des messages nous même (on doit pouvoir s'aider de librairies déjà existantes)
- problème du langage (pas d'implémentation en Javascript)

Avi personnel: partir sur le choix 2, on en sera quitte pour programmer un wrapper, et l'implémentation du chiffrement des messages devrait être facilité par l'utilisation de librairies (Bouncy Castle est très complète, mais il y en a d'autres: <https://en.wikipedia.org/wiki/Comparison_of_cryptography_libraries>)
