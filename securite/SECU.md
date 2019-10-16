# IDEE

## Remarque

Les idées ci-dessous sont succeptibles d'évoluer en fonction des problèmes techniques rencontrés (test de charge)

## Messages

- Echange de clé avec RSA, chiffrage avec AES (= chiffrement hybride)
- Chiffement de bout en bout (pas de déchiffrement sur le serveur)

## Video/Voix

- ZRTP (Z Real-time Transport Protocol)

## Redondance des données

- Duplication des données (Messages, BDD des utilisateurs)

## Confidentialité des données

- HTTPS privilégié
- Les messages sur le serveur ne peuvent pas être déchiffrés par qui ne possède pas les clés (à priori, seulement les utilisateur les ont)
- BDD: gestion de permissions et des accès, données chiffrées, bases de données pouvant être séparé (physiquement) du serveur de messagerie, logs externalisés
- Historique chiffrés

## Modules

- Modules officiels garantis sécurisés
- Modules non-officiels sans garantis ni responsabilité de notre part