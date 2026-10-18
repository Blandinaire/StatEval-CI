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
} from "lucide-react";
import "./App.css";

const API_URL = "http://192.168.100.6:8000/api";

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

          {activePage !== "dashboard" && activePage !== "profil" && (
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
                L’interface est prête. La prochaine étape sera de relier ce
                module aux données de StatEval-CI, avec les autorisations
                correspondant à votre rôle.
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
