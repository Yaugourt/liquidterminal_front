# Charte Liquid Terminal — Toujours gratuit

Liquid Terminal est un bien public open source (MIT) de l'ecosysteme Hyperliquid. Cette charte est un engagement public et durable. Elle definit ce qui reste gratuit pour toujours, ce que le premium vend, et ce que nous ne ferons jamais. Elle prime sur toute decision produit.

## Ce qui est gratuit pour toujours

Ces elements ne passeront jamais derriere un mur payant. Point.

- **Toute la data consultable sur le site web** : market (spot, perp, HIP-3, HIP-4), explorer (adresses, blocks, transactions, validateurs, vaults, liquidations), dashboard, wiki. N'importe qui peut venir lire la donnee, sans compte, sans payer.
- **Le code** : le core reste sous licence MIT, lisible et forkable.
- **L'API publique de base** : un acces gratuit avec des quotas raisonnables pour les usages communautaires et les petits projets.
- **Les alertes essentielles du bot** : un socle d'alertes reste gratuit (quotas limites), pour que le bot soit utile a tout le monde des le premier jour.

## Ce que le premium vend

Le premium ne vend jamais l'acces a la donnee. La donnee est deja gratuite sur le site. Le premium vend le service autour de la donnee :

- **Le push** : etre prevenu automatiquement plutot que d'aller regarder soi-meme.
- **Le timing** : latence prioritaire sur les alertes.
- **Le volume** : nombre d'alertes eleve ou illimite, la ou le gratuit est plafonne.
- **L'agregation** : alertes avancees qui combinent plusieurs signaux (HIP-3, funding, TWAP, vault, wallet).

Dit autrement : la donnee reste consultable gratuitement sur le site, toujours. Le premium paie le confort de ne pas avoir a la surveiller.

## Referral et affiliation

Si Liquid Terminal ajoute un code de parrainage de trading (comme le font d'autres outils de l'ecosysteme), il sera :

- **affiche honnetement** et jamais cache,
- **optionnel** : l'utilisateur n'est jamais force de passer par lui,
- **sans impact** sur l'acces gratuit a la data ni sur le fonctionnement du produit.

Un referral ne route aucun ordre a la place de l'utilisateur et n'engage aucune signature de son wallet.

## Ce que nous ne ferons jamais

- **Vendre les donnees des utilisateurs.** Jamais, a personne.
- **Mettre un mur devant la donnee consultable.** La data du site reste gratuite.
- **Fermer le core.** Si un jour une partie devient closed-source, ce sera uniquement la logique de gating premium du bot, jamais le core data ni le front.
- **Router des ordres sans consentement explicite, affiche et revocable.** Tout mecanisme de type builder code, s'il existe un jour, sera opt-in, avec le taux annonce, revocable a tout moment.

## Transparence

Liquid Terminal publiera une page /funding montrant ses revenus, ses depenses et un wallet de dons verifiable on-chain. Un bien public se finance a la lumiere, pas dans l'ombre.

---

Cette charte peut evoluer pour se durcir (proteger davantage l'utilisateur), jamais pour s'assouplir au detriment de l'acces gratuit. Toute modification est publique et historisee dans le git.
