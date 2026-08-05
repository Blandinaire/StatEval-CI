# 🚀 Démarrage de StatEval-CI

Ce document explique comment démarrer le projet en développement après un redémarrage du PC.

---

# 1. Démarrer Laragon

Ouvrir **Laragon** puis cliquer sur :

> Start All

Vérifier que :

- ✅ Apache est démarré
- ✅ MySQL est démarré

---

# 2. Ouvrir le projet

Ouvrir Visual Studio Code puis le dossier :

```
StatEval-CI/backend
```

---

# 3. Démarrer le serveur Laravel

Ouvrir un premier terminal :

```bash
cd backend
php artisan serve
```

Résultat attendu :

```
INFO  Server running on

http://127.0.0.1:8000
```

Ne pas fermer ce terminal.

---

# 4. Démarrer le serveur React (Vite)

Ouvrir un deuxième terminal :

```bash
cd backend
npm run dev
```

Résultat attendu :

```
VITE v...

➜ Local: http://localhost:5173/
```

Ne pas fermer ce terminal.

---

# 5. Vérifier les migrations

```bash
php artisan migrate:status
```

Toutes les migrations doivent être marquées :

```
Ran
```

---

# 6. Si nécessaire

En cas de problème :

```bash
php artisan optimize:clear
```

Puis redémarrer Laravel :

```bash
php artisan serve
```

---

# Structure des terminaux

## Terminal 1

```bash
cd backend
php artisan serve
```

---

## Terminal 2

```bash
cd backend
npm run dev
```

---

# URLs du projet

Backend Laravel

```
http://127.0.0.1:8000
```

Frontend Vite

```
http://localhost:5173
```

---

# Base de données

Nom :

```
stateval_ci
```

Gestion :

```
phpMyAdmin (Laragon)
```

---

# Technologies utilisées

- Laravel 12
- React
- Inertia.js
- Tailwind CSS
- Vite
- MySQL
- Spatie Permission
- Laravel Breeze

---

Version du projet

StatEval-CI v0.2