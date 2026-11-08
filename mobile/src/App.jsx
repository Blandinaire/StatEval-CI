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
  BookOpen,
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
      "Parent",
    ],
  },
  {
    id: "emploi",
    label: "Emploi du temps",
    description: "Horaires, cours et salles",
    icon: CalendarDays,
    roles: ["SuperAdmin", ...ROLES, "Parent"],
  },
  {
    id: "notes",
    label: "Notes et évaluations",
    description: "Suivi des évaluations scolaires",
    icon: ClipboardCheck,
    roles: [
      "SuperAdmin",
      "Administrateur",
      "Direction",
      "Professeur",
      "Parent",
    ],
  },
  {
    id: "resultats",
    label: "Résultats de mes classes",
    description: "Consultation des moyennes, rangs et notes des élèves",
    icon: BookOpen,
    roles: ["Professeur"],
  },
  {
    id: "profil",
    label: "Mon profil",
    description: "Informations de votre compte",
    icon: UserRound,
    roles: ["SuperAdmin", ...ROLES, "Parent"],
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
  const [telephone, setTelephone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [activePage, setActivePage] = useState("dashboard");
  const [eleves, setEleves] = useState([]);
  const [elevesParent, setElevesParent] = useState([]);
  const [eleveNotesSelectionne, setEleveNotesSelectionne] = useState("");
  const [notesEleve, setNotesEleve] = useState([]);
  const [trimestreNotes, setTrimestreNotes] = useState("");
  const [matiereNotes, setMatiereNotes] = useState("");
  const [chargementNotes, setChargementNotes] = useState(false);
  const [erreurNotes, setErreurNotes] = useState("");
  const [optionsEvaluations, setOptionsEvaluations] = useState({
    annee: null,
    years: [],
    etablissements: [],
    niveaux: [],
    classes: [],
    subjects: [],
    periods: [],
  });

  const [afficherFormulaireProgrammation, setAfficherFormulaireProgrammation] =
    useState(false);

  const [enregistrementProgrammation, setEnregistrementProgrammation] =
    useState(false);

  const [erreurProgrammation, setErreurProgrammation] = useState("");
  const [messageProgrammation, setMessageProgrammation] = useState("");

  const [afficherFormulaireProfesseur, setAfficherFormulaireProfesseur] =
    useState(false);

  const [
    enregistrementEvaluationProfesseur,
    setEnregistrementEvaluationProfesseur,
  ] = useState(false);

  const [erreurEvaluationProfesseur, setErreurEvaluationProfesseur] =
    useState("");

  const [messageEvaluationProfesseur, setMessageEvaluationProfesseur] =
    useState("");

  const [formEvaluationProfesseur, setFormEvaluationProfesseur] = useState({
    classe_id: "",
    matiere_id: "",
    type: "Devoir de classe",
    numero: "1",
    date_evaluation: "",
    bareme: "20",
    coefficient: "1",
    periode_scolaire_id: "",
    prise_en_compte_moyenne: true,
  });

  const [formProgrammation, setFormProgrammation] = useState({
    etablissement_id: "",
    annee_scolaire_id: "",
    niveau_id: "",
    classe_ids: [],
    matiere_id: "",
    libelle: "",
    type: "Devoir de niveau",
    numero: "",
    date_evaluation: "",
    heure_debut: "",
    heure_fin: "",
    bareme: "20",
    coefficient: "1",
    periode_scolaire_id: "",
    prise_en_compte_moyenne: true,
    notifier_professeurs: true,
    publier_eleves: false,
    publier_parents: false,
  });

  const [evaluations, setEvaluations] = useState([]);
  const [chargementEvaluations, setChargementEvaluations] = useState(false);
  const [erreurEvaluations, setErreurEvaluations] = useState("");

  const [anneeEvaluation, setAnneeEvaluation] = useState("");
  const [classeEvaluation, setClasseEvaluation] = useState("");
  const [matiereEvaluation, setMatiereEvaluation] = useState("");
  const [periodeEvaluation, setPeriodeEvaluation] = useState("");
  const [statutEvaluation, setStatutEvaluation] = useState("");
  const [evaluationSelectionnee, setEvaluationSelectionnee] = useState(null);
  const [classesEvaluationDetail, setClassesEvaluationDetail] = useState([]);
  const [classeNotesSelectionnee, setClasseNotesSelectionnee] = useState("");
  const [donneesNotesEvaluation, setDonneesNotesEvaluation] = useState(null);
  const [formNotesEvaluation, setFormNotesEvaluation] = useState([]);
  const [chargementDetailEvaluation, setChargementDetailEvaluation] =
    useState(false);
  const [enregistrementNotesEvaluation, setEnregistrementNotesEvaluation] =
    useState(false);
  const [erreurDetailEvaluation, setErreurDetailEvaluation] = useState("");
  const [messageDetailEvaluation, setMessageDetailEvaluation] = useState("");
  const [classes, setClasses] = useState([]);

  const [classeResultatsProf, setClasseResultatsProf] = useState("");
  const [periodeResultatsProf, setPeriodeResultatsProf] = useState("");
  const [donneesResultatsProf, setDonneesResultatsProf] = useState(null);
  const [chargementResultatsProf, setChargementResultatsProf] = useState(false);
  const [erreurResultatsProf, setErreurResultatsProf] = useState("");
  const [afficherEvaluationsProf, setAfficherEvaluationsProf] = useState(false);

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
  const userRole = getRole(user);

  function calculerAppreciationMobile(note, absent = false, bareme = 20) {
    if (absent) return "Absent";

    if (note === "" || note === null || note === undefined) {
      return "";
    }

    const valeur = Number(note);
    const baremeNumerique = Number(bareme);

    if (
      Number.isNaN(valeur) ||
      Number.isNaN(baremeNumerique) ||
      baremeNumerique <= 0
    ) {
      return "";
    }

    const noteSur20 = (valeur / baremeNumerique) * 20;

    if (noteSur20 >= 18) return "Excellent";
    if (noteSur20 >= 16) return "Très bien";
    if (noteSur20 >= 14) return "Bien";
    if (noteSur20 >= 12) return "Assez bien";
    if (noteSur20 >= 11) return "Moyen";
    if (noteSur20 >= 10) return "Passable";
    if (noteSur20 >= 8) return "Insuffisant";
    if (noteSur20 >= 5) return "Très insuffisant";

    return "Faible";
  }

  async function chargerNotesEvaluation(evaluation, classeId) {
    if (!evaluation || !classeId) return;

    setChargementDetailEvaluation(true);
    setErreurDetailEvaluation("");
    setMessageDetailEvaluation("");

    try {
      const resultat = await apiRequest(
        `/mobile/evaluations/${evaluation.id}/notes?classe_id=${classeId}`,
        { token },
      );

      setDonneesNotesEvaluation(resultat);

      setFormNotesEvaluation(
        (resultat.eleves || []).map((eleve) => {
          const note = eleve.note?.note ?? "";
          const absent = Boolean(eleve.note?.absent);

          return {
            eleve_id: eleve.id,
            note,
            absent,
            appreciation: calculerAppreciationMobile(
              note,
              absent,
              resultat.evaluation?.bareme,
            ),
            observation: eleve.note?.observation || "",
          };
        }),
      );

      setClasseNotesSelectionnee(String(classeId));
    } catch (err) {
      setErreurDetailEvaluation(err.message);
    } finally {
      setChargementDetailEvaluation(false);
    }
  }

  async function chargerResultatsClasseProf(classeId, periodeId = "") {
    if (!classeId || !token) {
      setDonneesResultatsProf(null);
      return;
    }

    setChargementResultatsProf(true);
    setErreurResultatsProf("");

    try {
      const params = new URLSearchParams();

      if (periodeId) {
        params.set("periode_scolaire_id", periodeId);
      }

      const resultat = await apiRequest(
        `/mobile/classes/${classeId}/resultats?${params.toString()}`,
        { token },
      );

      setDonneesResultatsProf(resultat);

      // L'API renvoie la période par défaut si aucune n'est demandée.
      if (resultat.periode?.id) {
        setPeriodeResultatsProf(String(resultat.periode.id));
      }
    } catch (err) {
      setDonneesResultatsProf(null);
      setErreurResultatsProf(err.message);
    } finally {
      setChargementResultatsProf(false);
    }
  }

  async function ouvrirEvaluation(evaluation) {
    const classesDisponibles =
      evaluation.classes?.length > 0
        ? evaluation.classes
        : evaluation.classe_id
          ? [{ id: evaluation.classe_id, libelle: evaluation.classe }]
          : [];

    if (classesDisponibles.length === 0) {
      setErreurDetailEvaluation("Aucune classe associée à cette évaluation.");
      return;
    }

    setEvaluationSelectionnee(evaluation);
    setClassesEvaluationDetail(classesDisponibles);

    await chargerNotesEvaluation(evaluation, classesDisponibles[0].id);
  }

  async function enregistrerNotesEvaluationMobile() {
    if (!evaluationSelectionnee || !classeNotesSelectionnee) return;

    setEnregistrementNotesEvaluation(true);
    setErreurDetailEvaluation("");
    setMessageDetailEvaluation("");

    try {
      const notes = formNotesEvaluation.map((ligne) => ({
        eleve_id: ligne.eleve_id,
        note:
          ligne.note === "" || ligne.note === null ? null : Number(ligne.note),
        absent: ligne.absent,
        appreciation: ligne.appreciation || null,
        observation: ligne.observation || null,
      }));

      const resultat = await apiRequest(
        `/mobile/evaluations/${evaluationSelectionnee.id}/notes`,
        {
          token,
          method: "PUT",
          body: JSON.stringify({
            classe_id: Number(classeNotesSelectionnee),
            notes,
          }),
        },
      );

      setMessageDetailEvaluation(
        resultat.message || "Notes enregistrées avec succès.",
      );

      await chargerNotesEvaluation(
        evaluationSelectionnee,
        classeNotesSelectionnee,
      );
    } catch (err) {
      setErreurDetailEvaluation(err.message);
    } finally {
      setEnregistrementNotesEvaluation(false);
    }
  }

  async function programmerEvaluationMobile(e) {
    e.preventDefault();

    setErreurProgrammation("");
    setMessageProgrammation("");

    if (formProgrammation.classe_ids.length === 0) {
      setErreurProgrammation("Sélectionnez au moins une classe.");
      return;
    }

    setEnregistrementProgrammation(true);

    try {
      const resultat = await apiRequest("/mobile/evaluations/programmer", {
        token,
        method: "POST",
        body: JSON.stringify({
          ...formProgrammation,
          etablissement_id: Number(
            isSuperAdmin
              ? formProgrammation.etablissement_id
              : user?.etablissement_id,
          ),
          annee_scolaire_id: Number(formProgrammation.annee_scolaire_id),
          niveau_id: Number(formProgrammation.niveau_id),
          classe_ids: formProgrammation.classe_ids.map(Number),
          matiere_id: Number(formProgrammation.matiere_id),
          numero: formProgrammation.numero
            ? Number(formProgrammation.numero)
            : null,
          bareme: Number(formProgrammation.bareme),
          coefficient: Number(formProgrammation.coefficient),
          periode_scolaire_id: Number(formProgrammation.periode_scolaire_id),
        }),
      });

      setMessageProgrammation(
        resultat.message || "Évaluation programmée avec succès.",
      );

      setAfficherFormulaireProgrammation(false);

      setFormProgrammation((ancien) => ({
        ...ancien,
        classe_ids: [],
        libelle: "",
        numero: "",
        date_evaluation: "",
        heure_debut: "",
        heure_fin: "",
      }));
    } catch (err) {
      setErreurProgrammation(err.message);
    } finally {
      setEnregistrementProgrammation(false);
    }
  }

  async function creerEvaluationProfesseur(e) {
    e.preventDefault();

    setErreurEvaluationProfesseur("");
    setMessageEvaluationProfesseur("");
    setEnregistrementEvaluationProfesseur(true);

    try {
      const resultat = await apiRequest("/mobile/evaluations/creer", {
        token,
        method: "POST",
        body: JSON.stringify({
          classe_id: Number(formEvaluationProfesseur.classe_id),
          matiere_id: Number(formEvaluationProfesseur.matiere_id),
          type: formEvaluationProfesseur.type,
          numero: Number(formEvaluationProfesseur.numero),
          date_evaluation: formEvaluationProfesseur.date_evaluation,
          bareme: Number(formEvaluationProfesseur.bareme),
          coefficient: Number(formEvaluationProfesseur.coefficient),
          periode_scolaire_id: Number(
            formEvaluationProfesseur.periode_scolaire_id,
          ),
          prise_en_compte_moyenne:
            formEvaluationProfesseur.prise_en_compte_moyenne,
        }),
      });

      setMessageEvaluationProfesseur(
        resultat.message || "Évaluation créée avec succès.",
      );

      setAfficherFormulaireProfesseur(false);

      setFormEvaluationProfesseur((ancien) => ({
        ...ancien,
        classe_id: "",
        matiere_id: "",
        numero: "1",
        date_evaluation: "",
      }));

      const actualisation = await apiRequest(
        `/mobile/evaluations?annee_scolaire_id=${optionsEvaluations.annee?.id || ""}`,
        { token },
      );

      setEvaluations(actualisation.data || []);
    } catch (err) {
      setErreurEvaluationProfesseur(err.message);
    } finally {
      setEnregistrementEvaluationProfesseur(false);
    }
  }

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
    if (!token || userRole !== "Parent" || activePage !== "notes") return;

    let annule = false;

    async function chargerElevesParent() {
      try {
        const resultat = await apiRequest("/mobile/eleves", { token });

        if (!annule) {
          const liste = resultat.data || [];
          setElevesParent(liste);

          if (liste.length > 0) {
            setEleveNotesSelectionne((actuel) =>
              liste.some((eleve) => String(eleve.id) === String(actuel))
                ? actuel
                : String(liste[0].id),
            );
          } else {
            setEleveNotesSelectionne("");
          }
        }
      } catch (err) {
        if (!annule) {
          setErreurNotes(err.message);
        }
      }
    }

    chargerElevesParent();

    return () => {
      annule = true;
    };
  }, [token, userRole, activePage]);

  useEffect(() => {
    if (
      !token ||
      userRole !== "Parent" ||
      activePage !== "notes" ||
      !eleveNotesSelectionne
    ) {
      setNotesEleve([]);
      return;
    }

    let annule = false;

    async function chargerNotesEleve() {
      setChargementNotes(true);
      setErreurNotes("");

      try {
        const resultat = await apiRequest(
          `/mobile/eleves/${eleveNotesSelectionne}/notes`,
          { token },
        );

        if (!annule) {
          setNotesEleve(resultat.data || []);
        }
      } catch (err) {
        if (!annule) {
          setErreurNotes(err.message);
          setNotesEleve([]);
        }
      } finally {
        if (!annule) {
          setChargementNotes(false);
        }
      }
    }

    chargerNotesEleve();

    return () => {
      annule = true;
    };
  }, [token, userRole, activePage, eleveNotesSelectionne]);

  useEffect(() => {
    if (
      !token ||
      !["notes", "resultats"].includes(activePage) ||
      userRole === "Parent"
    ) {
      return;
    }

    let annule = false;

    async function chargerOptionsEvaluations() {
      setChargementEvaluations(true);
      setErreurEvaluations("");

      try {
        const params = new URLSearchParams();

        if (isSuperAdmin && user?.etablissement_id) {
          params.set("etablissement_id", user.etablissement_id);
        }

        if (anneeEvaluation && userRole !== "Professeur") {
          params.set("annee_scolaire_id", anneeEvaluation);
        }

        const resultat = await apiRequest(
          `/mobile/evaluations/options?${params.toString()}`,
          { token },
        );

        if (annule) return;

        const donnees = resultat.data || {};

        setOptionsEvaluations({
          annee: donnees.annee_scolaire || null,
          years: donnees.annees || [],
          etablissements: donnees.etablissements || [],
          niveaux: donnees.niveaux || [],
          classes: donnees.classes || [],
          subjects: donnees.matieres || [],
          periods: donnees.periodes || [],
        });

        const anneeId = donnees.annee_scolaire?.id
          ? String(donnees.annee_scolaire.id)
          : "";

        setAnneeEvaluation((actuelle) => actuelle || anneeId);
      } catch (err) {
        if (!annule) setErreurEvaluations(err.message);
      } finally {
        if (!annule) setChargementEvaluations(false);
      }
    }

    chargerOptionsEvaluations();

    return () => {
      annule = true;
    };
  }, [token, activePage, userRole, anneeEvaluation]);

  useEffect(() => {
    if (!token || activePage !== "notes" || userRole === "Parent") return;

    let annule = false;

    async function chargerEvaluations() {
      setChargementEvaluations(true);
      setErreurEvaluations("");

      try {
        const params = new URLSearchParams();

        if (anneeEvaluation) params.set("annee_scolaire_id", anneeEvaluation);
        if (classeEvaluation) params.set("classe_id", classeEvaluation);
        if (matiereEvaluation) params.set("matiere_id", matiereEvaluation);
        if (periodeEvaluation)
          params.set("periode_scolaire_id", periodeEvaluation);
        if (statutEvaluation) params.set("statut", statutEvaluation);

        const resultat = await apiRequest(
          `/mobile/evaluations?${params.toString()}`,
          { token },
        );

        if (!annule) setEvaluations(resultat.data || []);
      } catch (err) {
        if (!annule) {
          setErreurEvaluations(err.message);
          setEvaluations([]);
        }
      } finally {
        if (!annule) setChargementEvaluations(false);
      }
    }

    chargerEvaluations();

    return () => {
      annule = true;
    };
  }, [
    token,
    activePage,
    userRole,
    anneeEvaluation,
    classeEvaluation,
    matiereEvaluation,
    periodeEvaluation,
    statutEvaluation,
  ]);

  useEffect(() => {
    if (
      !token ||
      userRole !== "Professeur" ||
      activePage !== "resultats" ||
      !classeResultatsProf
    ) {
      return;
    }

    chargerResultatsClasseProf(classeResultatsProf, periodeResultatsProf);
  }, [token, userRole, activePage, classeResultatsProf, periodeResultatsProf]);

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
          : mode === "parent"
            ? {
                mode: "parent",
                etablissement_id: Number(etablissementId),
                telephone: telephone.trim(),
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

  const trimestresDisponibles = [
    ...new Set(
      notesEleve.map((item) => item.evaluation?.periode).filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "fr"));

  const matieresDisponibles = [
    ...new Set(
      notesEleve.map((item) => item.evaluation?.matiere).filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "fr"));

  const notesFiltrees = notesEleve.filter((item) => {
    const trimestreCorrespond =
      !trimestreNotes || item.evaluation?.periode === trimestreNotes;

    const matiereCorrespond =
      !matiereNotes || item.evaluation?.matiere === matiereNotes;

    return trimestreCorrespond && matiereCorrespond;
  });

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

            <button
              type="button"
              className={mode === "parent" ? "active" : ""}
              onClick={() => {
                setMode("parent");
                setError("");
                setMessage("");
              }}
            >
              Parent
            </button>
          </div>

          <form onSubmit={handleLogin}>
            {mode !== "superadmin" && (
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
              </>
            )}

            {mode === "personnel" && (
              <>
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
            )}

            {mode === "parent" && (
              <>
                <label htmlFor="telephone">Numéro de téléphone</label>
                <input
                  id="telephone"
                  type="tel"
                  autoComplete="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Votre numéro de téléphone"
                  required
                />
              </>
            )}

            {mode === "superadmin" && (
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
                  (!etablissementId || !userId || loadingPersonnel)) ||
                (mode === "parent" &&
                  (!etablissementId ||
                    !telephone.trim() ||
                    loadingEstablishments))
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

          {activePage === "notes" && userRole === "Parent" && (
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
                  <ClipboardCheck size={25} />
                </div>
                <div>
                  <h1>Notes et évaluations</h1>
                  <p>Consultez les résultats scolaires de vos enfants.</p>
                </div>
              </div>

              <div className="eleves-filtres">
                <label htmlFor="eleve-notes">Choisir un enfant</label>
                <select
                  id="eleve-notes"
                  value={eleveNotesSelectionne}
                  onChange={(e) => {
                    setEleveNotesSelectionne(e.target.value);
                    setTrimestreNotes("");
                    setMatiereNotes("");
                  }}
                  disabled={elevesParent.length === 0}
                >
                  {elevesParent.length === 0 ? (
                    <option value="">Aucun enfant disponible</option>
                  ) : (
                    elevesParent.map((eleve) => (
                      <option key={eleve.id} value={eleve.id}>
                        {eleve.nom} {eleve.prenoms}
                        {eleve.classe?.libelle
                          ? ` — ${eleve.classe.libelle}`
                          : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="eleves-filtres">
                <label htmlFor="filtre-trimestre">Filtrer par trimestre</label>
                <select
                  id="filtre-trimestre"
                  value={trimestreNotes}
                  onChange={(e) => setTrimestreNotes(e.target.value)}
                >
                  <option value="">Tous les trimestres</option>
                  {trimestresDisponibles.map((trimestre) => (
                    <option key={trimestre} value={trimestre}>
                      {trimestre}
                    </option>
                  ))}
                </select>

                <label htmlFor="filtre-matiere">Filtrer par matière</label>
                <select
                  id="filtre-matiere"
                  value={matiereNotes}
                  onChange={(e) => setMatiereNotes(e.target.value)}
                >
                  <option value="">Toutes les matières</option>
                  {matieresDisponibles.map((matiere) => (
                    <option key={matiere} value={matiere}>
                      {matiere}
                    </option>
                  ))}
                </select>
              </div>

              {erreurNotes && (
                <div className="notice error" role="alert">
                  {erreurNotes}
                </div>
              )}

              <div className="eleves-resultats">
                <div className="eleves-resultats-entete">
                  <strong>Résultats scolaires</strong>
                  <span>{notesFiltrees.length} note(s)</span>
                </div>

                {chargementNotes ? (
                  <p className="eleves-etat">Chargement des notes...</p>
                ) : !eleveNotesSelectionne ? (
                  <p className="eleves-etat">
                    Aucun enfant associé à ce compte.
                  </p>
                ) : notesEleve.length === 0 ? (
                  <p className="eleves-etat">
                    Aucune note publiée aux parents pour cet enfant.
                  </p>
                ) : notesFiltrees.length === 0 ? (
                  <p className="eleves-etat">
                    Aucune note ne correspond aux filtres sélectionnés.
                  </p>
                ) : (
                  <div className="eleves-liste">
                    {notesFiltrees.map((item) => (
                      <article className="eleve-mobile-card" key={item.id}>
                        <div className="eleve-mobile-infos">
                          <strong>
                            {item.evaluation?.matiere ||
                              "Matière non renseignée"}
                          </strong>

                          <span>
                            {item.evaluation?.libelle || "Évaluation"}
                          </span>

                          <span>
                            Date : {item.evaluation?.date || "Non renseignée"}
                          </span>

                          <span>
                            Période :{" "}
                            {item.evaluation?.periode || "Non renseignée"}
                          </span>

                          <span>
                            {item.absent
                              ? "Absent"
                              : `Note : ${item.note ?? "Non renseignée"} / ${
                                  item.evaluation?.bareme ?? 20
                                }`}
                          </span>

                          {item.evaluation?.coefficient != null && (
                            <span>
                              Coefficient : {item.evaluation.coefficient}
                            </span>
                          )}

                          {item.appreciation && (
                            <span>Appréciation : {item.appreciation}</span>
                          )}

                          {item.observation && (
                            <span>Observation : {item.observation}</span>
                          )}

                          {!item.evaluation?.prise_en_compte_moyenne && (
                            <span>Non prise en compte dans la moyenne</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage === "notes" && userRole !== "Parent" && (
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
                  <ClipboardCheck size={25} />
                </div>
                <div>
                  <h1>Notes et évaluations</h1>
                  <p>
                    {userRole === "Professeur"
                      ? "Gérez vos évaluations et les résultats de vos élèves."
                      : "Suivez et contrôlez les évaluations de l'établissement."}
                  </p>
                </div>
              </div>

              {erreurEvaluations && (
                <div className="notice error" role="alert">
                  {erreurEvaluations}
                </div>
              )}

              {userRole === "Professeur" && (
                <div className="eleves-resultats" style={{ marginBottom: 20 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setAfficherFormulaireProfesseur((visible) => !visible);
                      setErreurEvaluationProfesseur("");
                      setMessageEvaluationProfesseur("");

                      if (!formEvaluationProfesseur.annee_scolaire_id) {
                        const anneeId =
                          anneeEvaluation || optionsEvaluations.annee?.id || "";

                        setFormEvaluationProfesseur((ancien) => ({
                          ...ancien,
                          annee_scolaire_id: String(anneeId),
                        }));
                      }
                    }}
                  >
                    {afficherFormulaireProfesseur
                      ? "Fermer le formulaire"
                      : "Créer une évaluation"}
                  </button>

                  {messageEvaluationProfesseur && (
                    <div className="notice success" role="status">
                      {messageEvaluationProfesseur}
                    </div>
                  )}

                  {erreurEvaluationProfesseur && (
                    <div className="notice error" role="alert">
                      {erreurEvaluationProfesseur}
                    </div>
                  )}

                  {afficherFormulaireProfesseur && (
                    <form onSubmit={creerEvaluationProfesseur}>
                      <h2>Nouvelle évaluation</h2>

                      <p>
                        L'évaluation sera automatiquement activée après sa
                        création.
                      </p>

                      <label>Année scolaire active</label>
                      <input
                        type="text"
                        value={
                          optionsEvaluations.annee?.libelle ||
                          "Aucune année active"
                        }
                        readOnly
                      />

                      <label>Classe</label>
                      <select
                        required
                        value={formEvaluationProfesseur.classe_id}
                        onChange={(e) =>
                          setFormEvaluationProfesseur((ancien) => ({
                            ...ancien,
                            classe_id: e.target.value,
                            matiere_id: "",
                          }))
                        }
                      >
                        <option value="">Choisir une classe</option>
                        {(optionsEvaluations.classes || []).map((classe) => (
                          <option key={classe.id} value={classe.id}>
                            {classe.libelle}
                          </option>
                        ))}
                      </select>

                      <label>Matière</label>
                      <select
                        required
                        value={formEvaluationProfesseur.matiere_id}
                        onChange={(e) =>
                          setFormEvaluationProfesseur((ancien) => ({
                            ...ancien,
                            matiere_id: e.target.value,
                          }))
                        }
                      >
                        <option value="">Choisir une matière</option>
                        {(optionsEvaluations.subjects || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.libelle}
                          </option>
                        ))}
                      </select>

                      <label>Type d'évaluation</label>
                      <select
                        required
                        value={formEvaluationProfesseur.type}
                        onChange={(e) =>
                          setFormEvaluationProfesseur((ancien) => ({
                            ...ancien,
                            type: e.target.value,
                          }))
                        }
                      >
                        <option value="Devoir de classe">
                          Devoir de classe
                        </option>
                        <option value="Interrogation écrite">
                          Interrogation écrite
                        </option>
                        <option value="Interrogation orale">
                          Interrogation orale
                        </option>
                        <option value="Devoir commun">Devoir commun</option>
                        <option value="Évaluation commune">
                          Évaluation commune
                        </option>
                        <option value="Composition trimestrielle">
                          Composition trimestrielle
                        </option>
                        <option value="Examen blanc">Examen blanc</option>
                        <option value="Test diagnostique">
                          Test diagnostique
                        </option>
                        <option value="Examen">Examen</option>
                        <option value="Autre">Autre</option>
                      </select>

                      <label>Numéro de l'évaluation</label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={formEvaluationProfesseur.numero}
                        onChange={(e) =>
                          setFormEvaluationProfesseur((ancien) => ({
                            ...ancien,
                            numero: e.target.value,
                          }))
                        }
                      />

                      <label>Période scolaire</label>
                      <select
                        required
                        value={formEvaluationProfesseur.periode_scolaire_id}
                        onChange={(e) =>
                          setFormEvaluationProfesseur((ancien) => ({
                            ...ancien,
                            periode_scolaire_id: e.target.value,
                          }))
                        }
                      >
                        <option value="">Choisir une période</option>
                        {(optionsEvaluations.periods || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.libelle}
                          </option>
                        ))}
                      </select>

                      <label>Libellé généré automatiquement</label>
                      <input
                        type="text"
                        readOnly
                        value={[
                          formEvaluationProfesseur.type,
                          formEvaluationProfesseur.numero
                            ? `N°${formEvaluationProfesseur.numero}`
                            : "",
                          optionsEvaluations.periods.find(
                            (item) =>
                              String(item.id) ===
                              String(
                                formEvaluationProfesseur.periode_scolaire_id,
                              ),
                          )?.libelle || "",
                        ]
                          .filter(Boolean)
                          .join(" - ")}
                      />

                      <label>Date de l'évaluation</label>
                      <input
                        required
                        type="date"
                        value={formEvaluationProfesseur.date_evaluation}
                        onChange={(e) =>
                          setFormEvaluationProfesseur((ancien) => ({
                            ...ancien,
                            date_evaluation: e.target.value,
                          }))
                        }
                      />

                      <label>Barème</label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.25"
                        value={formEvaluationProfesseur.bareme}
                        onChange={(e) =>
                          setFormEvaluationProfesseur((ancien) => ({
                            ...ancien,
                            bareme: e.target.value,
                          }))
                        }
                      />

                      <label>Coefficient</label>
                      <input
                        required
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formEvaluationProfesseur.coefficient}
                        onChange={(e) =>
                          setFormEvaluationProfesseur((ancien) => ({
                            ...ancien,
                            coefficient: e.target.value,
                          }))
                        }
                      />

                      <div style={{ marginTop: 15 }}>
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              formEvaluationProfesseur.prise_en_compte_moyenne
                            }
                            onChange={(e) =>
                              setFormEvaluationProfesseur((ancien) => ({
                                ...ancien,
                                prise_en_compte_moyenne: e.target.checked,
                              }))
                            }
                          />
                          Prendre en compte dans la moyenne
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={enregistrementEvaluationProfesseur}
                      >
                        {enregistrementEvaluationProfesseur
                          ? "Enregistrement..."
                          : "Créer et activer l'évaluation"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {[
                "SuperAdmin",
                "Administrateur",
                "Direction",
                "Directeur",
              ].includes(userRole) && (
                <div className="eleves-resultats" style={{ marginBottom: 20 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setAfficherFormulaireProgrammation((visible) => !visible);
                      setErreurProgrammation("");
                      setMessageProgrammation("");
                    }}
                  >
                    {afficherFormulaireProgrammation
                      ? "Fermer le formulaire"
                      : "Programmer une évaluation"}
                  </button>

                  {messageProgrammation && (
                    <div className="notice success" role="status">
                      {messageProgrammation}
                    </div>
                  )}

                  {erreurProgrammation && (
                    <div className="notice error" role="alert">
                      {erreurProgrammation}
                    </div>
                  )}

                  {afficherFormulaireProgrammation && (
                    <form onSubmit={programmerEvaluationMobile}>
                      <h2>Nouvelle évaluation</h2>

                      {isSuperAdmin && (
                        <>
                          <label>Établissement</label>
                          <select
                            required
                            value={formProgrammation.etablissement_id}
                            onChange={(e) =>
                              setFormProgrammation((ancien) => ({
                                ...ancien,
                                etablissement_id: e.target.value,
                                classe_ids: [],
                              }))
                            }
                          >
                            <option value="">Choisir un établissement</option>
                            {(optionsEvaluations.etablissements || []).map(
                              (item) => (
                                <option key={item.id} value={item.id}>
                                  {item.nom}
                                </option>
                              ),
                            )}
                          </select>
                        </>
                      )}

                      <label>Année scolaire</label>
                      <select
                        required
                        value={formProgrammation.annee_scolaire_id}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            annee_scolaire_id: e.target.value,
                            classe_ids: [],
                            periode_scolaire_id: "",
                          }))
                        }
                      >
                        <option value="">Choisir une année scolaire</option>
                        {(optionsEvaluations.years || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.libelle}
                          </option>
                        ))}
                      </select>

                      <label>Niveau</label>
                      <select
                        required
                        value={formProgrammation.niveau_id}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            niveau_id: e.target.value,
                            classe_ids: [],
                          }))
                        }
                      >
                        <option value="">Choisir un niveau</option>
                        {(optionsEvaluations.niveaux || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.libelle}
                          </option>
                        ))}
                      </select>

                      <label>Classes concernées</label>
                      <div className="eleve-mobile-card">
                        {(optionsEvaluations.classes || [])
                          .filter(
                            (classe) =>
                              String(classe.annee_scolaire_id) ===
                                String(formProgrammation.annee_scolaire_id) &&
                              String(classe.niveau_id) ===
                                String(formProgrammation.niveau_id) &&
                              (!formProgrammation.etablissement_id ||
                                String(classe.etablissement_id) ===
                                  String(formProgrammation.etablissement_id)),
                          )
                          .map((classe) => (
                            <label key={classe.id} style={{ display: "block" }}>
                              <input
                                type="checkbox"
                                checked={formProgrammation.classe_ids.includes(
                                  String(classe.id),
                                )}
                                onChange={(e) =>
                                  setFormProgrammation((ancien) => ({
                                    ...ancien,
                                    classe_ids: e.target.checked
                                      ? [
                                          ...ancien.classe_ids,
                                          String(classe.id),
                                        ]
                                      : ancien.classe_ids.filter(
                                          (id) => id !== String(classe.id),
                                        ),
                                  }))
                                }
                              />
                              {classe.libelle}
                            </label>
                          ))}

                        {formProgrammation.annee_scolaire_id &&
                          formProgrammation.niveau_id &&
                          (optionsEvaluations.classes || []).filter(
                            (classe) =>
                              String(classe.annee_scolaire_id) ===
                                String(formProgrammation.annee_scolaire_id) &&
                              String(classe.niveau_id) ===
                                String(formProgrammation.niveau_id) &&
                              (!formProgrammation.etablissement_id ||
                                String(classe.etablissement_id) ===
                                  String(formProgrammation.etablissement_id)),
                          ).length === 0 && (
                            <p className="eleves-etat">
                              Aucune classe disponible pour ces critères.
                            </p>
                          )}
                      </div>

                      <label>Matière</label>
                      <select
                        required
                        value={formProgrammation.matiere_id}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            matiere_id: e.target.value,
                          }))
                        }
                      >
                        <option value="">Choisir une matière</option>
                        {(optionsEvaluations.subjects || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.libelle}
                          </option>
                        ))}
                      </select>

                      <label>Libellé de l'évaluation</label>
                      <input
                        required
                        type="text"
                        maxLength="255"
                        placeholder="Ex. Devoir de mathématiques"
                        value={formProgrammation.libelle}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            libelle: e.target.value,
                          }))
                        }
                      />

                      <label>Type d'évaluation</label>
                      <select
                        required
                        value={formProgrammation.type}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            type: e.target.value,
                          }))
                        }
                      >
                        <option value="Devoir de niveau">
                          Devoir de niveau
                        </option>
                        <option value="Composition trimestrielle">
                          Composition trimestrielle
                        </option>
                        <option value="Examen blanc">Examen blanc</option>
                        <option value="Devoir commun">Devoir commun</option>
                        <option value="Évaluation commune">
                          Évaluation commune
                        </option>
                        <option value="Test diagnostique">
                          Test diagnostique
                        </option>
                        <option value="Examen">Examen</option>
                        <option value="Autre">Autre</option>
                      </select>

                      <label>Numéro (facultatif)</label>
                      <input
                        type="number"
                        min="1"
                        value={formProgrammation.numero}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            numero: e.target.value,
                          }))
                        }
                      />

                      <label>Date de l'évaluation</label>
                      <input
                        required
                        type="date"
                        value={formProgrammation.date_evaluation}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            date_evaluation: e.target.value,
                          }))
                        }
                      />

                      <label>Heure de début</label>
                      <input
                        type="time"
                        value={formProgrammation.heure_debut}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            heure_debut: e.target.value,
                          }))
                        }
                      />

                      <label>Heure de fin</label>
                      <input
                        type="time"
                        value={formProgrammation.heure_fin}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            heure_fin: e.target.value,
                          }))
                        }
                      />

                      <label>Barème</label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.25"
                        value={formProgrammation.bareme}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            bareme: e.target.value,
                          }))
                        }
                      />

                      <label>Coefficient</label>
                      <input
                        required
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formProgrammation.coefficient}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            coefficient: e.target.value,
                          }))
                        }
                      />

                      <label>Période scolaire</label>
                      <select
                        required
                        value={formProgrammation.periode_scolaire_id}
                        onChange={(e) =>
                          setFormProgrammation((ancien) => ({
                            ...ancien,
                            periode_scolaire_id: e.target.value,
                          }))
                        }
                      >
                        <option value="">Choisir une période</option>
                        {(optionsEvaluations.periods || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.libelle} ({item.date_debut} au {item.date_fin}
                            )
                          </option>
                        ))}
                      </select>

                      <div style={{ marginTop: 15 }}>
                        <label>
                          <input
                            type="checkbox"
                            checked={formProgrammation.prise_en_compte_moyenne}
                            onChange={(e) =>
                              setFormProgrammation((ancien) => ({
                                ...ancien,
                                prise_en_compte_moyenne: e.target.checked,
                              }))
                            }
                          />
                          Prendre en compte dans la moyenne
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={formProgrammation.notifier_professeurs}
                            onChange={(e) =>
                              setFormProgrammation((ancien) => ({
                                ...ancien,
                                notifier_professeurs: e.target.checked,
                              }))
                            }
                          />
                          Notifier les professeurs
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={formProgrammation.publier_eleves}
                            onChange={(e) =>
                              setFormProgrammation((ancien) => ({
                                ...ancien,
                                publier_eleves: e.target.checked,
                              }))
                            }
                          />
                          Publier aux élèves
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={formProgrammation.publier_parents}
                            onChange={(e) =>
                              setFormProgrammation((ancien) => ({
                                ...ancien,
                                publier_parents: e.target.checked,
                              }))
                            }
                          />
                          Publier aux parents
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={enregistrementProgrammation}
                      >
                        {enregistrementProgrammation
                          ? "Programmation en cours..."
                          : "Enregistrer la programmation"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="eleves-filtres">
                <label>Année scolaire</label>
                <select
                  value={anneeEvaluation}
                  onChange={(e) => setAnneeEvaluation(e.target.value)}
                >
                  <option value="">Toutes les années</option>
                  {(optionsEvaluations?.years || []).map((annee) => (
                    <option key={annee.id} value={annee.id}>
                      {annee.libelle}
                    </option>
                  ))}
                </select>

                <label>Classe</label>
                <select
                  value={classeEvaluation}
                  onChange={(e) => setClasseEvaluation(e.target.value)}
                >
                  <option value="">Toutes les classes</option>
                  {(optionsEvaluations?.classes || []).map((classe) => (
                    <option key={classe.id} value={classe.id}>
                      {classe.libelle}
                    </option>
                  ))}
                </select>

                <label>Matière</label>
                <select
                  value={matiereEvaluation}
                  onChange={(e) => setMatiereEvaluation(e.target.value)}
                >
                  <option value="">Toutes les matières</option>
                  {(optionsEvaluations?.subjects || []).map((matiere) => (
                    <option key={matiere.id} value={matiere.id}>
                      {matiere.libelle}
                    </option>
                  ))}
                </select>

                <label>Période scolaire</label>
                <select
                  value={periodeEvaluation}
                  onChange={(e) => setPeriodeEvaluation(e.target.value)}
                >
                  <option value="">Toutes les périodes</option>
                  {(optionsEvaluations?.periods || []).map((periode) => (
                    <option key={periode.id} value={periode.id}>
                      {periode.libelle}
                    </option>
                  ))}
                </select>

                <label>Statut</label>
                <select
                  value={statutEvaluation}
                  onChange={(e) => setStatutEvaluation(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="programmee">Programmée</option>
                  <option value="active">Active</option>
                </select>
              </div>

              {evaluationSelectionnee && (
                <div className="eleves-resultats" style={{ marginBottom: 20 }}>
                  <div className="eleves-resultats-entete">
                    <strong>
                      {evaluationSelectionnee.libelle} — Saisie des notes
                    </strong>

                    <button
                      type="button"
                      onClick={() => {
                        setEvaluationSelectionnee(null);
                        setDonneesNotesEvaluation(null);
                        setFormNotesEvaluation([]);
                        setErreurDetailEvaluation("");
                        setMessageDetailEvaluation("");
                      }}
                    >
                      Fermer
                    </button>
                  </div>

                  {classesEvaluationDetail.length > 1 && (
                    <div className="eleves-filtres">
                      <label>Classe concernée</label>

                      <select
                        value={classeNotesSelectionnee}
                        onChange={(e) =>
                          chargerNotesEvaluation(
                            evaluationSelectionnee,
                            e.target.value,
                          )
                        }
                      >
                        {classesEvaluationDetail.map((classe) => (
                          <option key={classe.id} value={classe.id}>
                            {classe.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {erreurDetailEvaluation && (
                    <div className="notice error" role="alert">
                      {erreurDetailEvaluation}
                    </div>
                  )}

                  {messageDetailEvaluation && (
                    <div className="notice success">
                      {messageDetailEvaluation}
                    </div>
                  )}

                  {chargementDetailEvaluation ? (
                    <p className="eleves-etat">Chargement des élèves...</p>
                  ) : donneesNotesEvaluation ? (
                    <>
                      <p>
                        Classe :{" "}
                        <strong>
                          {donneesNotesEvaluation.classe?.libelle}
                        </strong>
                      </p>

                      <p>
                        Barème :{" "}
                        <strong>
                          {donneesNotesEvaluation.evaluation?.bareme}
                        </strong>
                      </p>

                      <div className="notes-table-container">
                        <table className="notes-table">
                          <thead>
                            <tr>
                              <th>N°</th>
                              <th>Élève</th>
                              <th>
                                Note /{" "}
                                {donneesNotesEvaluation.evaluation.bareme}
                              </th>
                              <th>Absence</th>
                              <th>Appréciation</th>
                              <th>Observation</th>
                            </tr>
                          </thead>

                          <tbody>
                            {donneesNotesEvaluation.eleves.map(
                              (eleve, index) => {
                                const ligne = formNotesEvaluation[index];

                                if (!ligne) return null;

                                return (
                                  <tr key={eleve.id}>
                                    <td>{index + 1}</td>

                                    <td className="notes-eleve-identite">
                                      <strong>
                                        {eleve.nom} {eleve.prenoms}
                                      </strong>
                                      <small>
                                        {eleve.matricule ||
                                          eleve.code_eleve ||
                                          "Sans matricule"}
                                      </small>
                                    </td>

                                    <td>
                                      <input
                                        className="notes-table-input notes-input-note"
                                        type="number"
                                        min="0"
                                        max={
                                          donneesNotesEvaluation.evaluation
                                            .bareme
                                        }
                                        step="0.25"
                                        value={ligne.absent ? "" : ligne.note}
                                        disabled={
                                          ligne.absent ||
                                          userRole !== "Professeur"
                                        }
                                        placeholder="Note"
                                        onChange={(e) => {
                                          const nouvelleNote = e.target.value;

                                          setFormNotesEvaluation((anciennes) =>
                                            anciennes.map((item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    note: nouvelleNote,
                                                    appreciation:
                                                      calculerAppreciationMobile(
                                                        nouvelleNote,
                                                        item.absent,
                                                        donneesNotesEvaluation
                                                          .evaluation.bareme,
                                                      ),
                                                  }
                                                : item,
                                            ),
                                          );
                                        }}
                                      />
                                    </td>

                                    <td className="notes-table-absence">
                                      <input
                                        type="checkbox"
                                        checked={ligne.absent}
                                        disabled={userRole !== "Professeur"}
                                        onChange={(e) => {
                                          const absent = e.target.checked;

                                          setFormNotesEvaluation((anciennes) =>
                                            anciennes.map((item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    absent,
                                                    note: absent
                                                      ? ""
                                                      : item.note,
                                                    appreciation:
                                                      calculerAppreciationMobile(
                                                        item.note,
                                                        absent,
                                                        donneesNotesEvaluation
                                                          .evaluation.bareme,
                                                      ),
                                                  }
                                                : item,
                                            ),
                                          );
                                        }}
                                      />
                                    </td>

                                    <td>
                                      <span
                                        className={`notes-appreciation ${
                                          ligne.appreciation
                                            ? "notes-appreciation-active"
                                            : ""
                                        }`}
                                      >
                                        {ligne.appreciation || "—"}
                                      </span>
                                    </td>

                                    <td>
                                      <textarea
                                        className="notes-table-observation"
                                        value={ligne.observation}
                                        disabled={userRole !== "Professeur"}
                                        placeholder="Observation..."
                                        rows={2}
                                        onChange={(e) => {
                                          const observation = e.target.value;

                                          setFormNotesEvaluation((anciennes) =>
                                            anciennes.map((item, i) =>
                                              i === index
                                                ? { ...item, observation }
                                                : item,
                                            ),
                                          );
                                        }}
                                      />
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>

                      {userRole === "Professeur" && (
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={enregistrementNotesEvaluation}
                          onClick={enregistrerNotesEvaluationMobile}
                        >
                          {enregistrementNotesEvaluation
                            ? "Enregistrement..."
                            : "Enregistrer les notes"}
                        </button>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              <div className="eleves-resultats">
                <div className="eleves-resultats-entete">
                  <strong>Liste des évaluations</strong>
                  <span>{evaluations.length} évaluation(s)</span>
                </div>

                {chargementEvaluations ? (
                  <p className="eleves-etat">Chargement des évaluations...</p>
                ) : evaluations.length === 0 ? (
                  <p className="eleves-etat">
                    Aucune évaluation disponible pour ces critères.
                  </p>
                ) : (
                  <div className="eleves-liste">
                    {evaluations.map((evaluation) => (
                      <article
                        className="eleve-mobile-card"
                        key={evaluation.id}
                      >
                        <div className="eleve-mobile-infos">
                          <strong>{evaluation.libelle}</strong>
                          <span>
                            Classe :{" "}
                            {evaluation.classes?.length > 0
                              ? evaluation.classes
                                  .map((c) => c.libelle)
                                  .join(", ")
                              : typeof evaluation.classe === "string"
                                ? evaluation.classe
                                : evaluation.classe?.libelle ||
                                  "Non renseignée"}
                          </span>
                          <span>
                            Matière :{" "}
                            {typeof evaluation.matiere === "string"
                              ? evaluation.matiere
                              : evaluation.matiere?.libelle ||
                                evaluation.matiere?.nom ||
                                "Non renseignée"}
                          </span>
                          <span>
                            Date :{" "}
                            {evaluation.date_evaluation || "Non renseignée"}
                          </span>
                          <span>
                            Période :{" "}
                            {typeof evaluation.periode === "string"
                              ? evaluation.periode
                              : evaluation.periode?.libelle ||
                                evaluation.periode_scolaire?.libelle ||
                                "Non renseignée"}
                          </span>
                          <span>
                            Barème : {evaluation.bareme ?? 20} | Coefficient :{" "}
                            {evaluation.coefficient ?? 1}
                          </span>
                          <span>
                            Statut : {evaluation.statut || "Non renseigné"}
                          </span>
                          <span>
                            Notes saisies : {evaluation.notes_count ?? 0}
                          </span>

                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => ouvrirEvaluation(evaluation)}
                          >
                            <ClipboardCheck size={16} />
                            Consulter les élèves et les notes
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage === "resultats" && userRole === "Professeur" && (
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
                  <BookOpen size={25} />
                </div>
                <div>
                  <h1>Résultats de mes classes</h1>
                  <p>
                    Consultez les moyennes, les rangs et les notes de vos
                    élèves.
                  </p>
                </div>
              </div>

              <div className="eleves-resultats resultats-prof-section">
                <div className="eleves-resultats-entete">
                  <strong>Résultats de mes classes</strong>
                  <span>{donneesResultatsProf?.effectif ?? 0} élève(s)</span>
                </div>

                <div className="eleves-filtres">
                  <label>Classe</label>
                  <select
                    value={classeResultatsProf}
                    onChange={(e) => {
                      setClasseResultatsProf(e.target.value);
                      setPeriodeResultatsProf("");
                      setDonneesResultatsProf(null);
                    }}
                  >
                    <option value="">Choisir une classe</option>
                    {(optionsEvaluations.classes || []).map((classe) => (
                      <option key={classe.id} value={classe.id}>
                        {classe.libelle}
                      </option>
                    ))}
                  </select>

                  <label>Période scolaire</label>
                  <select
                    value={periodeResultatsProf}
                    onChange={(e) => setPeriodeResultatsProf(e.target.value)}
                    disabled={!donneesResultatsProf?.periodes?.length}
                  >
                    {(donneesResultatsProf?.periodes || []).map((periode) => (
                      <option key={periode.id} value={periode.id}>
                        {periode.libelle}
                      </option>
                    ))}
                  </select>
                </div>

                {erreurResultatsProf && (
                  <div className="notice error" role="alert">
                    {erreurResultatsProf}
                  </div>
                )}

                {chargementResultatsProf ? (
                  <p className="eleves-etat">Chargement des résultats...</p>
                ) : !classeResultatsProf ? (
                  <p className="eleves-etat">
                    Sélectionnez une classe pour consulter ses résultats.
                  </p>
                ) : donneesResultatsProf ? (
                  <>
                    <div className="resultats-prof-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() =>
                          setAfficherEvaluationsProf((visible) => !visible)
                        }
                      >
                        {afficherEvaluationsProf
                          ? "Masquer les évaluations"
                          : "Afficher les évaluations"}
                      </button>
                    </div>

                    <p className="resultats-prof-info">
                      Les moyennes générales, totaux de points et rangs sont
                      calculés sur l'ensemble des matières de la maquette. Les
                      notes détaillées concernent uniquement vos évaluations.
                    </p>

                    <div className="notes-table-container resultats-prof-table-container">
                      <table className="notes-table resultats-prof-table">
                        <thead>
                          <tr>
                            <th>Rang</th>
                            <th>Élève</th>

                            {(donneesResultatsProf.matieres || []).map(
                              (matiere) => (
                                <th key={matiere.id}>{matiere.libelle}</th>
                              ),
                            )}

                            <th>Total points</th>
                            <th>Moyenne générale</th>

                            {afficherEvaluationsProf &&
                              (donneesResultatsProf.evaluations || []).map(
                                (evaluation) => (
                                  <th key={evaluation.id}>
                                    {evaluation.libelle}
                                    <small className="resultats-prof-sous-titre">
                                      {evaluation.matiere} / {evaluation.bareme}
                                    </small>
                                  </th>
                                ),
                              )}
                          </tr>
                        </thead>

                        <tbody>
                          {(donneesResultatsProf.eleves || []).map(
                            (eleve, index) => (
                              <tr key={eleve.id}>
                                <td>{eleve.rang ?? "—"}</td>

                                <td className="notes-eleve-identite">
                                  <strong>
                                    {eleve.nom} {eleve.prenoms}
                                  </strong>
                                  <small>
                                    {eleve.matricule || eleve.code_eleve || ""}
                                  </small>
                                </td>

                                {(donneesResultatsProf.matieres || []).map(
                                  (matiere) => {
                                    const resultatMatiere = (
                                      eleve.moyennes_matieres || []
                                    ).find(
                                      (item) =>
                                        Number(item.matiere_id) ===
                                        Number(matiere.id),
                                    );

                                    return (
                                      <td key={matiere.id}>
                                        {resultatMatiere?.moyenne != null
                                          ? Number(
                                              resultatMatiere.moyenne,
                                            ).toFixed(2)
                                          : "—"}
                                      </td>
                                    );
                                  },
                                )}

                                <td>
                                  {Number(eleve.total_points || 0).toFixed(2)}
                                </td>

                                <td className="resultats-prof-moyenne">
                                  {eleve.moyenne_generale != null
                                    ? Number(eleve.moyenne_generale).toFixed(2)
                                    : "—"}
                                </td>

                                {afficherEvaluationsProf &&
                                  (donneesResultatsProf.evaluations || []).map(
                                    (evaluation) => {
                                      const note =
                                        eleve.notes_evaluations?.[
                                          evaluation.id
                                        ];

                                      return (
                                        <td key={evaluation.id}>
                                          {note?.absent
                                            ? "ABS"
                                            : note?.note != null
                                              ? Number(note.note).toFixed(2)
                                              : "—"}
                                        </td>
                                      );
                                    },
                                  )}
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : null}
              </div>
            </section>
          )}

          {activePage !== "dashboard" &&
            activePage !== "profil" &&
            activePage !== "eleves" &&
            activePage !== "emploi" &&
            activePage !== "notes" &&
            activePage !== "resultats" && (
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
        {["dashboard", "eleves", "emploi", "resultats", "profil"]
          .map((id) => MODULES.find((module) => module.id === id))
          .filter((module) => module && module.roles.includes(userRole))
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
