# La sécurité dans ChaTalK

## Base pour la présentation au client

### Chiffrement

Le chiffrement sera assuré par libsignal, l'implémentation du protocole signal

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

#### Fonctionnement

Le fonctionnement du protocole signal est le suivant:

- à l'installation, puis de temps en temps, Alice et Bob enregistrent leurs identitées et un ensemble de clés publics (appelées PreKeys ) sur le serveur
- afin d'établir une communication sécurisée avec Bob, Alice télécharge les PreKeys de Bob et les utilisent afin de préparer la session et générer la clé de chiffrement symétrique initiale (ceci utilise le protocole X3DH, pour "Extended Triple Diffie-Hellman")
- la communication repose sur le protocole Double-Ratchet (double cliquet), qui permet d'échanger des messages chiffrés en se basant sur un secret partagé

#### Surface d'attaque

- serveur compromis, cela pourrait permettre de saboter les PreKeys (voir plus bas)
- pair malicieux, qui pourrait commetre des attaques de type Unknown key-share attack
- failles dans le code tier

Ces risquent seront toujours présents quoi que l'on fasse, ces problèmes relèvent de la sécurisation de l'infrastructure et de nos choix quant aux librairies utilisées.

#### Licence

- Copyright 2013-2016 Open Whisper Systems
- Licensed under the GPLv3: <http://www.gnu.org/licenses/gpl-3.0.html>

### Confidentialité
