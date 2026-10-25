import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  ClipboardCheck,
  UserRound,
  LogOut,
  Eye,
  EyeOff,
  School,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import "./App.css";

const API_URL = "http://192.168.100.6:8000/api";

const JOURS_SEMAINE = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];

function normaliserJour(jour) {
  return String(jour || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cleCreneau(creneau) {
  if (!creneau) return "sans-creneau";

  return [
    creneau.heure_debut || "",
    creneau.heure_fin || "",
    creneau.libelle || "",
    creneau.ordre ?? "",
  ].join("|");
}

function creerCreneauxMap(creneauxListe) {
  const creneaux = new Map();

  creneauxListe.forEach((creneau) => {
    const cle = cleCreneau(creneau);
    if (!creneaux.has(cle)) {
      creneaux.set(cle, creneau);
    }
  });

  return creneaux;
}

function trierCreneaux(creneaux) {
  return [...creneaux.entries()].sort((a, b) => {
    const creneauA = a[1];
    const creneauB = b[1];

    const ordreA = Number(creneauA.ordre ?? 999);
    const ordreB = Number(creneauB.ordre ?? 999);

    if (ordreA !== ordreB) return ordreA - ordreB;

    return String(creneauA.heure_debut || "").localeCompare(
      String(creneauB.heure_debut || ""),
    );
  });
}

function obtenirCreneauxEmploi(lignes, creneaux = []) {
  const tousLesCreneaux = creerCreneauxMap(creneaux);

  lignes.forEach((ligne) => {
    if (!ligne.creneau) return;

    const cle = cleCreneau(ligne.creneau);

    if (!tousLesCreneaux.has(cle)) {
      tousLesCreneaux.set(cle, ligne.creneau);
    }
  });

  return trierCreneaux(tousLesCreneaux);
}

function afficherHeure(creneau) {
  if (!creneau) return "Horaire non défini";

  if (creneau.heure_debut && creneau.heure_fin) {
    return `${creneau.heure_debut.slice(0, 5)} – ${creneau.heure_fin.slice(0, 5)}`;
  }

  return creneau.libelle || "Horaire non défini";
}

const ROLES = ["Administrateur", "Direction", "Professeur", "Educateur"];

const MODULES = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    description: "Vue générale de votre espace",
    icon: LayoutDashboard,
    roles: ["SuperAdmin", ...ROLES],
  },
  {
    id: "eleves",
    label: "Élèves et classes",
    description: "Consultation des élèves et des classes",
    icon: GraduationCap,
    roles: [
      "SuperAdmin",
      "Administrateur",
      "Direction",
      "Educateur",
      "Professeur",
    ],
  },
  {
    id: "emploi",
    label: "Emploi du temps",
    description: "Horaires, cours et salles",
    icon: CalendarDays,
    roles: ["SuperAdmin", ...ROLES],
  },
  {
    id: "notes",
    label: "Notes et évaluations",
    description: "Suivi des évaluations scolaires",
    icon: ClipboardCheck,
    roles: ["SuperAdmin", "Administrateur", "Direction", "Professeur"],
  },
  {
    id: "profil",
    label: "Mon profil",
    description: "Informations de votre compte",
    icon: UserRound,
    roles: ["SuperAdmin", ...ROLES],
  },
];

async function apiRequest(path, options = {}) {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      Accept: "application/json",
      ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationErrors = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    throw new Error(
      validationErrors ||
        data.message ||
        `Erreur serveur (${response.status}).`,
    );
  }

  return data;
}

function getRole(user) {
  if (user?.roles?.includes("SuperAdmin")) {
    return "SuperAdmin";
  }

  return user?.roles?.[0] || user?.fonction || "Personnel";
}

function getInitials(name) {
  if (!name) return "SC";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function App() {
  const [mode, setMode] = useState("personnel");
  const [etablissements, setEtablissements] = useState([]);
  const [etablissementId, setEtablissementId] = useState("");
  const [role, setRole] = useState("Professeur");
  const [personnel, setPersonnel] = useState([]);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [activePage, setActivePage] = useState("dashboard");
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesEmploi, setClassesEmploi] = useState([]);
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [modeVueEmploi, setModeVueEmploi] = useState("toutes-classes");
  const [classeEmploiSelectionnee, setClasseEmploiSelectionnee] = useState("");
  const [enseignantEmploiSelectionne, setEnseignantEmploiSelectionne] =
    useState("");
  const [chargementEmploi, setChargementEmploi] = useState(false);
  const [erreurEmploi, setErreurEmploi] = useState("");
  const [rechercheEleve, setRechercheEleve] = useState("");
  const [classeSelectionnee, setClasseSelectionnee] = useState("");
  const [chargementEleves, setChargementEleves] = useState(false);
  const [erreurEleves, setErreurEleves] = useState("");
  const [modeFormulaireEleve, setModeFormulaireEleve] = useState("");
  const [eleveSelectionne, setEleveSelectionne] = useState(null);
  const [enregistrementEleve, setEnregistrementEleve] = useState(false);
  const [formEleve, setFormEleve] = useState({
    classe_id: "",
    matricule: "",
    nom: "",
    prenoms: "",
    sexe: "Masculin",
    date_naissance: "",
    lieu_naissance: "",
    nationalite: "Ivoirienne",
    telephone: "",
    email: "",
    adresse: "",
    regime: "Externe",
    statut: "Actif",
    statut_affectation: "NON AFFECTÉ",
    type_tuteur: "Père",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loadingEstablishments, setLoadingEstablishments] = useState(true);
  const [loadingPersonnel, setLoadingPersonnel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEstablishments() {
      try {
        const data = await apiRequest("/mobile/etablissements");

        if (!cancelled) {
          setEtablissements(data);

          if (data.length > 0) {
            setEtablissementId(String(data[0].id));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Impossible de charger les établissements. ${err.message}`);
        }
      } finally {
        if (!cancelled) {
          setLoadingEstablishments(false);
        }
      }
    }

    loadEstablishments();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token || activePage !== "eleves") return;

    let annule = false;

    async function chargerElevesEtClasses() {
      setChargementEleves(true);
      setErreurEleves("");

      try {
        const params = new URLSearchParams();

        if (rechercheEleve.trim()) {
          params.set("q", rechercheEleve.trim());
        }

        if (classeSelectionnee) {
          params.set("classe_id", classeSelectionnee);
        }

        const [resultatClasses, resultatEleves] = await Promise.all([
          apiRequest("/mobile/classes", { token }),
          apiRequest(`/mobile/eleves?${params.toString()}`, { token }),
        ]);

        if (!annule) {
          setClasses(resultatClasses.data || []);
          setEleves(resultatEleves.data || []);
        }
      } catch (err) {
        if (!annule) {
          setErreurEleves(err.message);
        }
      } finally {
        if (!annule) {
          setChargementEleves(false);
        }
      }
    }

    chargerElevesEtClasses();

    return () => {
      annule = true;
    };
  }, [token, activePage, rechercheEleve, classeSelectionnee]);

  useEffect(() => {
    if (!token || activePage !== "emploi") return;

    let annule = false;

    async function chargerEmploiDuTemps() {
      setChargementEmploi(true);
      setErreurEmploi("");

      try {
        const [resultat, resultatClasses] = await Promise.all([
          apiRequest("/mobile/emploi-du-temps", { token }),
          apiRequest("/mobile/classes", { token }),
        ]);

        if (!annule) {
          setEmploiDuTemps(resultat.data || null);
          setClassesEmploi(resultatClasses.data || []);
        }
      } catch (err) {
        if (!annule) {
          setErreurEmploi(err.message);
        }
      } finally {
        if (!annule) {
          setChargementEmploi(false);
        }
      }
    }

    chargerEmploiDuTemps();

    return () => {
      annule = true;
    };
  }, [token, activePage]);

  useEffect(() => {
    if (mode !== "personnel" || !etablissementId || !role) {
      setPersonnel([]);
      setUserId("");
      return;
    }

    let cancelled = false;

    async function loadPersonnel() {
      setLoadingPersonnel(true);
      setPersonnel([]);
      setUserId("");
      setError("");

      try {
        const params = new URLSearchParams({
          etablissement_id: etablissementId,
          role,
        });

        const data = await apiRequest(
          `/mobile/personnel-options?${params.toString()}`,
        );

        if (!cancelled) {
          setPersonnel(data);

          if (data.length > 0) {
            setUserId(String(data[0].id));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Impossible de charger le personnel. ${err.message}`);
        }
      } finally {
        if (!cancelled) {
          setLoadingPersonnel(false);
        }
      }
    }

    loadPersonnel();

    return () => {
      cancelled = true;
    };
  }, [mode, etablissementId, role]);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const payload =
        mode === "superadmin"
          ? {
              mode: "superadmin",
              email: email.trim(),
              password,
            }
          : {
              mode: "personnel",
              etablissement_id: Number(etablissementId),
              role,
              user_id: Number(userId),
              password,
            };

      const data = await apiRequest("/mobile/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setToken(data.token);
      setUser(data.user || null);
      setMustChangePassword(Boolean(data.must_change_password));
      setPassword("");
      setActivePage("dashboard");
      setMessage(data.message || "Connexion réussie.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/mobile/change-password", {
        method: "POST",
        token,
        body: JSON.stringify({
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      setToken(data.token);
      setMustChangePassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setMessage(data.message);
      setActivePage("dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function testProfile() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await apiRequest("/mobile/me", { token });
      setUser(data);
      setMessage("Profil actualisé depuis le serveur.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await apiRequest("/mobile/logout", {
        method: "POST",
        token,
      });

      clearSession();
      setMessage("Déconnexion réussie.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function ouvrirCreationEleve() {
    setEleveSelectionne(null);
    setFormEleve({
      classe_id: classes[0] ? String(classes[0].id) : "",
      matricule: "",
      nom: "",
      prenoms: "",
      sexe: "Masculin",
      date_naissance: "",
      lieu_naissance: "",
      nationalite: "Ivoirienne",
      telephone: "",
      email: "",
      adresse: "",
      regime: "Externe",
      statut: "Actif",
      statut_affectation: "NON AFFECTÉ",
      type_tuteur: "Père",
    });
    setErreurEleves("");
    setModeFormulaireEleve("creation");
  }

  async function ouvrirModificationEleve(eleve) {
    setErreurEleves("");

    try {
      const resultat = await apiRequest(`/mobile/eleves/${eleve.id}`, {
        token,
      });
      const detail = resultat.data;

      setEleveSelectionne(detail);
      setFormEleve({
        classe_id: String(detail.classe_id || ""),
        matricule: detail.matricule || "",
        nom: detail.nom || "",
        prenoms: detail.prenoms || "",
        sexe: detail.sexe || "Masculin",
        date_naissance: detail.date_naissance
          ? String(detail.date_naissance).slice(0, 10)
          : "",
        lieu_naissance: detail.lieu_naissance || "",
        nationalite: detail.nationalite || "",
        telephone: detail.telephone || "",
        email: detail.email || "",
        adresse: detail.adresse || "",
        regime: detail.regime || "Externe",
        statut: detail.statut || "Actif",
        statut_affectation: detail.statut_affectation || "NON AFFECTÉ",
        type_tuteur: detail.type_tuteur || "Père",
      });

      setModeFormulaireEleve("modification");
    } catch (err) {
      setErreurEleves(err.message);
    }
  }

  async function enregistrerEleve(event) {
    event.preventDefault();
    setErreurEleves("");
    setEnregistrementEleve(true);

    try {
      const payload = {
        ...formEleve,
        classe_id: Number(formEleve.classe_id),
        date_naissance: formEleve.date_naissance || null,
      };

      const modification = modeFormulaireEleve === "modification";

      await apiRequest(
        modification
          ? `/mobile/eleves/${eleveSelectionne.id}`
          : "/mobile/eleves",
        {
          method: modification ? "PUT" : "POST",
          token,
          body: JSON.stringify(payload),
        },
      );

      setModeFormulaireEleve("");
      setEleveSelectionne(null);
      setMessage(
        modification ? "Élève modifié avec succès." : "Élève créé avec succès.",
      );

      const params = new URLSearchParams();
      if (rechercheEleve.trim()) params.set("q", rechercheEleve.trim());
      if (classeSelectionnee) params.set("classe_id", classeSelectionnee);

      const resultat = await apiRequest(`/mobile/eleves?${params.toString()}`, {
        token,
      });
      setEleves(resultat.data || []);
    } catch (err) {
      setErreurEleves(err.message);
    } finally {
      setEnregistrementEleve(false);
    }
  }

  async function supprimerEleve(eleve) {
    if (
      !window.confirm(
        `Confirmer la suppression de ${eleve.nom} ${eleve.prenoms} ?`,
      )
    ) {
      return;
    }

    setErreurEleves("");

    try {
      const resultat = await apiRequest(`/mobile/eleves/${eleve.id}`, {
        method: "DELETE",
        token,
      });

      setEleves((liste) => liste.filter((item) => item.id !== eleve.id));
      setMessage(resultat.message || "Élève supprimé.");
    } catch (err) {
      setErreurEleves(err.message);
    }
  }

  function clearSession() {
    setToken("");
    setUser(null);
    setMustChangePassword(false);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setActivePage("dashboard");
    setSidebarOpen(false);
  }

  function openPage(page) {
    setActivePage(page);
    setSidebarOpen(false);
    setError("");
    setMessage("");
  }

  const userRole = getRole(user);
  const isSuperAdmin = userRole === "SuperAdmin";
  const lignesEmploi = emploiDuTemps?.lignes || [];
  const classeEmploiActive = classesEmploi.some(
    (classe) => String(classe.id) === classeEmploiSelectionnee,
  )
    ? classeEmploiSelectionnee
    : String(classesEmploi[0]?.id || "");
  const enseignantsEmploi = [
    ...new Map(
      lignesEmploi
        .filter((ligne) => ligne.enseignant_id && ligne.enseignant)
        .map((ligne) => [
          String(ligne.enseignant_id),
          {
            id: String(ligne.enseignant_id),
            nom: ligne.enseignant,
          },
        ]),
    ).values(),
  ];
  const enseignantEmploiActif = enseignantsEmploi.some(
    (enseignant) => enseignant.id === enseignantEmploiSelectionne,
  )
    ? enseignantEmploiSelectionne
    : enseignantsEmploi[0]?.id || "";
  const etablissement = etablissements.find(
    (item) => String(item.id) === String(user?.etablissement_id),
  );

  const visibleModules = MODULES.filter((module) =>
    module.roles.includes(userRole),
  );

  const currentModule =
    MODULES.find((module) => module.id === activePage) || MODULES[0];

  const ActiveIcon = currentModule.icon;

  if (token && mustChangePassword) {
    return (
      <main className="app-shell">
        <section className="login-card">
          <div className="brand-mark">SC</div>
          <h1>StatEval-CI</h1>
          <p className="subtitle">Sécurisation de votre compte</p>

          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="notice success" role="status">
              {message}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <h2>Changer votre mot de passe</h2>
            <p className="help-text">
              Ce changement est obligatoire avant de poursuivre.
            </p>

            <label htmlFor="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Modifier le mot de passe"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="app-shell">
        <section className="login-card">
          <div className="brand-mark">SC</div>

          <h1>StatEval-CI</h1>
          <p className="subtitle">Votre espace de gestion scolaire</p>

          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="notice success" role="status">
              {message}
            </div>
          )}

          <div className="mode-switch">
            <button
              type="button"
              className={mode === "personnel" ? "active" : ""}
              onClick={() => {
                setMode("personnel");
                setError("");
                setMessage("");
              }}
            >
              Personnel
            </button>

            <button
              type="button"
              className={mode === "superadmin" ? "active" : ""}
              onClick={() => {
                setMode("superadmin");
                setError("");
                setMessage("");
              }}
            >
              SuperAdmin
            </button>
          </div>

          <form onSubmit={handleLogin}>
            {mode === "personnel" ? (
              <>
                <label htmlFor="etablissement">Établissement</label>
                <select
                  id="etablissement"
                  value={etablissementId}
                  onChange={(e) => setEtablissementId(e.target.value)}
                  required
                  disabled={loadingEstablishments}
                >
                  <option value="">
                    {loadingEstablishments
                      ? "Chargement..."
                      : "Choisir un établissement"}
                  </option>

                  {etablissements.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nom}
                    </option>
                  ))}
                </select>

                <label htmlFor="role">Fonction</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  {ROLES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <label htmlFor="personnel">Nom du personnel</label>
                <select
                  id="personnel"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  disabled={loadingPersonnel || personnel.length === 0}
                >
                  <option value="">
                    {loadingPersonnel
                      ? "Chargement du personnel..."
                      : personnel.length === 0
                        ? "Aucun personnel disponible"
                        : "Choisir votre nom"}
                  </option>

                  {personnel.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label htmlFor="email">Adresse e-mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  required
                />
              </>
            )}

            <label htmlFor="password">Mot de passe</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={
                loading ||
                (mode === "personnel" &&
                  (!etablissementId || !userId || loadingPersonnel))
              }
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <p className="footer-text">
            © {new Date().getFullYear()} StatEval-CI
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark small">SC</div>
          <div>
            <strong>StatEval-CI</strong>
            <span>Gestion scolaire</span>
          </div>
          <button
            type="button"
            className="icon-button sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-caption">MENU PRINCIPAL</div>

        <nav className="sidebar-nav">
          {visibleModules.map((module) => {
            const Icon = module.icon;

            return (
              <button
                key={module.id}
                type="button"
                className={`nav-item ${
                  activePage === module.id ? "nav-active" : ""
                }`}
                onClick={() => openPage(module.id)}
              >
                <Icon size={20} />
                <span>{module.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-user">
            <div className="avatar">{getInitials(user?.name)}</div>
            <div className="mini-user-info">
              <strong>{user?.name || "Utilisateur"}</strong>
              <span>{userRole}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut size={18} />
            <span>{loading ? "Déconnexion..." : "Se déconnecter"}</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <button
            type="button"
            className="icon-button menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={23} />
          </button>

          <div className="topbar-title">
            <span>Espace de gestion</span>
            <strong>{currentModule.label}</strong>
          </div>

          <button
            type="button"
            className="topbar-avatar"
            onClick={() => openPage("profil")}
            aria-label="Ouvrir mon profil"
          >
            {getInitials(user?.name)}
          </button>
        </header>

        <div className="dashboard-content">
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="notice success" role="status">
              {message}
              <button
                type="button"
                className="dismiss-notice"
                onClick={() => setMessage("")}
                aria-label="Fermer le message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {activePage === "dashboard" && (
            <>
              <div className="welcome-banner">
                <div className="welcome-copy">
                  <span className="eyebrow">BIENVENUE SUR VOTRE ESPACE</span>
                  <h1>Bonjour, {user?.name?.split(" ")[0] || "Bienvenue"} !</h1>
                  <p>
                    Retrouvez rapidement les fonctionnalités de votre espace
                    scolaire.
                  </p>
                </div>
                <div className="welcome-icon">
                  <School size={42} />
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Accès rapides</h2>
                  <p>Choisissez un module pour continuer.</p>
                </div>
              </div>

              <div className="module-grid">
                {visibleModules
                  .filter((module) => module.id !== "dashboard")
                  .map((module) => {
                    const Icon = module.icon;

                    return (
                      <button
                        type="button"
                        key={module.id}
                        className="module-card"
                        onClick={() => openPage(module.id)}
                      >
                        <div className="module-icon">
                          <Icon size={23} />
                        </div>
                        <strong>{module.label}</strong>
                        <span>{module.description}</span>
                      </button>
                    );
                  })}
              </div>

              <div className="section-heading profile-heading">
                <div>
                  <h2>Mon espace</h2>
                  <p>Informations de votre session.</p>
                </div>
              </div>

              <div className="session-card">
                <div className="session-icon">
                  <ShieldCheck size={23} />
                </div>
                <div className="session-info">
                  <strong>{user?.name || "Utilisateur connecté"}</strong>
                  <span>{userRole}</span>
                  <span>
                    {isSuperAdmin
                      ? "Accès SuperAdmin"
                      : etablissement?.nom ||
                        `Établissement n° ${user?.etablissement_id ?? "—"}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="refresh-button"
                  onClick={testProfile}
                  disabled={loading}
                  aria-label="Actualiser mon profil"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </>
          )}

          {activePage === "profil" && (
            <>
              <div className="page-intro">
                <div className="page-icon">
                  <UserRound size={25} />
                </div>
                <div>
                  <h1>Mon profil</h1>
                  <p>Informations de votre compte connecté.</p>
                </div>
              </div>

              <div className="profile-card">
                <div className="profile-avatar">{getInitials(user?.name)}</div>
                <h2>{user?.name || "Utilisateur"}</h2>
                <span className="role-badge">{userRole}</span>

                <div className="profile-details">
                  <div>
                    <span>Identifiant</span>
                    <strong>{user?.id ?? "—"}</strong>
                  </div>
                  <div>
                    <span>Fonction</span>
                    <strong>{user?.fonction || userRole}</strong>
                  </div>
                  <div>
                    <span>Établissement</span>
                    <strong>
                      {isSuperAdmin
                        ? "Administration générale"
                        : etablissement?.nom ||
                          `N° ${user?.etablissement_id ?? "—"}`}
                    </strong>
                  </div>
                  <div>
                    <span>Rôles du compte</span>
                    <strong>{user?.roles?.join(", ") || userRole}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-button profile-refresh"
                  onClick={testProfile}
                  disabled={loading}
                >
                  <RefreshCw size={17} />
                  {loading ? "Actualisation..." : "Actualiser mon profil"}
                </button>
              </div>
            </>
          )}

          {activePage === "eleves" && (
            <section className="eleves-mobile">
              <button
                type="button"
                className="back-link"
                onClick={() => openPage("dashboard")}
              >
                <ArrowLeft size={17} />
                Retour au tableau de bord
              </button>

              <div className="page-intro">
                <div className="page-icon">
                  <GraduationCap size={25} />
                </div>
                <div>
                  <h1>Élèves et classes</h1>
                  <p>Consultation des données scolaires</p>
                </div>
              </div>

              {[
                "SuperAdmin",
                "Administrateur",
                "Direction",
                "Educateur",
              ].includes(userRole) && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={ouvrirCreationEleve}
                >
                  <Plus size={18} />
                  Ajouter un élève
                </button>
              )}

              {modeFormulaireEleve && (
                <form className="eleve-form-mobile" onSubmit={enregistrerEleve}>
                  <h2>
                    {modeFormulaireEleve === "creation"
                      ? "Nouvel élève"
                      : "Modifier l'élève"}
                  </h2>

                  <label htmlFor="eleve-classe">Classe *</label>
                  <select
                    id="eleve-classe"
                    value={formEleve.classe_id}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, classe_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Choisir une classe</option>
                    {classes.map((classe) => (
                      <option key={classe.id} value={classe.id}>
                        {classe.libelle}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="eleve-nom">Nom *</label>
                  <input
                    id="eleve-nom"
                    value={formEleve.nom}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, nom: e.target.value })
                    }
                    required
                  />

                  <label htmlFor="eleve-prenoms">Prénoms *</label>
                  <input
                    id="eleve-prenoms"
                    value={formEleve.prenoms}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, prenoms: e.target.value })
                    }
                    required
                  />

                  <label htmlFor="eleve-matricule">Matricule national</label>
                  <input
                    id="eleve-matricule"
                    value={formEleve.matricule}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, matricule: e.target.value })
                    }
                    placeholder="8 chiffres suivis d'une lettre"
                  />

                  <label htmlFor="eleve-sexe">Sexe *</label>
                  <select
                    id="eleve-sexe"
                    value={formEleve.sexe}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, sexe: e.target.value })
                    }
                    required
                  >
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                  </select>

                  <label htmlFor="eleve-naissance">Date de naissance</label>
                  <input
                    id="eleve-naissance"
                    type="date"
                    value={formEleve.date_naissance}
                    onChange={(e) =>
                      setFormEleve({
                        ...formEleve,
                        date_naissance: e.target.value,
                      })
                    }
                  />

                  <label htmlFor="eleve-lieu">Lieu de naissance</label>
                  <input
                    id="eleve-lieu"
                    value={formEleve.lieu_naissance}
                    onChange={(e) =>
                      setFormEleve({
                        ...formEleve,
                        lieu_naissance: e.target.value,
                      })
                    }
                  />

                  <label htmlFor="eleve-nationalite">Nationalité</label>
                  <input
                    id="eleve-nationalite"
                    value={formEleve.nationalite}
                    onChange={(e) =>
                      setFormEleve({
                        ...formEleve,
                        nationalite: e.target.value,
                      })
                    }
                  />

                  <label htmlFor="eleve-telephone">Téléphone</label>
                  <input
                    id="eleve-telephone"
                    type="tel"
                    value={formEleve.telephone}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, telephone: e.target.value })
                    }
                  />

                  <label htmlFor="eleve-email">E-mail</label>
                  <input
                    id="eleve-email"
                    type="email"
                    value={formEleve.email}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, email: e.target.value })
                    }
                  />

                  <label htmlFor="eleve-adresse">Adresse</label>
                  <input
                    id="eleve-adresse"
                    value={formEleve.adresse}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, adresse: e.target.value })
                    }
                  />

                  <label htmlFor="eleve-regime">Régime *</label>
                  <select
                    id="eleve-regime"
                    value={formEleve.regime}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, regime: e.target.value })
                    }
                    required
                  >
                    <option value="Externe">Externe</option>
                    <option value="Demi-pensionnaire">Demi-pensionnaire</option>
                    <option value="Interne">Interne</option>
                  </select>

                  <label htmlFor="eleve-statut">Statut *</label>
                  <select
                    id="eleve-statut"
                    value={formEleve.statut}
                    onChange={(e) =>
                      setFormEleve({ ...formEleve, statut: e.target.value })
                    }
                    required
                  >
                    {[
                      "Actif",
                      "Transféré",
                      "Exclu",
                      "Abandonné",
                      "Diplômé",
                    ].map((statut) => (
                      <option key={statut} value={statut}>
                        {statut}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="eleve-affectation">
                    Statut d'affectation *
                  </label>
                  <select
                    id="eleve-affectation"
                    value={formEleve.statut_affectation}
                    onChange={(e) =>
                      setFormEleve({
                        ...formEleve,
                        statut_affectation: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="AFFECTÉ">AFFECTÉ</option>
                    <option value="NON AFFECTÉ">NON AFFECTÉ</option>
                  </select>

                  <label htmlFor="eleve-tuteur">Responsable légal *</label>
                  <select
                    id="eleve-tuteur"
                    value={formEleve.type_tuteur}
                    onChange={(e) =>
                      setFormEleve({
                        ...formEleve,
                        type_tuteur: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Autre">Autre</option>
                  </select>

                  {erreurEleves && (
                    <div className="notice error" role="alert">
                      {erreurEleves}
                    </div>
                  )}

                  <div className="eleve-form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setModeFormulaireEleve("")}
                      disabled={enregistrementEleve}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={enregistrementEleve}
                    >
                      {enregistrementEleve
                        ? "Enregistrement..."
                        : "Enregistrer"}
                    </button>
                  </div>
                </form>
              )}

              <div className="eleves-filtres">
                <label htmlFor="recherche-eleve">Rechercher un élève</label>
                <input
                  id="recherche-eleve"
                  type="search"
                  placeholder="Nom, prénom ou matricule"
                  value={rechercheEleve}
                  onChange={(e) => setRechercheEleve(e.target.value)}
                />

                <label htmlFor="filtre-classe">Classe</label>
                <select
                  id="filtre-classe"
                  value={classeSelectionnee}
                  onChange={(e) => setClasseSelectionnee(e.target.value)}
                >
                  <option value="">Toutes les classes accessibles</option>
                  {classes.map((classe) => (
                    <option key={classe.id} value={classe.id}>
                      {classe.libelle}
                    </option>
                  ))}
                </select>
              </div>

              {erreurEleves && (
                <div className="notice error" role="alert">
                  {erreurEleves}
                </div>
              )}

              <div className="eleves-resultats">
                <div className="eleves-resultats-entete">
                  <strong>Liste des élèves</strong>
                  <span>{eleves.length} résultat(s) affiché(s)</span>
                </div>

                {chargementEleves ? (
                  <p className="eleves-etat">Chargement des données...</p>
                ) : eleves.length === 0 ? (
                  <p className="eleves-etat">
                    Aucun élève ne correspond à cette recherche.
                  </p>
                ) : (
                  <div className="eleves-liste">
                    {eleves.map((eleve) => (
                      <article className="eleve-mobile-card" key={eleve.id}>
                        <div className="eleve-mobile-initiales">
                          {(eleve.nom || "?").charAt(0)}
                        </div>

                        <div className="eleve-mobile-infos">
                          <strong>
                            {eleve.nom} {eleve.prenoms}
                          </strong>
                          <span>
                            {eleve.classe?.libelle || "Classe non renseignée"}
                          </span>
                          <span>
                            Matricule :{" "}
                            {eleve.matricule || eleve.code_eleve || "—"}
                          </span>
                        </div>

                        <span className="eleve-mobile-statut">
                          {eleve.statut || "—"}
                        </span>

                        {[
                          "SuperAdmin",
                          "Administrateur",
                          "Direction",
                          "Educateur",
                        ].includes(userRole) && (
                          <div className="eleve-mobile-actions">
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => ouvrirModificationEleve(eleve)}
                              aria-label={`Modifier ${eleve.nom} ${eleve.prenoms}`}
                              title="Modifier"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => supprimerEleve(eleve)}
                              aria-label={`Supprimer ${eleve.nom} ${eleve.prenoms}`}
                              title="Supprimer"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage === "emploi" && (
            <section className="eleves-mobile">
              <button
                type="button"
                className="back-link"
                onClick={() => openPage("dashboard")}
              >
                <ArrowLeft size={17} />
                Retour au tableau de bord
              </button>

              <div className="page-intro">
                <div className="page-icon">
                  <CalendarDays size={25} />
                </div>
                <div>
                  <h1>Emploi du temps</h1>
                  <p>Consultation des cours publiés</p>
                </div>
              </div>

              {emploiDuTemps && (
                <div className="emploi-filtres">
                  {!["Professeur", "Educateur"].includes(userRole) && (
                    <div className="emploi-mode-selecteur">
                      <span>Afficher</span>
                      <div
                        className="emploi-modes"
                        role="group"
                        aria-label="Mode d’affichage de l’emploi du temps"
                      >
                        <button
                          type="button"
                          className={
                            modeVueEmploi === "toutes-classes" ? "active" : ""
                          }
                          onClick={() => setModeVueEmploi("toutes-classes")}
                        >
                          Global
                        </button>
                        <button
                          type="button"
                          className={modeVueEmploi === "classe" ? "active" : ""}
                          onClick={() => setModeVueEmploi("classe")}
                        >
                          Par classe
                        </button>
                        <button
                          type="button"
                          className={
                            modeVueEmploi === "enseignant" ? "active" : ""
                          }
                          onClick={() => setModeVueEmploi("enseignant")}
                        >
                          Par prof
                        </button>
                      </div>
                    </div>
                  )}

                  {userRole === "Professeur" ? (
                    <div className="emploi-filtre-info">
                      <strong>Mon emploi du temps</strong>
                      <span>Vue personnelle en lecture seule</span>
                    </div>
                  ) : (
                    <label className="emploi-filtre-champ">
                      {modeVueEmploi === "enseignant"
                        ? "Professeur"
                        : modeVueEmploi === "classe"
                          ? "Classe"
                          : "Vue globale"}
                      {modeVueEmploi === "enseignant" ? (
                        <select
                          value={enseignantEmploiActif}
                          onChange={(e) =>
                            setEnseignantEmploiSelectionne(e.target.value)
                          }
                          disabled={enseignantsEmploi.length === 0}
                        >
                          {enseignantsEmploi.map((enseignant) => (
                            <option key={enseignant.id} value={enseignant.id}>
                              {enseignant.nom}
                            </option>
                          ))}
                        </select>
                      ) : modeVueEmploi === "classe" ? (
                        <select
                          value={classeEmploiActive}
                          onChange={(e) =>
                            setClasseEmploiSelectionnee(e.target.value)
                          }
                          disabled={classesEmploi.length === 0}
                        >
                          {classesEmploi.length === 0 ? (
                            <option value="">Aucune classe disponible</option>
                          ) : (
                            classesEmploi.map((classe) => (
                              <option key={classe.id} value={classe.id}>
                                {classe.libelle}
                              </option>
                            ))
                          )}
                        </select>
                      ) : null}
                    </label>
                  )}
                </div>
              )}

              {erreurEmploi && (
                <div className="notice error" role="alert">
                  {erreurEmploi}
                </div>
              )}

              {chargementEmploi ? (
                <p className="eleves-etat">
                  Chargement de l’emploi du temps...
                </p>
              ) : !emploiDuTemps || !emploiDuTemps.lignes?.length ? (
                <p className="eleves-etat">
                  Aucun emploi du temps publié n’est disponible.
                </p>
              ) : (
                <div className="emploi-planning">
                  <div
                    className="emploi-grille-defilement"
                    role="region"
                    aria-label="Grille hebdomadaire de l’emploi du temps"
                    tabIndex={0}
                  >
                    <table className="emploi-grille">
                      <thead>
                        <tr>
                          <th className="emploi-colonne-horaire">Horaires</th>
                          {JOURS_SEMAINE.map((jour) => (
                            <th key={jour}>
                              {jour.charAt(0).toUpperCase() + jour.slice(1)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {obtenirCreneauxEmploi(
                          emploiDuTemps.lignes,
                          emploiDuTemps.creneaux || [],
                        ).map(([cle, creneau]) => {
                          const estPause =
                            creneau.type === "pause" ||
                            /pause|récré|recre/i.test(creneau.libelle || "");
                          const modeActif =
                            userRole === "Professeur"
                              ? "enseignant"
                              : modeVueEmploi;

                          return (
                            <tr
                              key={cle}
                              className={estPause ? "emploi-ligne-pause" : ""}
                            >
                              <th className="emploi-colonne-horaire">
                                <strong>{afficherHeure(creneau)}</strong>
                                {estPause && (
                                  <span>{creneau.libelle || "Pause"}</span>
                                )}
                              </th>
                              {JOURS_SEMAINE.map((jour) => {
                                const cours = emploiDuTemps.lignes.filter(
                                  (ligne) => {
                                    if (
                                      normaliserJour(ligne.jour) !== jour ||
                                      cleCreneau(ligne.creneau) !== cle
                                    ) {
                                      return false;
                                    }

                                    if (modeActif === "enseignant") {
                                      return (
                                        String(ligne.enseignant_id) ===
                                        enseignantEmploiActif
                                      );
                                    }

                                    if (modeActif === "classe") {
                                      return (
                                        String(ligne.classe_id) ===
                                        classeEmploiActive
                                      );
                                    }

                                    return true;
                                  },
                                );

                                return (
                                  <td key={jour}>
                                    {cours.length > 0 ? (
                                      <div className="emploi-cellule-cours">
                                        {cours.map((ligne) => {
                                          const couleur = /^#[\da-f]{6}$/i.test(
                                            ligne.matiere_couleur || "",
                                          )
                                            ? ligne.matiere_couleur
                                            : "#0f766e";
                                          const activites = {
                                            HE: "Heure d’étude (HE)",
                                            CDI: "Bibliothèque (CDI)",
                                            DN: "Devoirs de Niveau (DN)",
                                          };

                                          return (
                                            <article
                                              className="emploi-cours"
                                              key={ligne.id}
                                              style={{
                                                borderLeftColor: couleur,
                                                backgroundColor: `color-mix(in srgb, ${couleur} 13%, white)`,
                                              }}
                                            >
                                              <strong>
                                                {ligne.activite
                                                  ? activites[ligne.activite] ||
                                                    ligne.activite
                                                  : ligne.matiere_code ||
                                                    ligne.matiere ||
                                                    "Matière"}
                                              </strong>
                                              {ligne.groupe && (
                                                <span>{ligne.groupe}</span>
                                              )}
                                              {modeActif !== "classe" &&
                                                ligne.classe && (
                                                  <span>{ligne.classe}</span>
                                                )}
                                              {modeActif !== "enseignant" &&
                                                ligne.enseignant && (
                                                  <span>
                                                    {ligne.enseignant}
                                                  </span>
                                                )}
                                              {ligne.salle && (
                                                <span>Salle {ligne.salle}</span>
                                              )}
                                            </article>
                                          );
                                        })}
                                      </div>
                                    ) : estPause ? (
                                      <span className="emploi-pause-label">
                                        {creneau.libelle || "Pause"}
                                      </span>
                                    ) : (
                                      <span className="emploi-vide-label">
                                        —
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {activePage !== "dashboard" &&
            activePage !== "profil" &&
            activePage !== "eleves" &&
            activePage !== "emploi" && (
              <div className="module-placeholder">
                <button
                  type="button"
                  className="back-link"
                  onClick={() => openPage("dashboard")}
                >
                  <ArrowLeft size={17} />
                  Retour au tableau de bord
                </button>

                <div className="placeholder-icon">
                  <ActiveIcon size={34} />
                </div>

                <h1>{currentModule.label}</h1>
                <p>{currentModule.description}</p>

                <div className="coming-soon">
                  <span className="coming-soon-dot" />
                  Module à connecter à l’API
                </div>

                <p className="placeholder-help">
                  Ce module sera raccordé aux données de StatEval-CI avec les
                  autorisations correspondant à votre rôle.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => openPage("dashboard")}
                >
                  Revenir à l’accueil
                </button>
              </div>
            )}
        </div>

        <footer className="dashboard-footer">
          StatEval-CI · © {new Date().getFullYear()}
        </footer>
      </section>

      <nav className="mobile-bottom-nav">
        {[MODULES[0], MODULES[1], MODULES[2], MODULES[4]]
          .filter((module) => module.roles.includes(userRole))
          .map((module) => {
            const Icon = module.icon;

            return (
              <button
                key={module.id}
                type="button"
                className={activePage === module.id ? "bottom-active" : ""}
                onClick={() => openPage(module.id)}
              >
                <Icon size={21} />
                <span>
                  {module.id === "dashboard"
                    ? "Accueil"
                    : module.id === "eleves"
                      ? "Élèves"
                      : module.id === "emploi"
                        ? "Horaires"
                        : "Profil"}
                </span>
              </button>
            );
          })}
      </nav>
    </main>
  );
}
