# Documentation simple des rôles

## 1. Administrateur

### Description

L’Administrateur est le rôle principal de l’application.
Il a accès à toutes les fonctionnalités.

### Ce qu’il peut faire

- Voir tous les tableaux et modules
- Créer et modifier les chantiers
- Ajouter toutes les écritures : outillage, consommables, matières, main-d’œuvre, dépenses diverses, coût transport et fiche journalière
- Valider les écritures
- Corriger les écritures
- Annuler les écritures
- Gérer les pièces jointes
- Voir le journal des écritures
- Exporter les rapports
- Gérer les utilisateurs
- Créer et modifier les rôles
- Modifier les permissions
- Réinitialiser la base

### Utilisation recommandée

Ce rôle doit être réservé à la personne qui administre l’application et configure les accès.

---

## 2. PCA

### Description

Le rôle PCA est destiné à une personne ayant un niveau de supervision élevé.

### Ce qu’il peut faire

- Voir tous les tableaux et modules
- Créer et modifier les chantiers
- Valider les écritures
- Corriger les écritures
- Annuler les écritures
- Gérer les pièces jointes
- Voir le journal des écritures
- Exporter les rapports
- Réinitialiser la base

### Ce qu’il ne peut pas faire

- Gérer les utilisateurs
- Créer ou modifier les rôles
- Modifier les permissions
- Ajouter directement certaines écritures opérationnelles, sauf si ses permissions sont modifiées par un administrateur

### Utilisation recommandée

Ce rôle convient à un responsable de très haut niveau qui doit contrôler, valider, corriger et consulter les données du chantier.

---

## 3. DG

### Description

Le rôle DG est destiné à la Direction Générale.
Il permet de suivre les chantiers et d’intervenir sur les validations ou corrections.

### Ce qu’il peut faire

- Voir tous les tableaux et modules
- Créer et modifier les chantiers
- Valider les écritures
- Corriger les écritures
- Annuler les écritures
- Gérer les pièces jointes
- Voir le journal des écritures
- Exporter les rapports

### Ce qu’il ne peut pas faire

- Gérer les utilisateurs
- Créer ou modifier les rôles
- Modifier les permissions
- Réinitialiser la base
- Ajouter directement certaines écritures opérationnelles, sauf modification des permissions

### Utilisation recommandée

Ce rôle convient à une personne de direction qui doit consulter l’ensemble des données, contrôler les informations et exporter les rapports.

---

## 4. Contrôleur

### Description

Le Contrôleur vérifie les écritures et assure le suivi de la conformité des données.

### Ce qu’il peut faire

- Voir tous les tableaux et modules
- Valider les écritures
- Corriger les écritures
- Annuler les écritures
- Gérer les pièces jointes
- Voir le journal des écritures
- Exporter les rapports

### Ce qu’il ne peut pas faire

- Créer ou modifier les chantiers
- Gérer les utilisateurs
- Créer ou modifier les rôles
- Modifier les permissions
- Réinitialiser la base
- Ajouter directement des écritures opérationnelles, sauf modification des permissions

### Utilisation recommandée

Ce rôle est adapté à une personne chargée du contrôle, de la validation et de la vérification des informations saisies.

---

## 5. Chef chantier

### Description

Le Chef chantier est le rôle opérationnel principal sur le terrain.
Il peut saisir les informations liées aux travaux et au suivi quotidien.

### Ce qu’il peut faire

- Voir tous les tableaux et modules
- Créer et modifier les chantiers
- Ajouter l’outillage
- Ajouter les consommables
- Ajouter les matières
- Ajouter les coûts de transport
- Créer les fiches journalières
- Gérer les pièces jointes

### Ce qu’il ne peut pas faire

- Valider les écritures
- Corriger les écritures
- Annuler les écritures
- Voir le journal des écritures
- Exporter les rapports
- Gérer les utilisateurs
- Créer ou modifier les rôles
- Modifier les permissions
- Réinitialiser la base

### Règle importante

Le Chef chantier doit être affecté à un chantier.
Son accès dépend de son affectation au projet.

### Utilisation recommandée

Ce rôle convient à la personne présente sur chantier qui saisit les données terrain : matériels, matières, consommables, transport et activité journalière.

---

## 6. Magasinier

### Description

Le Magasinier gère principalement les entrées et sorties liées aux stocks, outils et matières.

### Ce qu’il peut faire

- Voir tous les tableaux et modules
- Ajouter l’outillage
- Ajouter les consommables
- Ajouter les matières
- Gérer les pièces jointes

### Ce qu’il ne peut pas faire

- Créer ou modifier les chantiers
- Ajouter la main-d’œuvre
- Ajouter les dépenses diverses
- Ajouter les coûts de transport
- Créer les fiches journalières
- Valider les écritures
- Corriger les écritures
- Annuler les écritures
- Voir le journal des écritures
- Exporter les rapports
- Gérer les utilisateurs
- Créer ou modifier les rôles
- Modifier les permissions
- Réinitialiser la base

### Utilisation recommandée

Ce rôle convient à la personne responsable du magasin, du matériel, des consommables et des matières.

---

## 7. Comptable

### Description

Le Comptable suit principalement les dépenses financières liées au chantier.

### Ce qu’il peut faire

- Voir tous les tableaux et modules
- Ajouter la main-d’œuvre
- Ajouter les dépenses diverses
- Ajouter les coûts de transport
- Gérer les pièces jointes
- Exporter les rapports

### Ce qu’il ne peut pas faire

- Créer ou modifier les chantiers
- Ajouter l’outillage
- Ajouter les consommables
- Ajouter les matières
- Créer les fiches journalières
- Valider les écritures
- Corriger les écritures
- Annuler les écritures
- Voir le journal des écritures
- Gérer les utilisateurs
- Créer ou modifier les rôles
- Modifier les permissions
- Réinitialiser la base

### Utilisation recommandée

Ce rôle convient à la personne chargée du suivi financier : paiements, main-d’œuvre, dépenses diverses, transport et exports.

---

## 8. Lecture

### Description

Le rôle Lecture est le rôle par défaut attribué aux nouveaux utilisateurs après le premier administrateur.

### Ce qu’il peut faire

- Voir tous les tableaux et modules

### Ce qu’il ne peut pas faire

- Créer ou modifier les chantiers
- Ajouter des écritures
- Valider les écritures
- Corriger les écritures
- Annuler les écritures
- Gérer les pièces jointes
- Voir le journal des écritures
- Exporter les rapports
- Gérer les utilisateurs
- Créer ou modifier les rôles
- Modifier les permissions
- Réinitialiser la base

### Utilisation recommandée

Ce rôle convient à une personne qui doit uniquement consulter les informations sans modifier les données.

---

# Résumé général

## Rôle le plus complet

Administrateur

## Rôles de direction et supervision

- PCA
- DG
- Contrôleur

## Rôles opérationnels

- Chef chantier
- Magasinier
- Comptable

## Rôle de consultation

Lecture
