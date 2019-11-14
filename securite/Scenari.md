# Scenari

## Inscription

### Scénario 1: Inscription par un admin

- Chaque journaliste est inscrit par un admin qui créé un compte (login, mot de passe)
- Le journaliste ajoute ensuite lui-même ses informations (dont sa clé publique)
- La légitimité du compte est garantie par l'admin
- La légitimité de la clé est garantie par le fait que seul le journaliste (et l'admin) a le mot de passe et que la connection est sécurisée (HTTPS, attention TLS 1.0 est vulnérable, utiliser TLS 1.2, idéalement TLS 1.3)

### Scénario 2: Auto-inscription

- Chaque journaliste est responsable de créer son compte
- Chaque inscription nécessite une adresse électronique en @jsp.org
- A la fin de l'inscription, un courriel de vérification est envoyé au nouvel inscrit
- La légitimité est garantie par le fait que l'adresse électronique authentifie un journaliste et que la connection est sécurisée (HTTPS)

## Envoi de message

- L'émetteur chiffre le message avec la clé de session et l'envoi au serveur
- Le message chiffré est stocké dans la BDD (table `messages`)
- Le serveur envoie le messages aux participants actifs
- Les destinataires le déchiffre avec la clé de session

## Les clés de session/inscription à une conversation

- Lors de la création d'une conversation, la personne à son origine génère une clé de session grâce à un algorithme symétrique (3DES, IDEA, AEs, ...). C'est cette clé qui sera utilisée pour chiffrer les messages
- Chaque fois qu'un nouveau participant est ajouté par un membre actif à la conversation, sa clé public (enregistrée auparavant sur le serveur (champ `pubkey` de la table `users`), RSA ou ElGamal) est envoyé au membre l'ayant ajouté
- La clé de session est chiffrée avec la clé publique du nouvel arrivant, puis cette clé chiffrée lui est envoyée et est enregistrée sur le serveur (champ `shared-key` de la table `keys`)
- Le nouvel arrivant déchiffre la clé de session grâce à sa clé privée, puis il peut participer à la conversation
- Le serveur sauvegarde les clés de sessions chiffrées avec les clés publiques des participants (il y aurait donc une entrée par participant), ceci afin de permettre les dé/reconnection et l'archivage
- Après un interval de temps donné (défini dans le protocol), la clé de session sera réinitialisée. Ceci implique que le serveur devra sauvegarder toutes ces clé (chiffrées)
- La légitimité est garantie par la fait que les clés publiques sont enregistrées sur le serveur (comparaison de la clé publique reçue avec celle enregistrée sur le serveur)

## Génération de clés

- Lors de la création d'une conversation, la personne à son origine génère une clé de session grâce à un algorithme symétrique (3DES, IDEA, AEs, ...). C'est cette clé qui sera utilisée pour chiffrer les messages. Elle est stockée dans la BDD (champ `shared-key` de la table `keys`), chiffrée avec la clé publique du participant.
- Lors de la création d'un compte, le bénéficiaire doit générer son couple de clés publique/privée grâce à l'UI (ces clés sont sa responsabilité). Sa clé publique est stockée dans la BDD (champ `pubkey` de la table `users`)

## Éjection d'utilisateur

- Lorsqu'un utilisateur quitte une conversation (pour une raison x ou y), l'entrée lui correspondant est retirée de la table `keys`. Il ne fait plus partie de la conversation
- La clé de session est regénérée
- Si il veut revenir, il doit être de nouveau invité
- Ejection != Déconnection

## Régénération de clés

- Après un interval de temps donné (défini dans le protocol), la clé de session sera réinitialisée. Ceci implique que le serveur devra sauvegarder toutes ces clé (chiffrées) (duplication des entrées de la table `keys`, le champ `shared-key` sera différent)
- Le serveur choisit un participant actif au hasard pour regénérer la clé de session

## Voix/Video

*Coming soon...*
