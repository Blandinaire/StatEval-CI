# 📘 Conventions de développement - StatEval-CI

Ce document définit les règles de développement du projet StatEval-CI afin de garantir un code homogène, lisible et facilement maintenable.

---

# 1. Technologies

- Laravel 12
- PHP 8.3+
- React 18
- Inertia.js
- Tailwind CSS
- MySQL
- Vite

---

# 2. Convention de nommage

## Tables

Toujours au pluriel.

Exemples :

- etablissements
- annee_scolaires
- cycles
- niveaux
- series
- classes
- matieres
- maquettes

---

## Modèles

Toujours au singulier.

Exemples :

- Etablissement
- AnneeScolaire
- Cycle
- Niveau
- Serie
- Classe
- Matiere
- Maquette

---

## Contrôleurs

Toujours :

NomDuModeleController

Exemples :

- MatiereController
- ClasseController
- MaquetteController

---

## Services

Toute la logique métier doit être placée dans :

```
app/Services
```

Exemples :

- MaquetteService
- EvaluationService
- BulletinService
- StatistiqueService

Les contrôleurs doivent rester les plus simples possible.

---

## Requests

Toutes les validations passent par :

```
app/Http/Requests
```

Exemple :

- StoreMatiereRequest
- UpdateMatiereRequest

---

# 3. Migrations

Toujours utiliser :

- foreignId()
- constrained()
- cascadeOnDelete()

Toujours donner un nom court aux contraintes.

Exemple :

```php
$table->unique(
    ['maquette_id', 'matiere_id'],
    'uq_maquette_matiere'
);
```

---

# 4. Relations Eloquent

Toujours créer les relations dans les deux modèles.

Exemple :

belongsTo()

hasMany()

belongsToMany()

---

# 5. React

Organisation par modules.

```
Modules/

Parametrage/

Eleves/

Enseignants/

Evaluations/

Bulletins/

Statistiques/
```

---

# 6. Composants React

Les composants communs sont placés dans :

```
resources/js/Components
```

Organisation :

```
Buttons/

Cards/

Forms/

Tables/

Layout/

Feedback/

Navigation/
```

---

# 7. Interface utilisateur

Toutes les pages utilisent :

- PageHeader
- FormCard
- DataTable
- PrimaryButton
- SecondaryButton
- DangerButton

---

# 8. Design System

Couleur principale

Blue 600

Succès

Emerald 600

Danger

Red 600

Fond

Gray 100

Cartes

White

---

# 9. Structure des contrôleurs

Chaque contrôleur doit être léger.

Toute la logique métier appartient aux Services.

Exemple :

```php
public function store(StoreMaquetteRequest $request)
{
    $this->maquetteService->create(
        $request->validated()
    );

    return redirect()->route('maquettes.index');
}
```

---

# 10. Git

Avant chaque push :

```bash
php artisan test

php artisan migrate:status

npm run build
```

Puis :

```bash
git add .

git commit -m "Description"

git push
```

---

# 11. Documentation

Chaque nouvelle fonctionnalité doit être documentée dans :

- CHANGELOG.md
- ROADMAP.md

Si une évolution modifie l'architecture, mettre à jour :

- ARCHITECTURE.md

---

# 12. Objectif

Construire une plateforme de gestion scolaire moderne, robuste et évolutive pour les établissements de Côte d'Ivoire.

Chaque nouveau module doit respecter ces conventions.