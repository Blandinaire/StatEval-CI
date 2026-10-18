import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Send,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const JOURS = [
    { key: "lundi", label: "Lundi" },
    { key: "mardi", label: "Mardi" },
    { key: "mercredi", label: "Mercredi" },
    { key: "jeudi", label: "Jeudi" },
    { key: "vendredi", label: "Vendredi" },
];

const nouvelleLigne = {
    jour: "lundi",
    creneau_horaire_id: "",
    classe_id: "",
    classe_ids: [],
    matiere_id: "",
    ligne_id: "",
    groupe: "",
    activite: "",
    enseignant_id: "",
    educateur_id: "",
    salle_id: "",
    double_creneau: false,
};

const nouveauCreneau = {
    libelle: "Cours",
    type: "cours",
    heure_debut: "07:30",
    heure_fin: "08:30",
    ordre: "1",
};

function CoursCarte({
    ligne,
    jour,
    creneau,
    classe,
    affichageEnseignant,
    deplacable,
    editable,
    coursDeplace,
    commencerDeplacement,
    terminerDeplacement,
    ouvrirCours,
    supprimerCours,
}) {
    const matiere = ligne?.matiere?.parent ?? ligne?.matiere;
    const activites = {
        HE: "Heure d'étude (HE)",
        CDI: "Bibliothèque (CDI)",
        DN: "Devoirs de Niveau (DN)",
    };
    const couleur = /^#[\da-f]{6}$/i.test(matiere?.couleur ?? "")
        ? matiere.couleur
        : "#0f766e";
    const personne = ligne?.enseignant ?? ligne?.educateur;
    const premierPrenom = personne?.prenoms?.trim().split(/\s+/)[0];
    const nomSalle = ligne.salle_associee?.nom ?? ligne.salle;

    return (
        <article
            draggable={deplacable}
            onDragStart={deplacable ? (event) => commencerDeplacement(event, ligne) : undefined}
            onDragEnd={deplacable ? terminerDeplacement : undefined}
            className={`group relative min-h-16 border-l-2 p-1 transition sm:min-h-20 sm:border-l-4 sm:p-2.5 ${
                coursDeplace?.id === ligne.id
                    ? "scale-[0.98] opacity-40"
                    : "hover:shadow-sm"
            }`}
            style={{
                borderLeftColor: couleur,
                backgroundColor: `color-mix(in srgb, ${couleur} 13%, white)`,
            }}
        >
            <h3 className="truncate pr-5 text-[11px] font-bold leading-tight text-gray-900 lg:hidden">
                {ligne.activite
                    ? ligne.activite
                    : (matiere?.code ?? matiere?.libelle ?? "Matière")}
            </h3>
            <h3 className="hidden pr-12 text-sm font-bold leading-snug text-gray-900 lg:block">
                {activites[ligne.activite] ?? matiere?.libelle ?? "Matière"}
            </h3>

            {ligne.groupe && (
                <p className="mt-0.5 truncate text-[9px] font-semibold leading-tight text-teal-800 sm:mt-1 sm:text-[10px]">
                    {ligne.groupe}
                </p>
            )}

            {affichageEnseignant && (
                <p className="mt-0.5 truncate text-[9px] font-semibold leading-tight text-gray-700 sm:mt-1 sm:text-xs">
                    {ligne.classe?.libelle ?? classe?.libelle ?? "Classe"}
                </p>
            )}

            {ligne.bloc_id && (
                <span className="mt-0.5 inline-block rounded bg-white/80 px-1 py-0.5 text-[9px] font-semibold text-teal-800 sm:mt-1 sm:px-1.5 sm:text-[10px]">
                    2 créneaux
                </span>
            )}

            {personne && (
                <p className="mt-0.5 whitespace-normal break-words text-[9px] leading-tight text-gray-600 sm:mt-1 sm:text-xs">
                    {personne.nom}{" "}
                    <span className="sm:hidden">{premierPrenom}</span>
                    <span className="hidden sm:inline">{personne.prenoms}</span>
                </p>
            )}

            {nomSalle && (
                <p className="mt-0.5 truncate text-[9px] leading-tight text-gray-500 sm:mt-1 sm:text-xs">
                    <span className="sm:hidden">{nomSalle}</span>
                    <span className="hidden sm:inline">Salle {nomSalle}</span>
                </p>
            )}

            {editable && (
            <div className="absolute right-0 top-0 flex opacity-100 transition sm:right-1 sm:top-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                <button
                    type="button"
                    title="Modifier le cours"
                    onClick={() => ouvrirCours(jour, creneau, classe, ligne)}
                    className="rounded p-1 text-gray-600 hover:bg-white hover:text-teal-800 sm:p-1.5"
                >
                    <Pencil size={14} />
                </button>
                <button
                    type="button"
                    title="Supprimer le cours"
                    onClick={() => supprimerCours(ligne)}
                    className="rounded p-1 text-gray-600 hover:bg-white hover:text-red-700 sm:p-1.5"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            )}
        </article>
    );
}

export default function Index({
    annees = [],
    classes = [],
    enseignants = [],
    creneaux = [],
    emploi = null,
    salles = [],
    matieresParClasse = {},
    enseignantsParClasseMatiere = {},
    educateursParClasse = {},
    etablissements = [],
    etablissement = null,
    isSuperAdmin = false,
    consultationSeule = false,
    modeConsultation = null,
    filtres = {},
}) {
    const [coursModal, setCoursModal] = useState(null);
    const [horairesOuverts, setHorairesOuverts] = useState(false);
    const [creneauModal, setCreneauModal] = useState(null);
    const [cours, setCours] = useState(nouvelleLigne);
    const [creneauForm, setCreneauForm] = useState(nouveauCreneau);
    const [erreur, setErreur] = useState("");
    const [modeVue, setModeVue] = useState(
        modeConsultation ?? "toutes-classes",
    );
    const [jourActif, setJourActif] = useState("lundi");
    const [classeSelectionnee, setClasseSelectionnee] = useState("");
    const [enseignantSelectionne, setEnseignantSelectionne] = useState("");

    const [classesOrdonnees, setClassesOrdonnees] = useState(classes);
    const [organisationClasses, setOrganisationClasses] = useState(false);
    const [ordreClassesModifie, setOrdreClassesModifie] = useState(false);

    const [coursDeplace, setCoursDeplace] = useState(null);
    const [celluleSurvolee, setCelluleSurvolee] = useState(null);

    useEffect(() => {
        if (!organisationClasses || !ordreClassesModifie) {
            setClassesOrdonnees(classes);
        }
    }, [classes, organisationClasses, ordreClassesModifie]);

    useEffect(() => {
        if (!classes.some((classe) => String(classe.id) === classeSelectionnee)) {
            setClasseSelectionnee(classes[0] ? String(classes[0].id) : "");
        }
    }, [classes, classeSelectionnee]);

    useEffect(() => {
        if (
            !enseignants.some(
                (enseignant) => String(enseignant.id) === enseignantSelectionne,
            )
        ) {
            setEnseignantSelectionne(
                enseignants[0] ? String(enseignants[0].id) : "",
            );
        }
    }, [enseignants, enseignantSelectionne]);

    useEffect(() => {
        if (!cours.matiere_id) {
            return;
        }

        const classeIds =
            cours.classe_ids?.length > 0
                ? cours.classe_ids
                : coursModal?.classe?.id
                  ? [String(coursModal.classe.id)]
                  : [];

        if (classeIds.length === 0) {
            return;
        }

        // ============================================================
        // ENSEIGNANT AUTOMATIQUE
        // ============================================================

        const enseignantsParClasse = classeIds.map((classeId) => {
            return (
                enseignantsParClasseMatiere?.[classeId]?.[cours.matiere_id] ??
                []
            );
        });

        let enseignantsCommuns = [];

        if (
            enseignantsParClasse.length > 0 &&
            enseignantsParClasse.every((liste) => liste.length > 0)
        ) {
            enseignantsCommuns = enseignantsParClasse[0].filter((enseignant) =>
                enseignantsParClasse.every((liste) =>
                    liste.some(
                        (item) => Number(item.id) === Number(enseignant.id),
                    ),
                ),
            );
        }

        // Un seul enseignant commun = sélection automatique
        if (enseignantsCommuns.length === 1) {
            setCours((ancien) => ({
                ...ancien,
                enseignant_id: String(enseignantsCommuns[0].id),
            }));
        }

        // ============================================================
        // SALLE PAR DÉFAUT
        // ============================================================

        const sallesParDefaut = classeIds
            .map((classeId) => {
                const classe = classesOrdonnees.find(
                    (item) => String(item.id) === String(classeId),
                );

                return classe?.salle_id ? String(classe.salle_id) : "";
            })
            .filter(Boolean);

        const sallesUniques = [...new Set(sallesParDefaut)];

        // Une seule salle par défaut commune
        if (sallesUniques.length === 1) {
            setCours((ancien) => ({
                ...ancien,
                salle_id: sallesUniques[0],
            }));
        } else if (sallesUniques.length > 1) {
            // Les classes ont des salles différentes :
            // aucun choix automatique.
            setCours((ancien) => ({
                ...ancien,
                salle_id: "",
            }));
        } else {
            // Aucune salle par défaut
            setCours((ancien) => ({
                ...ancien,
                salle_id: "",
            }));
        }
    }, [
        cours.matiere_id,
        cours.classe_ids,
        coursModal?.classe?.id,
        enseignantsParClasseMatiere,
        classesOrdonnees,
    ]);

    const annee = annees.find(
        (item) => Number(item.id) === Number(filtres.annee_scolaire_id),
    );

    const grille = useMemo(() => {
        const result = new Map();

        (emploi?.lignes ?? [])
            .filter((ligne) =>
                modeVue === "enseignant"
                    ? Number(ligne.enseignant_id) === Number(enseignantSelectionne)
                    : modeVue === "toutes-classes" ||
                      Number(ligne.classe_id) === Number(classeSelectionnee),
            )
            .forEach((ligne) => {
                const cible =
                    modeVue === "enseignant"
                        ? "enseignant"
                        : modeVue === "toutes-classes"
                          ? ligne.classe_id
                          : ligne.classe_id;
                const cle = `${ligne.jour}:${ligne.creneau_horaire_id}:${cible}`;
                const lignesCellule = result.get(cle) ?? [];
                lignesCellule.push(ligne);
                result.set(cle, lignesCellule);
            });

        return result;
    }, [
        emploi?.lignes,
        modeVue,
        classeSelectionnee,
        enseignantSelectionne,
    ]);

    const classesAffichees = useMemo(() => {
        if (modeVue === "enseignant") {
            const enseignant = enseignants.find(
                (item) => String(item.id) === enseignantSelectionne,
            );
            return enseignant
                ? [{
                      id: "enseignant",
                      libelle: `${enseignant.nom} ${enseignant.prenoms}`,
                      niveau: { libelle: "Enseignant" },
                  }]
                : [];
        }

        if (modeVue === "toutes-classes") {
            return classesOrdonnees;
        }

        return classesOrdonnees.filter(
            (classe) => String(classe.id) === classeSelectionnee,
        );
    }, [
        modeVue,
        enseignants,
        enseignantSelectionne,
        classesOrdonnees,
        classeSelectionnee,
    ]);

    const matieresClasse = useMemo(() => {
        const classeIds =
            cours.classe_ids?.length > 0
                ? cours.classe_ids
                : coursModal?.classe?.id
                  ? [String(coursModal.classe.id)]
                  : [];

        if (classeIds.length === 0) {
            return [];
        }

        const listes = classeIds.map(
            (classeId) => matieresParClasse[classeId] ?? [],
        );

        if (listes.some((liste) => liste.length === 0)) {
            return [];
        }

        const premiereListe = listes[0];

        return premiereListe
            .filter((matiere) =>
                listes.every((liste) =>
                    liste.some((item) => item.id === matiere.id),
                ),
            )
            .sort((a, b) => a.libelle.localeCompare(b.libelle));
    }, [cours.classe_ids, coursModal?.classe?.id, matieresParClasse]);
    const enseignantsCours =
        enseignantsParClasseMatiere[cours.classe_id]?.[cours.matiere_id] ?? [];
    const creneauDoubleDisponible = useMemo(() => {
        const courant = creneaux.find(
            (item) =>
                Number(item.id) === Number(cours.creneau_horaire_id),
        );
        return Boolean(
            courant &&
                creneaux.some(
                    (item) =>
                        item.heure_debut === courant.heure_fin &&
                        item.type !== "pause" &&
                        !/pause|récré|recre/i.test(item.libelle ?? ""),
                ),
        );
    }, [creneaux, cours.creneau_horaire_id]);
    const matiereDoubleAutorisee = useMemo(() => {
        const classeIds = cours.classe_ids?.length
            ? cours.classe_ids
            : coursModal?.classe?.id
              ? [String(coursModal.classe.id)]
              : [];
        return (
            Boolean(cours.matiere_id) &&
            classeIds.length > 0 &&
            classeIds.every((classeId) =>
                (matieresParClasse[classeId] ?? []).some(
                    (matiere) =>
                        Number(matiere.id) === Number(cours.matiere_id) &&
                        Number(matiere.volume_horaire) >= 2,
                ),
            )
        );
    }, [
        cours.classe_ids,
        cours.matiere_id,
        coursModal?.classe?.id,
        matieresParClasse,
    ]);
    const educateursCours = useMemo(() => {
        const classeIds = cours.classe_ids?.length
            ? cours.classe_ids
            : coursModal?.classe?.id
              ? [String(coursModal.classe.id)]
              : [];
        if (!classeIds.length) return [];

        const listes = classeIds.map((id) => educateursParClasse[id] ?? []);
        if (listes.some((liste) => liste.length === 0)) return [];

        return listes[0].filter((educateur) =>
            listes.every((liste) =>
                liste.some((item) => Number(item.id) === Number(educateur.id)),
            ),
        );
    }, [cours.classe_ids, coursModal?.classe?.id, educateursParClasse]);

    useEffect(() => {
        if (!cours.activite) return;
        if (educateursCours.length === 1) {
            setCours((ancien) => ({
                ...ancien,
                educateur_id: String(educateursCours[0].id),
            }));
        } else if (
            cours.educateur_id &&
            !educateursCours.some(
                (educateur) =>
                    String(educateur.id) === String(cours.educateur_id),
            )
        ) {
            setCours((ancien) => ({ ...ancien, educateur_id: "" }));
        }
    }, [cours.activite, cours.educateur_id, educateursCours]);
    function commencerOrganisationClasses() {
        setClassesOrdonnees([...classes]);
        setOrdreClassesModifie(false);
        setOrganisationClasses(true);
        setErreur("");
    }

    function deplacerClasse(index, direction) {
        const prochaineListe = [...classesOrdonnees];
        const cible = index + direction;

        if (cible < 0 || cible >= prochaineListe.length) {
            return;
        }

        [prochaineListe[index], prochaineListe[cible]] = [
            prochaineListe[cible],
            prochaineListe[index],
        ];

        setClassesOrdonnees(prochaineListe);
        setOrdreClassesModifie(true);
    }

    function annulerOrganisationClasses() {
        setClassesOrdonnees([...classes]);
        setOrdreClassesModifie(false);
        setOrganisationClasses(false);
        setErreur("");
    }

    function validerOrdreClasses() {
        if (!emploi?.id || !ordreClassesModifie) {
            return;
        }

        setErreur("");

        router.patch(
            route("emplois-du-temps.classes.reordonner", emploi.id),
            {
                ordre_classes: classesOrdonnees.map((classe) => classe.id),
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setOrganisationClasses(false);
                    setOrdreClassesModifie(false);
                },

                onError: (errors) => {
                    setErreur(
                        Object.values(errors)[0] ??
                            "Impossible d'enregistrer l'ordre des classes.",
                    );
                },
            },
        );
    }

    function filtrer(champ, valeur) {
        const params = {
            etablissement_id:
                champ === "etablissement_id"
                    ? valeur
                    : (filtres.etablissement_id ?? ""),
            annee_scolaire_id:
                champ === "annee_scolaire_id"
                    ? valeur
                    : (filtres.annee_scolaire_id ?? ""),
        };

        router.get(route("emplois-du-temps.index"), params, {
            preserveScroll: true,
            replace: true,
        });
    }

    function creerEmploi() {
        setErreur("");
        router.post(
            route("emplois-du-temps.creer"),
            {
                etablissement_id: filtres.etablissement_id,
                annee_scolaire_id: filtres.annee_scolaire_id,
            },
            {
                preserveScroll: true,
                onError: (errors) =>
                    setErreur(
                        Object.values(errors)[0] ?? "Création impossible.",
                    ),
            },
        );
    }

    function ouvrirCours(jour, creneau, classe, ligne = null) {
        setErreur("");

        const lignesBloc = ligne?.bloc_id
            ? (emploi?.lignes ?? []).filter(
                  (item) => item.bloc_id === ligne.bloc_id,
              )
            : [];
        const ligneEdition =
            lignesBloc.length > 0
                ? [...lignesBloc].sort((a, b) => {
                      const horaireA =
                          creneaux.find(
                              (item) =>
                                  Number(item.id) ===
                                  Number(a.creneau_horaire_id),
                          )?.heure_debut ?? "";
                      const horaireB =
                          creneaux.find(
                              (item) =>
                                  Number(item.id) ===
                                  Number(b.creneau_horaire_id),
                          )?.heure_debut ?? "";
                      return horaireA.localeCompare(horaireB);
                  })[0]
                : ligne;
        const creneauEdition = ligneEdition
            ? (creneaux.find(
                  (item) =>
                      Number(item.id) ===
                      Number(ligneEdition.creneau_horaire_id),
              ) ?? creneau)
            : creneau;
        const classesDuCours =
            ligneEdition?.regroupement_id && emploi?.lignes
                ? emploi.lignes
                      .filter(
                          (item) =>
                              item.regroupement_id ===
                              ligneEdition.regroupement_id,
                      )
                      .map((item) => String(item.classe_id))
                : [String(classe.id)];

        const classesUniques = [...new Set(classesDuCours)];

        setCours({
            jour,
            creneau_horaire_id: String(creneauEdition.id),
            classe_id: String(classe.id),
            classe_ids: classesUniques,
            ligne_id: ligneEdition?.id ? String(ligneEdition.id) : "",
            groupe: ligneEdition?.groupe ?? "",
            matiere_id: ligneEdition?.matiere_id
                ? String(
                      ligneEdition.matiere?.matiere_parent_id ??
                          ligneEdition.matiere_id,
                  )
                : "",
            activite: ligneEdition?.activite ?? "",
            enseignant_id: ligneEdition?.enseignant_id
                ? String(ligneEdition.enseignant_id)
                : "",
            educateur_id: ligneEdition?.educateur_id
                ? String(ligneEdition.educateur_id)
                : "",
            salle_id: ligneEdition?.salle_id
                ? String(ligneEdition.salle_id)
                : "",
            double_creneau: Boolean(ligneEdition?.bloc_id),
        });

        setCoursModal({
            jour,
            creneau: creneauEdition,
            classe,
            ligne: ligneEdition,
            classeIds: classesUniques,
            groupe: classesUniques.length > 1 ? classesUniques : null,
        });
    }

    function enregistrerCours(event) {
        event.preventDefault();

        if (!emploi?.id) {
            return;
        }

        const classeIds = [
            ...new Set(
                (cours.classe_ids ?? [])
                    .filter(Boolean)
                    .map((id) => Number(id)),
            ),
        ];

        if (classeIds.length === 0 && cours.classe_id) {
            classeIds.push(Number(cours.classe_id));
        }

        if (classeIds.length === 0) {
            setErreur("Sélectionnez au moins une classe.");
            return;
        }

        router.post(
            route("emplois-du-temps.ligne.enregistrer"),
            {
                emploi_du_temps_id: emploi.id,
                jour: cours.jour,
                creneau_horaire_id: cours.creneau_horaire_id,
                classe_id: classeIds[0],
                classe_ids: classeIds,
                ligne_id: cours.ligne_id || null,
                groupe: cours.groupe.trim() || null,
                matiere_id: cours.activite ? null : cours.matiere_id,
                activite: cours.activite || null,
                enseignant_id: cours.enseignant_id || null,
                educateur_id: cours.activite
                    ? cours.educateur_id || null
                    : null,
                double_creneau: cours.double_creneau,
                salle_id: cours.salle_id || null,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setCoursModal(null);
                },

                onError: (errors) => {
                    setErreur(
                        Object.values(errors)[0] ??
                            "Enregistrement impossible.",
                    );
                },
            },
        );
    }

    function supprimerCours(ligne) {
        if (!confirm("Supprimer ce cours de l’emploi du temps ?")) return;

        router.delete(route("emplois-du-temps.ligne.supprimer", ligne.id), {
            preserveScroll: true,
        });
    }

    function commencerDeplacement(event, ligne) {
        event.dataTransfer.effectAllowed = "move";

        event.dataTransfer.setData("text/plain", String(ligne.id));

        setCoursDeplace(ligne);
    }

    function terminerDeplacement() {
        setCoursDeplace(null);
        setCelluleSurvolee(null);
    }

    function survolerCellule(event, jour, creneau) {
        if (!coursDeplace) {
            return;
        }

        if (pause(creneau)) {
            return;
        }

        event.preventDefault();

        event.dataTransfer.dropEffect = "move";

        setCelluleSurvolee({
            jour,
            creneauId: creneau.id,
        });
    }

    function quitterCellule(event) {
        /*
         * Évite les clignotements lorsque le curseur passe
         * entre les éléments enfants de la cellule.
         */
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setCelluleSurvolee(null);
        }
    }

    function deposerCours(event, jour, creneau) {
        event.preventDefault();

        if (!coursDeplace) {
            return;
        }

        if (pause(creneau)) {
            terminerDeplacement();
            return;
        }

        /*
         * Si le cours est déjà exactement à cet emplacement,
         * inutile d'envoyer une requête.
         */
        if (
            coursDeplace.jour === jour &&
            Number(coursDeplace.creneau_horaire_id) === Number(creneau.id)
        ) {
            terminerDeplacement();
            return;
        }

        setErreur("");

        router.patch(
            route("emplois-du-temps.ligne.deplacer", coursDeplace.id),
            {
                jour,
                creneau_horaire_id: creneau.id,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    terminerDeplacement();
                },

                onError: (errors) => {
                    setErreur(
                        Object.values(errors)[0] ??
                            "Impossible de déplacer ce cours.",
                    );

                    terminerDeplacement();
                },

                onFinish: () => {
                    setCoursDeplace(null);
                },
            },
        );
    }

    function ouvrirCreneau(creneau = null) {
        setErreur("");
        setCreneauForm(
            creneau
                ? {
                      id: creneau.id,
                      libelle: creneau.libelle,
                      type:
                          creneau.type ??
                          (/pause|récré|recre/i.test(creneau.libelle ?? "")
                              ? "pause"
                              : "cours"),
                      heure_debut: creneau.heure_debut?.slice(0, 5) ?? "",
                      heure_fin: creneau.heure_fin?.slice(0, 5) ?? "",
                      ordre: String(creneau.ordre),
                  }
                : { ...nouveauCreneau, ordre: String(creneaux.length + 1) },
        );
        setCreneauModal(true);
    }

    function enregistrerCreneau(event) {
        event.preventDefault();
        const edition = Boolean(creneauForm.id);
        const options = {
            preserveScroll: true,
            onSuccess: () => setCreneauModal(null),
            onError: (errors) =>
                setErreur(
                    Object.values(errors)[0] ?? "Enregistrement impossible.",
                ),
        };
        const donnees = {
            ...creneauForm,
            etablissement_id: filtres.etablissement_id,
        };

        if (edition) {
            router.put(
                route("creneaux-horaires.update", creneauForm.id),
                donnees,
                options,
            );
        } else {
            router.post(route("creneaux-horaires.store"), donnees, options);
        }
    }

    function supprimerCreneau(creneau) {
        if (!confirm(`Supprimer le créneau « ${creneau.libelle} » ?`)) return;

        router.delete(route("creneaux-horaires.destroy", creneau.id), {
            preserveScroll: true,
        });
    }

    function basculerCreneau(creneau) {
        const action = creneau.actif ? "désactiver" : "activer";

        if (
            !confirm(
                `Voulez-vous ${action} le créneau « ${creneau.libelle} » ?`,
            )
        ) {
            return;
        }

        router.patch(
            route("creneaux-horaires.toggle", creneau.id),
            {},
            {
                preserveScroll: true,
            },
        );
    }

    const selectionComplete = Boolean(
        filtres.etablissement_id && filtres.annee_scolaire_id,
    );
    const isEducateurConsultation =
        consultationSeule && modeConsultation === "toutes-classes";
    const pause = (creneau) =>
        creneau.type === "pause" ||
        /pause|récré|recre/i.test(creneau.libelle ?? "");
    const classeActive = classes.find(
        (classe) => String(classe.id) === classeSelectionnee,
    );

    function rendreCellule(jour, creneau, classe = null) {
        const cible =
            modeVue === "enseignant"
                ? "enseignant"
                : modeVue === "toutes-classes"
                  ? classe?.id
                  : classeSelectionnee;
        const lignes = [...(grille.get(`${jour.key}:${creneau.id}:${cible}`) ?? [])];
        const classeCours = classe ?? classeActive;

        return (
            <td
                key={classe?.id ?? jour.key}
                onDragOver={
                    modeVue === "toutes-classes" && !consultationSeule
                        ? (event) => survolerCellule(event, jour.key, creneau)
                        : undefined
                }
                onDrop={
                    modeVue === "toutes-classes" && !consultationSeule
                        ? (event) => deposerCours(event, jour.key, creneau)
                        : undefined
                }
                onDragLeave={quitterCellule}
                className={`h-20 border-b border-r border-gray-200 p-1 align-top transition last:border-r-0 sm:h-24 sm:p-1.5 ${
                    celluleSurvolee?.jour === jour.key &&
                    Number(celluleSurvolee?.creneauId) === Number(creneau.id)
                        ? "bg-teal-50 ring-2 ring-inset ring-teal-500"
                        : ""
                }`}
            >
                {lignes.length > 0 ? (
                    <div className="flex h-full flex-col gap-1">
                        {lignes.map((ligne) => (
                            <CoursCarte
                                key={ligne.id}
                                ligne={ligne}
                                jour={jour.key}
                                creneau={creneau}
                                classe={
                                    classes.find(
                                        (item) =>
                                            Number(item.id) ===
                                            Number(ligne.classe_id),
                                    ) ?? ligne.classe
                                }
                                affichageEnseignant={modeVue === "enseignant"}
                                deplacable={
                                    modeVue === "toutes-classes" &&
                                    !consultationSeule
                                }
                                editable={
                                    modeVue === "toutes-classes" &&
                                    !consultationSeule
                                }
                                coursDeplace={coursDeplace}
                                commencerDeplacement={commencerDeplacement}
                                terminerDeplacement={terminerDeplacement}
                                ouvrirCours={ouvrirCours}
                                supprimerCours={supprimerCours}
                            />
                        ))}
                        {modeVue === "toutes-classes" &&
                            !consultationSeule && (
                            <button
                                type="button"
                                onClick={() =>
                                    ouvrirCours(jour.key, creneau, classeCours)
                                }
                                className="flex min-h-6 w-full items-center justify-center gap-1 rounded border border-dashed border-gray-300 text-gray-500 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                                title={`Ajouter un cours pour un autre groupe de ${classeCours?.libelle ?? "la classe"}`}
                            >
                                <Plus size={14} />
                                <span className="hidden text-[10px] font-medium sm:inline">
                                    Autre groupe
                                </span>
                            </button>
                        )}
                    </div>
                ) : modeVue === "toutes-classes" &&
                  !consultationSeule ? (
                    <button
                        type="button"
                        onClick={() =>
                            ouvrirCours(jour.key, creneau, classeCours)
                        }
                        className={`flex h-full min-h-16 w-full items-center justify-center border border-dashed transition sm:min-h-20 ${
                            celluleSurvolee?.jour === jour.key &&
                            Number(celluleSurvolee?.creneauId) ===
                                Number(creneau.id)
                                ? "border-teal-500 bg-teal-50 text-teal-700"
                                : "border-gray-200 text-gray-300 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                        }`}
                        title={`Ajouter un cours pour ${classeCours?.libelle ?? "la classe"}`}
                    >
                        <Plus size={18} />
                    </button>
                ) : null}
            </td>
        );
    }

    function publierEmploi() {
        if (!emploi?.id) {
            return;
        }

        if (
            !confirm(
                "Voulez-vous publier cet emploi du temps ?\n\nAprès publication, les modifications seront verrouillées.",
            )
        ) {
            return;
        }

        setErreur("");

        router.patch(
            route("emplois-du-temps.publier", emploi.id),
            {},
            {
                preserveScroll: true,

                onError: (errors) => {
                    setErreur(
                        Object.values(errors)[0] ??
                            "Impossible de publier l'emploi du temps.",
                    );
                },
            },
        );
    }

    function depublierEmploi() {
        if (!emploi?.id) {
            return;
        }

        if (
            !confirm(
                "Voulez-vous repasser cet emploi du temps en brouillon ?\n\nIl pourra alors être modifié à nouveau.",
            )
        ) {
            return;
        }

        setErreur("");

        router.patch(
            route("emplois-du-temps.depublier", emploi.id),
            {},
            {
                preserveScroll: true,

                onError: (errors) => {
                    setErreur(
                        Object.values(errors)[0] ??
                            "Impossible de repasser l'emploi du temps en brouillon.",
                    );
                },
            },
        );
    }

    return (
        <AdminLayout>
            <Head title="Emploi du temps hebdomadaire" />

            <div className="mx-auto max-w-[1800px] space-y-5">
                <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase text-teal-700">
                            Organisation scolaire
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            Emploi du temps — Semaine
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {etablissement?.nom ??
                                "Sélectionnez un établissement"}
                            {annee?.libelle
                                ? ` · Année scolaire ${annee.libelle}`
                                : ""}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {selectionComplete && !consultationSeule && (
                            <button
                                type="button"
                                onClick={() =>
                                    setHorairesOuverts((value) => !value)
                                }
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                <Clock3 size={16} />
                                Horaires ({creneaux.length})
                            </button>
                        )}
                        {selectionComplete && !emploi && !consultationSeule && (
                            <button
                                type="button"
                                onClick={creerEmploi}
                                className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                            >
                                <Plus size={17} /> Créer le planning
                            </button>
                        )}
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {isSuperAdmin && (
                        <label className="text-sm font-semibold text-gray-700">
                            Établissement
                            <select
                                value={filtres.etablissement_id ?? ""}
                                onChange={(event) =>
                                    filtrer(
                                        "etablissement_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-sm"
                            >
                                <option value="">
                                    Choisir un établissement
                                </option>
                                {etablissements.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nom}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <label className="text-sm font-semibold text-gray-700">
                        Année scolaire
                        <select
                            value={filtres.annee_scolaire_id ?? ""}
                            onChange={(event) =>
                                filtrer("annee_scolaire_id", event.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-sm"
                        >
                            <option value="">Choisir une année</option>
                            {annees.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>
                    </label>
                </section>

                {selectionComplete && consultationSeule && (
                    <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        {modeConsultation === "enseignant"
                            ? "Consultation de votre emploi du temps personnel."
                            : modeVue === "classe"
                              ? `Consultation de l’emploi du temps de ${classeActive?.libelle ?? "la classe sélectionnée"}.`
                              : "Consultation de l’emploi du temps de toutes les classes."}
                        {" "}Cette vue est en lecture seule.
                    </p>
                )}

                {selectionComplete &&
                    (!consultationSeule || isEducateurConsultation) && (
                    <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-end">
                        <label className="text-sm font-semibold text-gray-700 sm:w-56">
                            Vue de l’emploi du temps
                            <select
                                value={modeVue}
                                onChange={(event) => setModeVue(event.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-sm"
                            >
                                <option value="classe">Par classe</option>
                                <option value="toutes-classes">
                                    Vue globale — toutes les classes
                                </option>
                                {!isEducateurConsultation && (
                                    <option value="enseignant">
                                        Par enseignant
                                    </option>
                                )}
                            </select>
                        </label>
                        {modeVue === "classe" ? (
                            <label className="text-sm font-semibold text-gray-700 sm:w-72">
                                Classe
                                <select
                                    value={classeSelectionnee}
                                    onChange={(event) => setClasseSelectionnee(event.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white text-sm"
                                    disabled={classes.length === 0}
                                >
                                    {classes.length === 0 ? (
                                        <option value="">Aucune classe</option>
                                    ) : (
                                        classes.map((classe) => (
                                            <option key={classe.id} value={classe.id}>
                                                {classe.libelle}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </label>
                        ) : modeVue === "enseignant" ? (
                            <label className="text-sm font-semibold text-gray-700 sm:w-72">
                                Enseignant
                                <select
                                    value={enseignantSelectionne}
                                    onChange={(event) => setEnseignantSelectionne(event.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white text-sm"
                                    disabled={enseignants.length === 0}
                                >
                                    {enseignants.length === 0 ? (
                                        <option value="">Aucun enseignant actif</option>
                                    ) : (
                                        enseignants.map((enseignant) => (
                                            <option key={enseignant.id} value={enseignant.id}>
                                                {enseignant.nom} {enseignant.prenoms}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </label>
                        ) : (
                            <p className="pb-2 text-sm text-gray-600">
                                Choisissez un jour, puis modifiez le planning dans la grille des classes.
                            </p>
                        )}
                    </section>
                    )}

                {horairesOuverts && selectionComplete && !consultationSeule && (
                    <section className="border-y border-gray-200 py-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-gray-900">
                                    Créneaux et pauses
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Définissez l’ordre et les heures affichées
                                    sur le planning mural.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => ouvrirCreneau()}
                                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-teal-700 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                            >
                                <Plus size={16} /> Ajouter
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100 border-y border-gray-200">
                            {creneaux.length === 0 ? (
                                <p className="py-5 text-sm text-gray-500">
                                    Aucun horaire défini. Ajoutez les périodes
                                    de cours et les pauses.
                                </p>
                            ) : (
                                creneaux.map((creneau) => (
                                    <div
                                        key={creneau.id}
                                        className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-b-0"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-gray-800">
                                                {creneau.libelle}
                                            </span>

                                            <span className="text-sm tabular-nums text-gray-500">
                                                {creneau.heure_debut?.slice(
                                                    0,
                                                    5,
                                                )}
                                                –
                                                {creneau.heure_fin?.slice(0, 5)}
                                            </span>

                                            <span className="text-xs text-gray-400">
                                                Ordre {creneau.ordre}
                                            </span>

                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                    creneau.actif
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {creneau.actif
                                                    ? "Actif"
                                                    : "Désactivé"}
                                            </span>

                                            {creneau.type === "pause" && (
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                                    Pause
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Modifier */}
                                            <button
                                                type="button"
                                                title="Modifier l’horaire"
                                                onClick={() =>
                                                    ouvrirCreneau(creneau)
                                                }
                                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-teal-800"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            {/* Activer / Désactiver */}
                                            <button
                                                type="button"
                                                title={
                                                    creneau.actif
                                                        ? "Désactiver l’horaire"
                                                        : "Activer l’horaire"
                                                }
                                                onClick={() =>
                                                    basculerCreneau(creneau)
                                                }
                                                className={`rounded-lg p-2 transition ${
                                                    creneau.actif
                                                        ? "text-gray-500 hover:bg-orange-50 hover:text-orange-700"
                                                        : "text-green-600 hover:bg-green-50 hover:text-green-700"
                                                }`}
                                            >
                                                <Power size={16} />
                                            </button>

                                            {/* Supprimer */}
                                            <button
                                                type="button"
                                                title="Supprimer l’horaire"
                                                onClick={() =>
                                                    supprimerCreneau(creneau)
                                                }
                                                className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {selectionComplete && (
                    <>
                        {!consultationSeule && (
                        <div
                            className={`mb-4 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                                emploi?.statut === "publie"
                                    ? "border-green-200 bg-green-50"
                                    : "border-amber-200 bg-amber-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                        emploi?.statut === "publie"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                    {emploi?.statut === "publie" ? (
                                        <Send size={18} />
                                    ) : (
                                        <Pencil size={18} />
                                    )}
                                </div>

                                <div>
                                    <div
                                        className={`text-sm font-bold uppercase ${
                                            emploi?.statut === "publie"
                                                ? "text-green-800"
                                                : "text-amber-800"
                                        }`}
                                    >
                                        {emploi?.statut === "publie"
                                            ? "Emploi du temps publié"
                                            : "Emploi du temps en brouillon"}
                                    </div>

                                    <p className="text-xs text-gray-600">
                                        {emploi?.statut === "publie"
                                            ? "Version officielle — les modifications sont verrouillées."
                                            : "Version de travail — vous pouvez encore modifier l'emploi du temps."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {emploi?.statut === "publie" ? (
                                    <button
                                        type="button"
                                        onClick={depublierEmploi}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                                    >
                                        <RotateCcw size={16} />
                                        Repasser en brouillon
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={publierEmploi}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                                    >
                                        <Send size={16} />
                                        Publier l'emploi du temps
                                    </button>
                                )}
                            </div>
                        </div>
                        )}

                        {modeVue === "toutes-classes" && !consultationSeule && (
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3 shadow-sm">
                            <div>
                                <h3 className="font-semibold text-gray-800">
                                    Ordre des classes
                                </h3>

                                <p className="text-sm text-gray-500">
                                    {organisationClasses
                                        ? "Déplacez les classes puis validez l'ordre de la vue globale."
                                        : "Choisissez l'ordre des classes dans la vue globale."}
                                </p>
                            </div>

                            {!organisationClasses ? (
                                <button
                                    type="button"
                                    onClick={commencerOrganisationClasses}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Organiser les classes
                                </button>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={annulerOrganisationClasses}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        <X className="h-4 w-4" />
                                        Annuler
                                    </button>

                                    <button
                                        type="button"
                                        onClick={validerOrdreClasses}
                                        disabled={!ordreClassesModifie}
                                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        ✓ Valider l'ordre
                                    </button>
                                </div>
                            )}
                            {organisationClasses && (
                                <div className="flex w-full flex-wrap gap-2">
                                    {classesOrdonnees.map((classe, index) => (
                                        <div
                                            key={classe.id}
                                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-700"
                                        >
                                            <span>{classe.libelle}</span>
                                            <button
                                                type="button"
                                                title={`Déplacer ${classe.libelle} à gauche`}
                                                aria-label={`Déplacer ${classe.libelle} à gauche`}
                                                disabled={index === 0}
                                                onClick={() =>
                                                    deplacerClasse(index, -1)
                                                }
                                                className="rounded p-1 text-gray-500 hover:bg-white hover:text-teal-800 disabled:opacity-30"
                                            >
                                                <ChevronLeft size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                title={`Déplacer ${classe.libelle} à droite`}
                                                aria-label={`Déplacer ${classe.libelle} à droite`}
                                                disabled={
                                                    index ===
                                                    classesOrdonnees.length - 1
                                                }
                                                onClick={() =>
                                                    deplacerClasse(index, 1)
                                                }
                                                className="rounded p-1 text-gray-500 hover:bg-white hover:text-teal-800 disabled:opacity-30"
                                            >
                                                <ChevronRight size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        )}
                        {!emploi ? (
                            <div className="border-y border-dashed border-gray-300 py-12 text-center">
                                <CalendarDays
                                    className="mx-auto text-gray-400"
                                    size={28}
                                />
                                <p className="mt-3 font-semibold text-gray-800">
                                    Le planning de cette année n’est pas encore
                                    créé.
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Créez-le, puis ajoutez les créneaux et les
                                    cours par classe.
                                </p>
                            </div>
                        ) : classes.length === 0 ? (
                            <div className="border-y border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
                                Aucune classe n’est enregistrée pour cet
                                établissement et cette année.
                            </div>
                        ) : creneaux.length === 0 ? (
                            <div className="border-y border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
                                Ajoutez d’abord les horaires et pauses pour
                                construire le planning.
                            </div>
                        ) : classesAffichees.length === 0 ? (
                            <div className="border-y border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
                                {modeVue === "enseignant"
                                    ? "Aucun enseignant n’est associé à ce compte."
                                    : "Aucune classe à afficher."}
                            </div>
                        ) : (
                            <div className="overflow-hidden border-y border-gray-200 bg-white">
                                <h2 className="border-b border-gray-200 px-3 py-2 text-sm font-bold text-gray-800">
                                    {modeVue === "enseignant"
                                        ? `Emploi du temps de ${classesAffichees[0].libelle}`
                                        : modeVue === "toutes-classes"
                                          ? "Confection de l’emploi du temps — toutes les classes"
                                          : `Emploi du temps — ${classesAffichees[0].libelle}`}
                                </h2>
                                {modeVue === "toutes-classes" && (
                                    <nav
                                        className="flex gap-1 overflow-x-auto border-b border-gray-200 px-2"
                                        aria-label="Jours de la semaine"
                                    >
                                        {JOURS.map((jour) => (
                                            <button
                                                key={jour.key}
                                                type="button"
                                                onClick={() =>
                                                    setJourActif(jour.key)
                                                }
                                                className={`min-w-24 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                                                    jourActif === jour.key
                                                        ? "border-teal-700 text-teal-800"
                                                        : "border-transparent text-gray-500 hover:text-gray-900"
                                                }`}
                                            >
                                                {jour.label}
                                            </button>
                                        ))}
                                    </nav>
                                )}
                                <div className="overflow-x-auto">
                                    {modeVue === "toutes-classes" ? (
                                        <table
                                            className="w-full table-fixed border-collapse"
                                            style={{
                                                minWidth: `${160 + classesAffichees.length * 144}px`,
                                            }}
                                        >
                                            <colgroup>
                                                <col className="w-28 sm:w-40" />
                                                {classesAffichees.map((classe) => (
                                                    <col
                                                        key={classe.id}
                                                        style={{ width: "9rem" }}
                                                    />
                                                ))}
                                            </colgroup>
                                            <thead>
                                                <tr className="bg-gray-100 text-xs font-bold uppercase text-gray-600">
                                                    <th className="sticky left-0 z-20 w-28 min-w-28 border-b border-r border-gray-200 bg-gray-100 px-2 py-2 text-left sm:w-40 sm:min-w-40 sm:px-4 sm:py-3">
                                                        Horaires
                                                    </th>
                                                    {classesAffichees.map(
                                                        (classe) => (
                                                            <th
                                                                key={classe.id}
                                                                className="border-b border-r border-gray-200 px-2 py-2 text-center last:border-r-0 sm:px-3 sm:py-3"
                                                            >
                                                                <span className="block text-sm font-bold normal-case text-gray-900">
                                                                    {classe.libelle}
                                                                </span>
                                                                <span className="mt-0.5 block text-[10px] font-medium normal-case text-gray-500">
                                                                    {classe.niveau?.libelle ??
                                                                        "Classe"}
                                                                </span>
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {creneaux.map((creneau) => (
                                                    <tr key={creneau.id}>
                                                        <th className="sticky left-0 z-10 w-28 min-w-28 border-b border-r border-gray-200 bg-gray-50 px-2 py-2 text-left align-middle sm:w-40 sm:min-w-40 sm:px-4 sm:py-3">
                                                            <span className="block truncate text-[10px] font-bold uppercase leading-tight text-gray-700 sm:text-xs">
                                                                {creneau.libelle}
                                                            </span>
                                                            <span className="mt-0.5 block whitespace-nowrap text-[10px] font-semibold tabular-nums text-gray-900 sm:mt-1 sm:text-sm">
                                                                {creneau.heure_debut?.slice(0, 5)}–
                                                                {creneau.heure_fin?.slice(0, 5)}
                                                            </span>
                                                        </th>
                                                        {pause(creneau) ? (
                                                            <td
                                                                colSpan={classesAffichees.length}
                                                                className="border-b border-gray-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-800"
                                                            >
                                                                {creneau.libelle ||
                                                                    "Récréation / Pause"}
                                                            </td>
                                                        ) : (
                                                            classesAffichees.map(
                                                                (classe) =>
                                                                    rendreCellule(
                                                                        {
                                                                            key: jourActif,
                                                                            label: jourActif,
                                                                        },
                                                                        creneau,
                                                                        classe,
                                                                    ),
                                                            )
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <table className="w-full min-w-[832px] table-fixed border-collapse">
                                            <colgroup>
                                                <col className="w-20 sm:w-40" />
                                                {JOURS.map((jour) => (
                                                    <col
                                                        key={jour.key}
                                                        style={{ width: "9rem" }}
                                                    />
                                                ))}
                                            </colgroup>
                                            <thead>
                                                <tr className="bg-gray-100 text-xs font-bold uppercase text-gray-600">
                                                    <th className="sticky left-0 z-20 w-20 min-w-20 border-b border-r border-gray-200 bg-gray-100 px-1.5 py-2 text-left sm:w-40 sm:min-w-40 sm:px-4 sm:py-3">
                                                        Horaires
                                                    </th>
                                                    {JOURS.map((jour) => (
                                                        <th
                                                            key={jour.key}
                                                            className="border-b border-r border-gray-200 px-2 py-2 text-center last:border-r-0 sm:px-3 sm:py-3"
                                                        >
                                                            {jour.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {creneaux.map((creneau) => (
                                                    <tr key={creneau.id}>
                                                        <th className="sticky left-0 z-10 w-20 min-w-20 border-b border-r border-gray-200 bg-gray-50 px-1.5 py-2 text-left align-middle sm:w-40 sm:min-w-40 sm:px-4 sm:py-3">
                                                            <span className="block truncate text-[10px] font-bold uppercase leading-tight text-gray-700 sm:text-xs">
                                                                {creneau.libelle}
                                                            </span>
                                                            <span className="mt-0.5 block whitespace-nowrap text-[10px] font-semibold tabular-nums text-gray-900 sm:mt-1 sm:text-sm">
                                                                {creneau.heure_debut?.slice(0, 5)}–
                                                                {creneau.heure_fin?.slice(0, 5)}
                                                            </span>
                                                        </th>
                                                        {pause(creneau) ? (
                                                            <td
                                                                colSpan={JOURS.length}
                                                                className="border-b border-gray-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-800"
                                                            >
                                                                {creneau.libelle ||
                                                                    "Récréation / Pause"}
                                                            </td>
                                                        ) : (
                                                            JOURS.map((jour) =>
                                                                rendreCellule(
                                                                    jour,
                                                                    creneau,
                                                                ),
                                                            )
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!selectionComplete && (
                    <div className="border-y border-dashed border-gray-300 py-12 text-center">
                        <CalendarDays
                            className="mx-auto text-gray-400"
                            size={28}
                        />
                        <p className="mt-3 font-semibold text-gray-800">
                            Sélectionnez l’établissement et l’année scolaire.
                        </p>
                    </div>
                )}

                {!consultationSeule && coursModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-950/50 p-2 sm:items-center sm:p-4"
                        role="presentation"
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="cours-titre"
                            className="my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
                        >
                            <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-4 py-3 sm:px-5 sm:py-4">
                                <div>
                                    <p className="text-xs font-bold uppercase text-teal-700">
                                        {cours.classe_ids?.length > 1
                                            ? `${cours.classe_ids.length} classes regroupées`
                                            : coursModal.classe.libelle}{" "}
                                        · {coursModal.jour}
                                    </p>
                                    <h2
                                        id="cours-titre"
                                        className="mt-1 text-xl font-bold text-gray-900"
                                    >
                                        {coursModal.ligne
                                            ? "Modifier le cours"
                                            : "Ajouter un cours"}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {coursModal.creneau.libelle} ·{" "}
                                        {coursModal.creneau.heure_debut?.slice(
                                            0,
                                            5,
                                        )}
                                        –
                                        {coursModal.creneau.heure_fin?.slice(
                                            0,
                                            5,
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCoursModal(null)}
                                    title="Fermer"
                                    className="rounded p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    <X size={19} />
                                </button>
                            </div>
                            <form
                                onSubmit={enregistrerCours}
                                className="flex min-h-0 flex-col overflow-hidden"
                            >
                                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
                                <div className="block text-sm font-semibold text-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span>Classes concernées</span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const toutesLesClasses =
                                                    classesOrdonnees.map(
                                                        (classe) =>
                                                            String(classe.id),
                                                    );

                                                const toutesSelectionnees =
                                                    toutesLesClasses.every(
                                                        (id) =>
                                                            cours.classe_ids?.includes(
                                                                id,
                                                            ),
                                                    );

                                                setCours({
                                                    ...cours,
                                                    classe_ids:
                                                        toutesSelectionnees
                                                            ? [
                                                                  String(
                                                                      coursModal
                                                                          .classe
                                                                          .id,
                                                                  ),
                                                              ]
                                                            : toutesLesClasses,
                                                    classe_id:
                                                        toutesSelectionnees
                                                            ? String(
                                                                  coursModal
                                                                      .classe
                                                                      .id,
                                                              )
                                                            : (toutesLesClasses[0] ??
                                                              ""),
                                                });
                                            }}
                                            className="text-xs font-semibold text-teal-700 hover:text-teal-900"
                                        >
                                            {classesOrdonnees.length > 0 &&
                                            classesOrdonnees.every((classe) =>
                                                cours.classe_ids?.includes(
                                                    String(classe.id),
                                                ),
                                            )
                                                ? "Tout désélectionner"
                                                : "Tout sélectionner"}
                                        </button>
                                    </div>

                                    <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-2">
                                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                            {classesOrdonnees.map((classe) => {
                                                const classeId = String(
                                                    classe.id,
                                                );

                                                const selectionnee =
                                                    cours.classe_ids?.includes(
                                                        classeId,
                                                    );

                                                return (
                                                    <label
                                                        key={classe.id}
                                                        className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                                                            selectionnee
                                                                ? "bg-teal-50 text-teal-900"
                                                                : "hover:bg-white"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selectionnee
                                                            }
                                                            onChange={() => {
                                                                const nouvellesClasses =
                                                                    selectionnee
                                                                        ? cours.classe_ids.filter(
                                                                              (
                                                                                  id,
                                                                              ) =>
                                                                                  id !==
                                                                                  classeId,
                                                                          )
                                                                        : [
                                                                              ...(cours.classe_ids ??
                                                                                  []),
                                                                              classeId,
                                                                          ];

                                                                setCours({
                                                                    ...cours,
                                                                    classe_ids:
                                                                        nouvellesClasses,
                                                                    classe_id:
                                                                        nouvellesClasses[0] ??
                                                                        "",
                                                                });
                                                            }}
                                                            className="rounded border-gray-300 text-teal-700 focus:ring-teal-600"
                                                        />

                                                        <span className="font-medium">
                                                            {classe.libelle}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <p className="mt-1 text-xs font-normal text-gray-500">
                                        Sélectionnez plusieurs classes pour
                                        créer un cours regroupé.
                                    </p>
                                </div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Groupe d’élèves (facultatif)
                                    <input
                                        type="text"
                                        maxLength={50}
                                        list="groupes-classe"
                                        value={cours.groupe}
                                        onChange={(event) =>
                                            setCours({
                                                ...cours,
                                                groupe: event.target.value,
                                            })
                                        }
                                        placeholder="Ex. Allemand, Espagnol"
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    />
                                    <datalist id="groupes-classe">
                                        {[...new Set(
                                            (emploi?.lignes ?? [])
                                                .filter((ligne) =>
                                                    (cours.classe_ids ?? []).includes(
                                                        String(ligne.classe_id),
                                                    ),
                                                )
                                                .map((ligne) => ligne.groupe)
                                                .filter(Boolean),
                                        )].map((groupe) => (
                                            <option key={groupe} value={groupe} />
                                        ))}
                                    </datalist>
                                    <span className="mt-1 block text-xs font-normal text-gray-500">
                                        Utilisez le même groupe que pour les élèves.
                                        Deux cours au même créneau ne peuvent partager
                                        une classe que s’ils ont des groupes distincts.
                                    </span>
                                </label>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Type de séance
                                    <select
                                        value={cours.activite}
                                        onChange={(event) =>
                                            setCours({
                                                ...cours,
                                                activite: event.target.value,
                                                matiere_id: "",
                                                enseignant_id: "",
                                                educateur_id: "",
                                                double_creneau: false,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="">Matière</option>
                                        <option value="HE">
                                            Heure d'étude (HE)
                                        </option>
                                        <option value="CDI">
                                            Bibliothèque (CDI)
                                        </option>
                                        <option value="DN">
                                            Devoirs de Niveau (DN)
                                        </option>
                                    </select>
                                </label>

                                {cours.activite ? (
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Éducateur
                                        <select
                                            required
                                            value={cours.educateur_id}
                                            onChange={(event) =>
                                                setCours({
                                                    ...cours,
                                                    educateur_id:
                                                        event.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                        >
                                            <option value="">
                                                {educateursCours.length
                                                    ? "Choisir un éducateur affecté"
                                                    : "Aucun éducateur commun affecté aux classes sélectionnées"}
                                            </option>
                                            {educateursCours.map(
                                                (educateur) => (
                                                    <option
                                                        key={educateur.id}
                                                        value={educateur.id}
                                                    >
                                                        {educateur.nom}{" "}
                                                        {educateur.prenoms}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>
                                ) : (
                                    <>
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Matière
                                            <select
                                                required
                                                disabled={
                                                    matieresClasse.length === 0
                                                }
                                                value={cours.matiere_id}
                                                onChange={(event) =>
                                                    setCours({
                                                        ...cours,
                                                        matiere_id:
                                                            event.target.value,
                                                        enseignant_id: "",
                                                        double_creneau: false,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                            >
                                                <option value="">
                                                    {matieresClasse.length
                                                        ? "Choisir une matière de la maquette"
                                                        : "Aucune matière configurée dans la maquette"}
                                                </option>
                                                {matieresClasse.map(
                                                    (matiere) => (
                                                        <option
                                                            key={matiere.id}
                                                            value={matiere.id}
                                                        >
                                                            {matiere.libelle}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </label>
                                        {cours.matiere_id &&
                                            creneauDoubleDisponible &&
                                            matiereDoubleAutorisee && (
                                                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            cours.double_creneau
                                                        }
                                                        onChange={(event) =>
                                                            setCours({
                                                                ...cours,
                                                                double_creneau:
                                                                    event.target
                                                                        .checked,
                                                            })
                                                        }
                                                        className="mt-0.5 rounded border-gray-300 text-teal-700 focus:ring-teal-600"
                                                    />
                                                    <span>
                                                        Cette matière dure deux
                                                        créneaux consécutifs
                                                    </span>
                                                </label>
                                            )}
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Enseignant
                                            <select
                                                value={cours.enseignant_id}
                                                disabled={!cours.matiere_id}
                                                onChange={(event) =>
                                                    setCours({
                                                        ...cours,
                                                        enseignant_id:
                                                            event.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                            >
                                                <option value="">
                                                    {cours.matiere_id
                                                        ? "Choisir un enseignant affecté"
                                                        : "Choisissez d’abord une matière"}
                                                </option>
                                                {enseignantsCours.map(
                                                    (enseignant) => (
                                                        <option
                                                            key={enseignant.id}
                                                            value={
                                                                enseignant.id
                                                            }
                                                        >
                                                            {enseignant.nom}{" "}
                                                            {
                                                                enseignant.prenoms
                                                            }
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </label>
                                    </>
                                )}
                                <label className="block text-sm font-semibold text-gray-700">
                                    Salle
                                    <select
                                        value={cours.salle_id}
                                        onChange={(event) =>
                                            setCours({
                                                ...cours,
                                                salle_id: event.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="">
                                            -- Aucune salle --
                                        </option>

                                        {salles.map((salle) => (
                                            <option
                                                key={salle.id}
                                                value={salle.id}
                                            >
                                                {salle.nom}
                                                {salle.capacite
                                                    ? ` — ${salle.capacite} places`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs font-normal text-gray-500">
                                        La salle par défaut de la classe est
                                        sélectionnée automatiquement. Vous
                                        pouvez la modifier.
                                    </p>
                                </label>
                                {erreur && (
                                    <p
                                        role="alert"
                                        className="text-sm font-medium text-red-700"
                                    >
                                        {erreur}
                                    </p>
                                )}
                                </div>
                                <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
                                    <button
                                        type="button"
                                        onClick={() => setCoursModal(null)}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {!consultationSeule && creneauModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"
                        role="presentation"
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="creneau-titre"
                            className="w-full max-w-lg bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                                <h2
                                    id="creneau-titre"
                                    className="text-xl font-bold text-gray-900"
                                >
                                    {creneauForm.id
                                        ? "Modifier l’horaire"
                                        : "Ajouter un horaire ou une pause"}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setCreneauModal(false)}
                                    title="Fermer"
                                    className="rounded p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    <X size={19} />
                                </button>
                            </div>
                            <form
                                onSubmit={enregistrerCreneau}
                                className="space-y-4 p-5"
                            >
                                <label className="block text-sm font-semibold text-gray-700">
                                    Libellé
                                    <input
                                        required
                                        value={creneauForm.libelle}
                                        onChange={(event) =>
                                            setCreneauForm({
                                                ...creneauForm,
                                                libelle: event.target.value,
                                            })
                                        }
                                        maxLength={100}
                                        placeholder="Cours ou Récréation / Pause"
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Type
                                    <select
                                        required
                                        value={creneauForm.type}
                                        onChange={(event) =>
                                            setCreneauForm({
                                                ...creneauForm,
                                                type: event.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="cours">Cours</option>
                                        <option value="pause">
                                            Pause / récréation
                                        </option>
                                    </select>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Début
                                        <input
                                            required
                                            type="time"
                                            value={creneauForm.heure_debut}
                                            onChange={(event) =>
                                                setCreneauForm({
                                                    ...creneauForm,
                                                    heure_debut:
                                                        event.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </label>
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Fin
                                        <input
                                            required
                                            type="time"
                                            value={creneauForm.heure_fin}
                                            onChange={(event) =>
                                                setCreneauForm({
                                                    ...creneauForm,
                                                    heure_fin:
                                                        event.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </label>
                                </div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Ordre d’affichage
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={creneauForm.ordre}
                                        onChange={(event) =>
                                            setCreneauForm({
                                                ...creneauForm,
                                                ordre: event.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    />
                                </label>
                                {erreur && (
                                    <p
                                        role="alert"
                                        className="text-sm font-medium text-red-700"
                                    >
                                        {erreur}
                                    </p>
                                )}
                                <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCreneauModal(false)}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
