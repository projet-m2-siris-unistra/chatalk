## Voix/Video

- Lors de la création d'une conversation, le créateur génère la ou les clé(s) de session nécessaires
- Le mécanisme de gestion des clés de sessions est le même que pour les messages, de même, l'ajout d'une personne à une conversation est identique (invitation, envoi de la clé de session)
- Le chiffrement des données est assurée par SRTP (Secure Real-time Transport Protocol) sur WebRTC (c'est le cas par défaut)
- La clé de session est marquée comme pouvant être supprimée à la fin de la conversation de la BDD