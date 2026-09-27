import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    Check,
    Eye,
    Pencil,
    Save,
    Square,
    SquareCheck,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

export default function Index({
    eleves,
    elevesModifiables = null,
    peutModifierGroupe = false,
    peutSupprimer = false,
    etablissements = [],
    annees = [],
    classes = [],
    filtres = {},
    isSuperAdmin = false,
}) {
    /*
    |--------------------------------------------------------------------------
    | ÉTATS GÉNÉRAUX
    |--------------------------------------------------------------------------
    */

    const [recherche, setRecherche] = useState("");
    const [niveauId, setNiveauId] = useState("");
    const [classeId, setClasseId] = useState("");
    const [filtresOuverts, setFiltresOuverts] = useState(false);
    const [filtreQualite, setFiltreQualite] = useState("");

    const [etablissementId, setEtablissementId] = useState(
        filtres?.etablissement_id ? String(filtres.etablissement_id) : "",
    );

    const etablissementSelectionne = etablissements.find(
        (etablissement) => String(etablissement.id) === String(etablissementId),
    );

    /*
    |--------------------------------------------------------------------------
    | MODIFICATION GROUPÉE
    |--------------------------------------------------------------------------
    */

    const [modeModificationGroupee, setModeModificationGroupee] =
        useState(false);

    const [elevesSelectionnes, setElevesSelectionnes] = useState([]);

    const [modificationGroupee, setModificationGroupee] = useState({
        etablissement_id: "",
        annee_scolaire_id: "",
        cycle_id: "",
        niveau_id: "",
        classe_id: "",
        serie_id: "",
    });

    const [enregistrementGroupe, setEnregistrementGroupe] = useState(false);

    const [erreursGroupees, setErreursGroupees] = useState({});

    /*
    |--------------------------------------------------------------------------
    | MODIFICATIONS DIRECTES DES CELLULES
    |--------------------------------------------------------------------------
    */

    const [modifications, setModifications] = useState({});

    const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | COLONNES
    |--------------------------------------------------------------------------
    */

    const colonnesDisponibles = {
        identification: {
            label: "Identification",
            colonnes: [
                { id: "matricule", label: "Matricule" },
                { id: "nom", label: "Nom" },
                { id: "prenoms", label: "Prénoms" },
                { id: "sexe", label: "Sexe" },
                {
                    id: "date_naissance",
                    label: "Date de naissance",
                },
                {
                    id: "lieu_naissance",
                    label: "Lieu de naissance",
                },
                {
                    id: "nationalite",
                    label: "Nationalité",
                },
            ],
        },

        scolarite: {
            label: "Scolarité",
            colonnes: [
                {
                    id: "annee_scolaire",
                    label: "Année scolaire",
                },
                {
                    id: "etablissement",
                    label: "Établissement",
                },
                {
                    id: "cycle",
                    label: "Cycle",
                },
                {
                    id: "niveau",
                    label: "Niveau",
                },
                {
                    id: "classe",
                    label: "Classe",
                },
                {
                    id: "serie",
                    label: "Série",
                },
                { id: "statut", label: "Statut" },
                {
                    id: "statut_affectation",
                    label: "Statut affectation",
                },
                { id: "regime", label: "Régime" },
                {
                    id: "redoublant",
                    label: "Redoublant",
                },
                {
                    id: "boursier",
                    label: "Boursier",
                },
            ],
        },

        eleve: {
            label: "Coordonnées de l'élève",
            colonnes: [
                {
                    id: "telephone",
                    label: "Téléphone",
                },
                {
                    id: "email",
                    label: "Email",
                },
                {
                    id: "adresse",
                    label: "Adresse",
                },
            ],
        },

        tuteur: {
            label: "Responsable légal",
            colonnes: [
                {
                    id: "type_tuteur",
                    label: "Type de tuteur",
                },
                {
                    id: "responsable_nom",
                    label: "Nom du responsable",
                },
                {
                    id: "responsable_prenoms",
                    label: "Prénoms du responsable",
                },
                {
                    id: "responsable_telephone",
                    label: "Téléphone du responsable",
                },
                {
                    id: "responsable_email",
                    label: "Email du responsable",
                },
                {
                    id: "responsable_profession",
                    label: "Profession du responsable",
                },
                {
                    id: "responsable_adresse",
                    label: "Adresse du responsable",
                },
            ],
        },

        pere: {
            label: "Père",
            colonnes: [
                {
                    id: "pere_nom",
                    label: "Nom du père",
                },
                {
                    id: "pere_prenoms",
                    label: "Prénoms du père",
                },
                {
                    id: "pere_telephone",
                    label: "Téléphone du père",
                },
                {
                    id: "pere_email",
                    label: "Email du père",
                },
                {
                    id: "pere_profession",
                    label: "Profession du père",
                },
                {
                    id: "pere_adresse",
                    label: "Adresse du père",
                },
            ],
        },

        mere: {
            label: "Mère",
            colonnes: [
                {
                    id: "mere_nom",
                    label: "Nom de la mère",
                },
                {
                    id: "mere_prenoms",
                    label: "Prénoms de la mère",
                },
                {
                    id: "mere_telephone",
                    label: "Téléphone de la mère",
                },
                {
                    id: "mere_email",
                    label: "Email de la mère",
                },
                {
                    id: "mere_profession",
                    label: "Profession de la mère",
                },
                {
                    id: "mere_adresse",
                    label: "Adresse de la mère",
                },
            ],
        },
    };

    const colonnesParDefaut = [
        "matricule",
        "nom",
        "prenoms",
        "sexe",
        "niveau",
        "classe",
        "statut",
    ];

    const [colonnesSelectionnees, setColonnesSelectionnees] = useState(() => {
        try {
            const sauvegarde = localStorage.getItem("stateval_eleves_colonnes");

            return sauvegarde ? JSON.parse(sauvegarde) : colonnesParDefaut;
        } catch {
            return colonnesParDefaut;
        }
    });

    const [menuColonnesOuvert, setMenuColonnesOuvert] = useState(false);

    useEffect(() => {
        localStorage.setItem(
            "stateval_eleves_colonnes",
            JSON.stringify(colonnesSelectionnees),
        );
    }, [colonnesSelectionnees]);

    /*
    |--------------------------------------------------------------------------
    | OUTILS
    |--------------------------------------------------------------------------
    */

    const normaliser = (valeur) => {
        return String(valeur ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    };

    const estVide = (valeur) => {
        return (
            valeur === null ||
            valeur === undefined ||
            String(valeur).trim() === ""
        );
    };

    const estVrai = (valeur) => {
        return (
            valeur === true ||
            valeur === 1 ||
            valeur === "1" ||
            normaliser(valeur) === "oui" ||
            normaliser(valeur) === "true"
        );
    };

    /*
    |--------------------------------------------------------------------------
    | NIVEAUX / CLASSES POUR LES FILTRES
    |--------------------------------------------------------------------------
    */

    const niveaux = useMemo(() => {
        const map = new Map();

        eleves.forEach((eleve) => {
            const niveau = eleve.classe?.niveau;

            if (niveau?.id) {
                map.set(niveau.id, niveau);
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            normaliser(a.libelle).localeCompare(normaliser(b.libelle), "fr"),
        );
    }, [eleves]);

    const classesFiltre = useMemo(() => {
        const map = new Map();

        eleves.forEach((eleve) => {
            const classe = eleve.classe;

            if (!classe?.id) {
                return;
            }

            if (niveauId && String(classe.niveau_id) !== String(niveauId)) {
                return;
            }

            map.set(classe.id, classe);
        });

        return Array.from(map.values()).sort((a, b) =>
            normaliser(a.libelle).localeCompare(normaliser(b.libelle), "fr"),
        );
    }, [eleves, niveauId]);

    /*
    |--------------------------------------------------------------------------
    | RÉFÉRENTIEL SCOLAIRE POUR LA MODIFICATION GROUPÉE
    |--------------------------------------------------------------------------
    */

    const classesReferentiel = useMemo(() => {
        return Array.isArray(classes) ? classes : [];
    }, [classes]);

    const anneesDisponibles = useMemo(() => {
        return Array.isArray(annees) ? annees : [];
    }, [annees]);

    const etablissementsDisponibles = useMemo(() => {
        return Array.isArray(etablissements) ? etablissements : [];
    }, [etablissements]);

    const cyclesDisponibles = useMemo(() => {
        const map = new Map();

        classesReferentiel.forEach((classe) => {
            if (classe.cycle?.id) {
                map.set(classe.cycle.id, classe.cycle);
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            normaliser(a.libelle).localeCompare(normaliser(b.libelle), "fr"),
        );
    }, [classesReferentiel]);

    const niveauxGroupe = useMemo(() => {
        const map = new Map();

        classesReferentiel.forEach((classe) => {
            if (!classe.niveau?.id) {
                return;
            }

            if (
                modificationGroupee.cycle_id &&
                String(classe.cycle_id) !== String(modificationGroupee.cycle_id)
            ) {
                return;
            }

            map.set(classe.niveau.id, classe.niveau);
        });

        return Array.from(map.values()).sort((a, b) =>
            normaliser(a.libelle).localeCompare(normaliser(b.libelle), "fr"),
        );
    }, [classesReferentiel, modificationGroupee.cycle_id]);

    const classesGroupe = useMemo(() => {
        return classesReferentiel
            .filter((classe) => {
                if (
                    modificationGroupee.etablissement_id &&
                    String(classe.etablissement_id) !==
                        String(modificationGroupee.etablissement_id)
                ) {
                    return false;
                }

                if (
                    modificationGroupee.annee_scolaire_id &&
                    String(classe.annee_scolaire_id) !==
                        String(modificationGroupee.annee_scolaire_id)
                ) {
                    return false;
                }

                if (
                    modificationGroupee.cycle_id &&
                    String(classe.cycle_id) !==
                        String(modificationGroupee.cycle_id)
                ) {
                    return false;
                }

                if (
                    modificationGroupee.niveau_id &&
                    String(classe.niveau_id) !==
                        String(modificationGroupee.niveau_id)
                ) {
                    return false;
                }

                return true;
            })
            .sort((a, b) =>
                normaliser(a.libelle).localeCompare(
                    normaliser(b.libelle),
                    "fr",
                ),
            );
    }, [
        classesReferentiel,
        modificationGroupee.etablissement_id,
        modificationGroupee.annee_scolaire_id,
        modificationGroupee.cycle_id,
        modificationGroupee.niveau_id,
    ]);

    const seriesDisponibles = useMemo(() => {
        const map = new Map();

        classesGroupe.forEach((classe) => {
            if (classe.serie?.id) {
                map.set(classe.serie.id, classe.serie);
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            normaliser(a.libelle).localeCompare(normaliser(b.libelle), "fr"),
        );
    }, [classesGroupe]);

    /*
    |--------------------------------------------------------------------------
    | FILTRAGE DES ÉLÈVES
    |--------------------------------------------------------------------------
    */

    const elevesFiltres = useMemo(() => {
        const terme = normaliser(recherche);

        return eleves.filter((eleve) => {
            if (terme) {
                const valeursRecherche = [
                    eleve.nom,
                    eleve.prenoms,
                    eleve.matricule,
                    eleve.code_eleve,
                ];

                const correspondance = valeursRecherche.some((valeur) =>
                    normaliser(valeur).includes(terme),
                );

                if (!correspondance) {
                    return false;
                }
            }

            if (
                niveauId &&
                String(eleve.classe?.niveau_id) !== String(niveauId)
            ) {
                return false;
            }

            if (classeId && String(eleve.classe_id) !== String(classeId)) {
                return false;
            }

            switch (filtreQualite) {
                case "complet":
                    if (
                        !(
                            !estVide(eleve.matricule) &&
                            !estVide(eleve.nom) &&
                            !estVide(eleve.prenoms) &&
                            !estVide(eleve.sexe) &&
                            !estVide(eleve.date_naissance) &&
                            !estVide(eleve.lieu_naissance) &&
                            !estVide(eleve.nationalite) &&
                            !estVide(eleve.classe?.niveau?.libelle) &&
                            !estVide(eleve.classe?.libelle) &&
                            !estVide(eleve.statut) &&
                            !estVide(eleve.regime) &&
                            !estVide(eleve.statut_affectation) &&
                            !estVide(eleve.responsable_nom) &&
                            !estVide(eleve.responsable_prenoms) &&
                            !estVide(eleve.responsable_telephone)
                        )
                    ) {
                        return false;
                    }
                    break;

                case "incomplet":
                    if (
                        !(
                            estVide(eleve.matricule) ||
                            estVide(eleve.nom) ||
                            estVide(eleve.prenoms) ||
                            estVide(eleve.sexe) ||
                            estVide(eleve.date_naissance) ||
                            estVide(eleve.lieu_naissance) ||
                            estVide(eleve.nationalite) ||
                            estVide(eleve.classe?.niveau?.libelle) ||
                            estVide(eleve.classe?.libelle) ||
                            estVide(eleve.statut) ||
                            estVide(eleve.regime) ||
                            estVide(eleve.statut_affectation) ||
                            estVide(eleve.responsable_nom) ||
                            estVide(eleve.responsable_prenoms) ||
                            estVide(eleve.responsable_telephone)
                        )
                    ) {
                        return false;
                    }
                    break;

                case "sans_matricule":
                    if (!estVide(eleve.matricule)) return false;
                    break;

                case "sans_date_naissance":
                    if (!estVide(eleve.date_naissance)) return false;
                    break;

                case "sans_lieu_naissance":
                    if (!estVide(eleve.lieu_naissance)) return false;
                    break;

                case "sans_nationalite":
                    if (!estVide(eleve.nationalite)) return false;
                    break;

                case "sans_telephone":
                    if (!estVide(eleve.telephone)) return false;
                    break;

                case "sans_email":
                    if (!estVide(eleve.email)) return false;
                    break;

                case "sans_adresse":
                    if (!estVide(eleve.adresse)) return false;
                    break;

                case "sans_responsable":
                    if (
                        !(
                            estVide(eleve.responsable_nom) &&
                            estVide(eleve.responsable_prenoms)
                        )
                    ) {
                        return false;
                    }
                    break;

                case "sans_telephone_responsable":
                    if (!estVide(eleve.responsable_telephone)) {
                        return false;
                    }
                    break;

                case "sans_email_responsable":
                    if (!estVide(eleve.responsable_email)) {
                        return false;
                    }
                    break;

                default:
                    break;
            }

            return true;
        });
    }, [eleves, recherche, niveauId, classeId, filtreQualite]);

    /*
    |--------------------------------------------------------------------------
    | STATISTIQUES
    |--------------------------------------------------------------------------
    */

    const statistiques = useMemo(() => {
        const total = elevesFiltres.length;

        const sexeFeminin = (eleve) => normaliser(eleve.sexe) === "feminin";

        const sexeMasculin = (eleve) => normaliser(eleve.sexe) === "masculin";

        const pourcentage = (nombre) => {
            if (total === 0) return 0;

            return Math.round((nombre / total) * 100);
        };

        const filles = elevesFiltres.filter(sexeFeminin);

        const garcons = elevesFiltres.filter(sexeMasculin);

        const sexeNonRenseigne = elevesFiltres.filter(
            (eleve) => !sexeFeminin(eleve) && !sexeMasculin(eleve),
        );

        const redoublants = elevesFiltres.filter((eleve) =>
            estVrai(eleve.redoublant),
        );

        const redoublantes = redoublants.filter(sexeFeminin);

        const redoublantsGarcons = redoublants.filter(sexeMasculin);

        const affectes = elevesFiltres.filter(
            (eleve) => normaliser(eleve.statut_affectation) === "affecte",
        );

        const nonAffectes = elevesFiltres.filter(
            (eleve) => normaliser(eleve.statut_affectation) === "non affecte",
        );

        const statutAffectationNonRenseigne = elevesFiltres.filter((eleve) =>
            estVide(eleve.statut_affectation),
        );

        const boursiers = elevesFiltres.filter((eleve) =>
            estVrai(eleve.boursier),
        );

        const boursieres = boursiers.filter(sexeFeminin);

        const boursiersGarcons = boursiers.filter(sexeMasculin);

        const sansMatricule = elevesFiltres.filter((eleve) =>
            estVide(eleve.matricule),
        );

        const sansDateNaissance = elevesFiltres.filter((eleve) =>
            estVide(eleve.date_naissance),
        );

        const sansLieuNaissance = elevesFiltres.filter((eleve) =>
            estVide(eleve.lieu_naissance),
        );

        const sansNationalite = elevesFiltres.filter((eleve) =>
            estVide(eleve.nationalite),
        );

        const sansSexe = elevesFiltres.filter((eleve) => estVide(eleve.sexe));

        const sansNiveau = elevesFiltres.filter((eleve) =>
            estVide(eleve.classe?.niveau?.libelle),
        );

        const sansClasse = elevesFiltres.filter((eleve) =>
            estVide(eleve.classe?.libelle),
        );

        const sansStatut = elevesFiltres.filter((eleve) =>
            estVide(eleve.statut),
        );

        const sansRegime = elevesFiltres.filter((eleve) =>
            estVide(eleve.regime),
        );

        const sansStatutAffectation = elevesFiltres.filter((eleve) =>
            estVide(eleve.statut_affectation),
        );

        const sansTelephone = elevesFiltres.filter((eleve) =>
            estVide(eleve.telephone),
        );

        const sansEmail = elevesFiltres.filter((eleve) => estVide(eleve.email));

        const sansAdresse = elevesFiltres.filter((eleve) =>
            estVide(eleve.adresse),
        );

        const sansResponsable = elevesFiltres.filter(
            (eleve) =>
                estVide(eleve.responsable_nom) &&
                estVide(eleve.responsable_prenoms),
        );

        const sansTelephoneResponsable = elevesFiltres.filter((eleve) =>
            estVide(eleve.responsable_telephone),
        );

        const sansEmailResponsable = elevesFiltres.filter((eleve) =>
            estVide(eleve.responsable_email),
        );

        const sansProfessionResponsable = elevesFiltres.filter((eleve) =>
            estVide(eleve.responsable_profession),
        );

        const champsIdentite = [
            "matricule",
            "nom",
            "prenoms",
            "sexe",
            "date_naissance",
            "lieu_naissance",
            "nationalite",
        ];

        const estIdentiteComplete = (eleve) =>
            champsIdentite.every((champ) => !estVide(eleve[champ]));

        const identitesCompletes = elevesFiltres.filter(estIdentiteComplete);

        const identitesIncompletes = elevesFiltres.filter(
            (eleve) => !estIdentiteComplete(eleve),
        );

        const estScolariteComplete = (eleve) =>
            !estVide(eleve.classe?.niveau?.libelle) &&
            !estVide(eleve.classe?.libelle) &&
            !estVide(eleve.statut) &&
            !estVide(eleve.statut_affectation) &&
            !estVide(eleve.regime);

        const scolaritesCompletes = elevesFiltres.filter(estScolariteComplete);

        const estDossierComplet = (eleve) =>
            estIdentiteComplete(eleve) &&
            estScolariteComplete(eleve) &&
            !estVide(eleve.responsable_nom) &&
            !estVide(eleve.responsable_prenoms) &&
            !estVide(eleve.responsable_telephone);

        const dossiersComplets = elevesFiltres.filter(estDossierComplet);

        const dossiersIncomplets = elevesFiltres.filter(
            (eleve) => !estDossierComplet(eleve),
        );

        const repartitionNiveaux = {};

        elevesFiltres.forEach((eleve) => {
            const niveau = eleve.classe?.niveau?.libelle || "Non renseigné";

            repartitionNiveaux[niveau] = (repartitionNiveaux[niveau] || 0) + 1;
        });

        const repartitionClasses = {};

        elevesFiltres.forEach((eleve) => {
            const classe = eleve.classe?.libelle || "Non renseignée";

            repartitionClasses[classe] = (repartitionClasses[classe] || 0) + 1;
        });

        return {
            total,

            filles: filles.length,
            garcons: garcons.length,
            sexeNonRenseigne: sexeNonRenseigne.length,

            tauxFeminisation: pourcentage(filles.length),

            tauxGarcons: pourcentage(garcons.length),

            redoublants: redoublants.length,

            redoublantes: redoublantes.length,

            redoublantsGarcons: redoublantsGarcons.length,

            tauxRedoublement: pourcentage(redoublants.length),

            affectes: affectes.length,

            affecteesFilles: affectes.filter(sexeFeminin).length,

            affectesGarcons: affectes.filter(sexeMasculin).length,

            tauxAffectation: pourcentage(affectes.length),

            nonAffectes: nonAffectes.length,

            nonAffecteesFilles: nonAffectes.filter(sexeFeminin).length,

            nonAffectesGarcons: nonAffectes.filter(sexeMasculin).length,

            statutAffectationNonRenseigne: statutAffectationNonRenseigne.length,

            boursiers: boursiers.length,

            boursieres: boursieres.length,

            boursiersGarcons: boursiersGarcons.length,

            tauxBoursiers: pourcentage(boursiers.length),

            sansMatricule: sansMatricule.length,

            sansDateNaissance: sansDateNaissance.length,

            sansLieuNaissance: sansLieuNaissance.length,

            sansNationalite: sansNationalite.length,

            sansSexe: sansSexe.length,

            sansNiveau: sansNiveau.length,

            sansClasse: sansClasse.length,

            sansStatut: sansStatut.length,

            sansRegime: sansRegime.length,

            sansStatutAffectation: sansStatutAffectation.length,

            sansTelephone: sansTelephone.length,

            sansEmail: sansEmail.length,

            sansAdresse: sansAdresse.length,

            sansResponsable: sansResponsable.length,

            sansTelephoneResponsable: sansTelephoneResponsable.length,

            sansEmailResponsable: sansEmailResponsable.length,

            sansProfessionResponsable: sansProfessionResponsable.length,

            identitesCompletes: identitesCompletes.length,

            identitesIncompletes: identitesIncompletes.length,

            tauxIdentiteComplete: pourcentage(identitesCompletes.length),

            scolaritesCompletes: scolaritesCompletes.length,

            tauxScolariteComplete: pourcentage(scolaritesCompletes.length),

            dossiersComplets: dossiersComplets.length,

            dossiersIncomplets: dossiersIncomplets.length,

            tauxDossiersComplets: pourcentage(dossiersComplets.length),

            tauxDossiersIncomplets: pourcentage(dossiersIncomplets.length),

            repartitionNiveaux,
            repartitionClasses,
        };
    }, [elevesFiltres]);

    /*
    |--------------------------------------------------------------------------
    | FILTRES
    |--------------------------------------------------------------------------
    */

    const reinitialiserFiltres = () => {
        setRecherche("");
        setNiveauId("");
        setClasseId("");
        setFiltreQualite("");

        if (isSuperAdmin && etablissementId) {
            setEtablissementId("");

            router.get(
                route("eleves.index"),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }
    };

    const changerEtablissement = (value) => {
        setEtablissementId(value);

        router.get(
            route("eleves.index"),
            value
                ? {
                      etablissement_id: value,
                  }
                : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | COLONNES
    |--------------------------------------------------------------------------
    */

    const toggleColonne = (id) => {
        setColonnesSelectionnees((actuelles) => {
            if (actuelles.includes(id)) {
                return actuelles.filter((colonne) => colonne !== id);
            }

            return [...actuelles, id];
        });
    };

    const appliquerVue = (vue) => {
        if (vue === "standard") {
            setColonnesSelectionnees([
                "matricule",
                "nom",
                "prenoms",
                "sexe",
                "niveau",
                "classe",
                "statut",
            ]);
        }

        if (vue === "administrative") {
            setColonnesSelectionnees([
                "matricule",
                "nom",
                "prenoms",
                "sexe",
                "date_naissance",
                "niveau",
                "classe",
                "statut",
                "statut_affectation",
                "regime",
                "redoublant",
                "boursier",
            ]);
        }

        if (vue === "parents") {
            setColonnesSelectionnees([
                "matricule",
                "nom",
                "prenoms",
                "classe",
                "type_tuteur",
                "responsable_nom",
                "responsable_prenoms",
                "responsable_telephone",
                "responsable_email",
            ]);
        }

        if (vue === "complete") {
            setColonnesSelectionnees(
                Object.values(colonnesDisponibles).flatMap((groupe) =>
                    groupe.colonnes.map((colonne) => colonne.id),
                ),
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | SUPPRESSION
    |--------------------------------------------------------------------------
    */

    const supprimerEleve = (eleve) => {
        if (
            window.confirm(
                `Voulez-vous vraiment supprimer l'élève ${eleve.nom} ${eleve.prenoms} ?`,
            )
        ) {
            router.delete(route("eleves.destroy", eleve.id));
        }
    };

    /*
    |--------------------------------------------------------------------------
    | AFFICHAGE DES VALEURS
    |--------------------------------------------------------------------------
    */

    const afficherValeur = (eleve, colonne) => {
        switch (colonne) {
            case "matricule":
                return eleve.matricule || "-";

            case "nom":
                return eleve.nom || "-";

            case "prenoms":
                return eleve.prenoms || "-";

            case "sexe":
                return eleve.sexe || "-";

            case "date_naissance":
                return eleve.date_naissance
                    ? new Date(eleve.date_naissance).toLocaleDateString("fr-FR")
                    : "-";

            case "lieu_naissance":
                return eleve.lieu_naissance || "-";

            case "nationalite":
                return eleve.nationalite || "-";

            case "annee_scolaire":
                return eleve.annee_scolaire?.libelle || "-";

            case "etablissement":
                return eleve.etablissement?.nom || "-";

            case "cycle":
                return eleve.classe?.cycle?.libelle || "-";

            case "niveau":
                return eleve.classe?.niveau?.libelle || "-";

            case "classe":
                return eleve.classe?.libelle || "-";

            case "serie":
                return eleve.classe?.serie?.libelle || "-";

            case "statut":
                return eleve.statut || "-";

            case "statut_affectation":
                return eleve.statut_affectation || "-";

            case "regime":
                return eleve.regime || "-";

            case "redoublant":
                return estVrai(eleve.redoublant) ? "Oui" : "Non";

            case "boursier":
                return estVrai(eleve.boursier) ? "Oui" : "Non";

            case "telephone":
                return eleve.telephone || "-";

            case "email":
                return eleve.email || "-";

            case "adresse":
                return eleve.adresse || "-";

            case "type_tuteur":
                return eleve.type_tuteur || "-";

            case "responsable_nom":
                return eleve.responsable_nom || "-";

            case "responsable_prenoms":
                return eleve.responsable_prenoms || "-";

            case "responsable_telephone":
                return eleve.responsable_telephone || "-";

            case "responsable_email":
                return eleve.responsable_email || "-";

            case "responsable_profession":
                return eleve.responsable_profession || "-";

            case "responsable_adresse":
                return eleve.responsable_adresse || "-";

            case "pere_nom":
                return eleve.pere_nom || "-";

            case "pere_prenoms":
                return eleve.pere_prenoms || "-";

            case "pere_telephone":
                return eleve.pere_telephone || "-";

            case "pere_email":
                return eleve.pere_email || "-";

            case "pere_profession":
                return eleve.pere_profession || "-";

            case "pere_adresse":
                return eleve.pere_adresse || "-";

            case "mere_nom":
                return eleve.mere_nom || "-";

            case "mere_prenoms":
                return eleve.mere_prenoms || "-";

            case "mere_telephone":
                return eleve.mere_telephone || "-";

            case "mere_email":
                return eleve.mere_email || "-";

            case "mere_profession":
                return eleve.mere_profession || "-";

            case "mere_adresse":
                return eleve.mere_adresse || "-";

            default:
                return "-";
        }
    };

    const labelColonne = (id) => {
        for (const groupe of Object.values(colonnesDisponibles)) {
            const colonne = groupe.colonnes.find(
                (colonne) => colonne.id === id,
            );

            if (colonne) {
                return colonne.label;
            }
        }

        return id;
    };

    /*
    |--------------------------------------------------------------------------
    | DROITS
    |--------------------------------------------------------------------------
    */

    const peutModifierEleve = (eleve) => {
        return (
            elevesModifiables === null ||
            elevesModifiables?.some((id) => String(id) === String(eleve.id))
        );
    };

    /*
    |--------------------------------------------------------------------------
    | SÉLECTION DES ÉLÈVES
    |--------------------------------------------------------------------------
    */

    const estSelectionne = (eleveId) => {
        return elevesSelectionnes.some((id) => String(id) === String(eleveId));
    };

    const basculerSelectionEleve = (eleveId) => {
        setElevesSelectionnes((actuelles) => {
            const existe = actuelles.some(
                (id) => String(id) === String(eleveId),
            );

            if (existe) {
                return actuelles.filter((id) => String(id) !== String(eleveId));
            }

            return [...actuelles, eleveId];
        });
    };

    const elevesModifiablesFiltres = elevesFiltres.filter(peutModifierEleve);

    const tousLesElevesSelectionnes =
        elevesModifiablesFiltres.length > 0 &&
        elevesModifiablesFiltres.every((eleve) => estSelectionne(eleve.id));

    const selectionnerTousLesEleves = () => {
        setElevesSelectionnes(
            elevesModifiablesFiltres.map((eleve) => eleve.id),
        );
    };

    const deselectionnerTousLesEleves = () => {
        setElevesSelectionnes([]);
    };

    /*
    |--------------------------------------------------------------------------
    | VALEURS ORIGINALES
    |--------------------------------------------------------------------------
    */

    const valeurOriginale = (eleve, colonne) => {
        switch (colonne) {
            case "matricule":
                return eleve.matricule ?? "";

            case "nom":
                return eleve.nom ?? "";

            case "prenoms":
                return eleve.prenoms ?? "";

            case "sexe":
                return eleve.sexe ?? "";

            case "date_naissance":
                return eleve.date_naissance ?? "";

            case "lieu_naissance":
                return eleve.lieu_naissance ?? "";

            case "nationalite":
                return eleve.nationalite ?? "";

            case "telephone":
                return eleve.telephone ?? "";

            case "email":
                return eleve.email ?? "";

            case "adresse":
                return eleve.adresse ?? "";

            case "statut":
                return eleve.statut ?? "";

            case "statut_affectation":
                return eleve.statut_affectation ?? "";

            case "regime":
                return eleve.regime ?? "";

            case "redoublant":
                return Boolean(eleve.redoublant);

            case "boursier":
                return Boolean(eleve.boursier);

            case "type_tuteur":
                return eleve.type_tuteur ?? "";

            case "responsable_nom":
                return eleve.responsable_nom ?? "";

            case "responsable_prenoms":
                return eleve.responsable_prenoms ?? "";

            case "responsable_telephone":
                return eleve.responsable_telephone ?? "";

            case "responsable_email":
                return eleve.responsable_email ?? "";

            case "responsable_profession":
                return eleve.responsable_profession ?? "";

            case "responsable_adresse":
                return eleve.responsable_adresse ?? "";

            case "pere_nom":
                return eleve.pere_nom ?? "";

            case "pere_prenoms":
                return eleve.pere_prenoms ?? "";

            case "pere_telephone":
                return eleve.pere_telephone ?? "";

            case "pere_email":
                return eleve.pere_email ?? "";

            case "pere_profession":
                return eleve.pere_profession ?? "";

            case "pere_adresse":
                return eleve.pere_adresse ?? "";

            case "mere_nom":
                return eleve.mere_nom ?? "";

            case "mere_prenoms":
                return eleve.mere_prenoms ?? "";

            case "mere_telephone":
                return eleve.mere_telephone ?? "";

            case "mere_email":
                return eleve.mere_email ?? "";

            case "mere_profession":
                return eleve.mere_profession ?? "";

            case "mere_adresse":
                return eleve.mere_adresse ?? "";

            default:
                return "";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | MODIFICATION D'UNE CELLULE
    |--------------------------------------------------------------------------
    */

    const modifierCellule = (eleve, colonne, valeur) => {
        setModifications((actuelles) => {
            const eleveActuel = actuelles[eleve.id] || {};

            const valeurInitiale = valeurOriginale(eleve, colonne);

            const nouvellesDonnees = {
                ...eleveActuel,
                [colonne]: valeur,
            };

            const valeursEgales =
                String(valeur ?? "") === String(valeurInitiale ?? "");

            if (valeursEgales) {
                delete nouvellesDonnees[colonne];
            }

            if (Object.keys(nouvellesDonnees).length === 0) {
                const copie = {
                    ...actuelles,
                };

                delete copie[eleve.id];

                return copie;
            }

            return {
                ...actuelles,
                [eleve.id]: nouvellesDonnees,
            };
        });
    };

    /*
    |--------------------------------------------------------------------------
    | CHAMP D'ÉDITION D'UNE CELLULE
    |--------------------------------------------------------------------------
    */

    const champEdition = (eleve, colonne) => {
        const valeur =
            modifications[eleve.id]?.[colonne] ??
            valeurOriginale(eleve, colonne);

        const classesInput =
            "w-full min-w-[130px] rounded border border-indigo-300 bg-white px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

        if (
            colonne === "annee_scolaire" ||
            colonne === "etablissement" ||
            colonne === "cycle" ||
            colonne === "niveau" ||
            colonne === "classe" ||
            colonne === "serie"
        ) {
            return (
                <div className="min-w-[140px] rounded bg-gray-50 px-2 py-1.5 text-xs text-gray-500">
                    Modification via le panneau « Scolarité »
                </div>
            );
        }

        if (colonne === "sexe") {
            return (
                <select
                    value={valeur}
                    onChange={(e) =>
                        modifierCellule(eleve, colonne, e.target.value)
                    }
                    className={classesInput}
                >
                    <option value="">Non renseigné</option>
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                </select>
            );
        }

        if (colonne === "date_naissance") {
            return (
                <input
                    type="date"
                    value={valeur || ""}
                    onChange={(e) =>
                        modifierCellule(eleve, colonne, e.target.value)
                    }
                    className={classesInput}
                />
            );
        }

        if (colonne === "statut") {
            return (
                <select
                    value={valeur}
                    onChange={(e) =>
                        modifierCellule(eleve, colonne, e.target.value)
                    }
                    className={classesInput}
                >
                    <option value="">Non renseigné</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="Ancien">Ancien</option>
                </select>
            );
        }

        if (colonne === "statut_affectation") {
            return (
                <select
                    value={valeur}
                    onChange={(e) =>
                        modifierCellule(eleve, colonne, e.target.value)
                    }
                    className={classesInput}
                >
                    <option value="">Non renseigné</option>
                    <option value="Affecté">Affecté</option>
                    <option value="Non affecté">Non affecté</option>
                </select>
            );
        }

        if (colonne === "regime") {
            return (
                <select
                    value={valeur}
                    onChange={(e) =>
                        modifierCellule(eleve, colonne, e.target.value)
                    }
                    className={classesInput}
                >
                    <option value="">Non renseigné</option>
                    <option value="Interne">Interne</option>
                    <option value="Externé">Externé</option>
                    <option value="Demi-pensionnaire">Demi-pensionnaire</option>
                </select>
            );
        }

        if (colonne === "redoublant" || colonne === "boursier") {
            return (
                <select
                    value={valeur ? "1" : "0"}
                    onChange={(e) =>
                        modifierCellule(eleve, colonne, e.target.value === "1")
                    }
                    className={classesInput}
                >
                    <option value="0">Non</option>
                    <option value="1">Oui</option>
                </select>
            );
        }

        if (colonne === "type_tuteur") {
            return (
                <select
                    value={valeur}
                    onChange={(e) =>
                        modifierCellule(eleve, colonne, e.target.value)
                    }
                    className={classesInput}
                >
                    <option value="">Non renseigné</option>
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Autre">Autre</option>
                </select>
            );
        }

        const type = colonne.includes("email") ? "email" : "text";

        return (
            <input
                type={type}
                value={valeur}
                onChange={(e) =>
                    modifierCellule(eleve, colonne, e.target.value)
                }
                className={classesInput}
            />
        );
    };

    /*
    |--------------------------------------------------------------------------
    | OUVERTURE DU MODE MODIFICATION GROUPÉE
    |--------------------------------------------------------------------------
    */

    const ouvrirModificationGroupee = () => {
        setModeModificationGroupee(true);

        setElevesSelectionnes([]);

        setErreursGroupees({});

        setModificationGroupee({
            etablissement_id:
                isSuperAdmin && etablissementId ? String(etablissementId) : "",
            annee_scolaire_id: "",
            cycle_id: "",
            niveau_id: "",
            classe_id: "",
            serie_id: "",
        });
    };

    /*
    |--------------------------------------------------------------------------
    | MODIFICATION DE LA CHAÎNE SCOLAIRE
    |--------------------------------------------------------------------------
    */

    const modifierChampGroupe = (champ, valeur) => {
        setErreursGroupees({});

        setModificationGroupee((actuelle) => {
            const nouvelle = {
                ...actuelle,
                [champ]: valeur,
            };

            if (champ === "etablissement_id") {
                nouvelle.annee_scolaire_id = "";
                nouvelle.cycle_id = "";
                nouvelle.niveau_id = "";
                nouvelle.classe_id = "";
                nouvelle.serie_id = "";
            }

            if (champ === "annee_scolaire_id") {
                nouvelle.cycle_id = "";
                nouvelle.niveau_id = "";
                nouvelle.classe_id = "";
                nouvelle.serie_id = "";
            }

            if (champ === "cycle_id") {
                nouvelle.niveau_id = "";
                nouvelle.classe_id = "";
                nouvelle.serie_id = "";
            }

            if (champ === "niveau_id") {
                nouvelle.classe_id = "";
                nouvelle.serie_id = "";
            }

            if (champ === "classe_id") {
                const classe = classesReferentiel.find(
                    (item) => String(item.id) === String(valeur),
                );

                nouvelle.serie_id = classe?.serie_id
                    ? String(classe.serie_id)
                    : "";
            }

            return nouvelle;
        });
    };

    /*
    |--------------------------------------------------------------------------
    | APPLICATION DE LA MODIFICATION SCOLAIRE GROUPÉE
    |--------------------------------------------------------------------------
    */

    const appliquerModificationGroupee = () => {
        setErreursGroupees({});

        if (elevesSelectionnes.length === 0) {
            setErreursGroupees({
                general: "Veuillez sélectionner au moins un élève.",
            });

            return;
        }

        if (!modificationGroupee.classe_id) {
            setErreursGroupees({
                classe_id: "Veuillez sélectionner une classe.",
            });

            return;
        }

        const classe = classesReferentiel.find(
            (item) => String(item.id) === String(modificationGroupee.classe_id),
        );

        if (!classe) {
            setErreursGroupees({
                classe_id: "La classe sélectionnée est introuvable.",
            });

            return;
        }

        const donnees = elevesSelectionnes.map((id) => ({
            id: Number(id),

            ...(modificationGroupee.etablissement_id
                ? {
                      etablissement_id: Number(
                          modificationGroupee.etablissement_id,
                      ),
                  }
                : {}),

            ...(modificationGroupee.annee_scolaire_id
                ? {
                      annee_scolaire_id: Number(
                          modificationGroupee.annee_scolaire_id,
                      ),
                  }
                : {}),

            classe_id: Number(modificationGroupee.classe_id),
        }));

        setEnregistrementGroupe(true);

        router.patch(
            route("eleves.update.bulk"),
            {
                eleves: donnees,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setModificationGroupee({
                        etablissement_id: "",
                        annee_scolaire_id: "",
                        cycle_id: "",
                        niveau_id: "",
                        classe_id: "",
                        serie_id: "",
                    });

                    setElevesSelectionnes([]);

                    setErreursGroupees({});
                },

                onError: (errors) => {
                    setErreursGroupees(errors || {});
                },

                onFinish: () => {
                    setEnregistrementGroupe(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | SAUVEGARDE DES MODIFICATIONS DIRECTES
    |--------------------------------------------------------------------------
    */

    const sauvegarderModifications = () => {
        const ids = Object.keys(modifications);

        if (ids.length === 0) {
            window.alert("Aucune modification n'a été effectuée.");

            return;
        }

        const donnees = ids.map((id) => ({
            id: Number(id),
            ...modifications[id],
        }));

        setSauvegardeEnCours(true);

        router.patch(
            route("eleves.update.bulk"),
            {
                eleves: donnees,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setModifications({});

                    setElevesSelectionnes([]);

                    setModeModificationGroupee(false);
                },

                onFinish: () => {
                    setSauvegardeEnCours(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | ANNULATION
    |--------------------------------------------------------------------------
    */

    const annulerModificationGroupee = () => {
        if (Object.keys(modifications).length > 0) {
            const confirmer = window.confirm(
                "Les modifications non enregistrées seront perdues. Continuer ?",
            );

            if (!confirmer) {
                return;
            }
        }

        setModifications({});

        setElevesSelectionnes([]);

        setModificationGroupee({
            etablissement_id: "",
            annee_scolaire_id: "",
            cycle_id: "",
            niveau_id: "",
            classe_id: "",
            serie_id: "",
        });

        setErreursGroupees({});

        setModeModificationGroupee(false);
    };

    /*
    |--------------------------------------------------------------------------
    | EXPORTS
    |--------------------------------------------------------------------------
    */

    const donneesExport = useMemo(() => {
        return elevesFiltres.map((eleve) => {
            const ligne = {};

            colonnesSelectionnees.forEach((colonne) => {
                ligne[labelColonne(colonne)] = afficherValeur(eleve, colonne);
            });

            return ligne;
        });
    }, [elevesFiltres, colonnesSelectionnees]);

    const nomFichierExport = () => {
        if (etablissementSelectionne?.nom) {
            return `eleves_${normaliser(etablissementSelectionne.nom).replace(
                /\s+/g,
                "_",
            )}`;
        }

        return "eleves";
    };

    const exporterExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(donneesExport);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Élèves");

        XLSX.writeFile(workbook, `${nomFichierExport()}.xlsx`);
    };

    const exporterCSV = () => {
        if (donneesExport.length === 0) {
            return;
        }

        const entetes = Object.keys(donneesExport[0]);

        const lignes = donneesExport.map((ligne) =>
            entetes
                .map((entete) => {
                    const valeur = ligne[entete] ?? "";

                    return `"${String(valeur).replace(/"/g, '""')}"`;
                })
                .join(";"),
        );

        const contenu = [
            entetes.map((entete) => `"${entete}"`).join(";"),
            ...lignes,
        ].join("\n");

        const blob = new Blob(["\ufeff" + contenu], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const lien = document.createElement("a");

        lien.href = url;

        lien.download = `${nomFichierExport()}.csv`;

        document.body.appendChild(lien);

        lien.click();

        document.body.removeChild(lien);

        URL.revokeObjectURL(url);
    };

    const imprimerListe = () => {
        window.print();
    };

    /*
    |--------------------------------------------------------------------------
    | RENDU
    |--------------------------------------------------------------------------
    */

    return (
        <AdminLayout>
            <Head title="Élèves" />

            <div className="space-y-6 p-4 sm:p-6">
                {/* =====================================================
                    EN-TÊTE
                ====================================================== */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Élèves
                        </h1>

                        <p className="text-sm text-gray-500">
                            Gestion des élèves
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {!modeModificationGroupee ? (
                            <>
                                <Link
                                    href={route("eleves.import.form")}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                >
                                    Importer les élèves
                                </Link>

                                <Link
                                    href={route("eleves.create")}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    + Nouvel élève
                                </Link>

                                {peutModifierGroupe && (
                                    <button
                                        type="button"
                                        onClick={ouvrirModificationGroupee}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Modification groupée
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={sauvegarderModifications}
                                    disabled={
                                        sauvegardeEnCours ||
                                        Object.keys(modifications).length === 0
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />

                                    {sauvegardeEnCours
                                        ? "Enregistrement..."
                                        : `Enregistrer les modifications${
                                              Object.keys(modifications)
                                                  .length > 0
                                                  ? ` (${
                                                        Object.keys(
                                                            modifications,
                                                        ).length
                                                    })`
                                                  : ""
                                          }`}
                                </button>

                                <button
                                    type="button"
                                    onClick={annulerModificationGroupee}
                                    disabled={
                                        sauvegardeEnCours ||
                                        enregistrementGroupe
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <X className="h-4 w-4" />
                                    Annuler
                                </button>
                            </>
                        )}

                        {peutSupprimer && elevesSelectionnes.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        !window.confirm(
                                            `Voulez-vous vraiment supprimer ${elevesSelectionnes.length} élève(s) sélectionné(s) ?\n\nCette opération est irréversible.`,
                                        )
                                    ) {
                                        return;
                                    }

                                    router.delete(
                                        route("eleves.suppression-groupee"),
                                        {
                                            data: {
                                                eleves: elevesSelectionnes,
                                            },
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                setElevesSelectionnes([]);
                                            },
                                        },
                                    );
                                }}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                                Supprimer ({elevesSelectionnes.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    PANNEAU MODIFICATION GROUPÉE
                ====================================================== */}

                {modeModificationGroupee && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="font-semibold text-indigo-900">
                                        Modification groupée
                                    </p>

                                    <p className="text-sm text-indigo-700">
                                        {elevesSelectionnes.length} élève
                                        {elevesSelectionnes.length > 1
                                            ? "s"
                                            : ""}{" "}
                                        sélectionné
                                        {elevesSelectionnes.length > 1
                                            ? "s"
                                            : ""}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={selectionnerTousLesEleves}
                                        disabled={
                                            elevesModifiablesFiltres.length ===
                                            0
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <SquareCheck className="h-4 w-4" />
                                        Tout sélectionner
                                    </button>

                                    <button
                                        type="button"
                                        onClick={deselectionnerTousLesEleves}
                                        disabled={
                                            elevesSelectionnes.length === 0
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Square className="h-4 w-4" />
                                        Tout désélectionner
                                    </button>
                                </div>
                            </div>

                            {/* CHAÎNE SCOLAIRE */}

                            <div className="rounded-xl border border-indigo-200 bg-white p-4">
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-900">
                                        Affectation scolaire groupée
                                    </h3>

                                    <p className="text-xs text-gray-500">
                                        Les choix sont dépendants les uns des
                                        autres. Sélectionnez l'établissement,
                                        l'année, le cycle, le niveau puis la
                                        classe.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                                    {/* ÉTABLISSEMENT */}

                                    {isSuperAdmin && (
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                Établissement
                                            </label>

                                            <select
                                                value={
                                                    modificationGroupee.etablissement_id
                                                }
                                                onChange={(e) =>
                                                    modifierChampGroupe(
                                                        "etablissement_id",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                            >
                                                <option value="">
                                                    Tous les établissements
                                                </option>

                                                {etablissementsDisponibles.map(
                                                    (etablissement) => (
                                                        <option
                                                            key={
                                                                etablissement.id
                                                            }
                                                            value={
                                                                etablissement.id
                                                            }
                                                        >
                                                            {etablissement.nom}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    )}

                                    {/* ANNÉE */}

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                                            Année scolaire
                                        </label>

                                        <select
                                            value={
                                                modificationGroupee.annee_scolaire_id
                                            }
                                            onChange={(e) =>
                                                modifierChampGroupe(
                                                    "annee_scolaire_id",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        >
                                            <option value="">
                                                Sélectionner
                                            </option>

                                            {anneesDisponibles.map((annee) => (
                                                <option
                                                    key={annee.id}
                                                    value={annee.id}
                                                >
                                                    {annee.libelle}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* CYCLE */}

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                                            Cycle
                                        </label>

                                        <select
                                            value={modificationGroupee.cycle_id}
                                            onChange={(e) =>
                                                modifierChampGroupe(
                                                    "cycle_id",
                                                    e.target.value,
                                                )
                                            }
                                            disabled={
                                                !modificationGroupee.annee_scolaire_id
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <option value="">
                                                Sélectionner
                                            </option>

                                            {cyclesDisponibles
                                                .filter((cycle) => {
                                                    if (
                                                        !modificationGroupee.etablissement_id
                                                    ) {
                                                        return true;
                                                    }

                                                    return classesReferentiel.some(
                                                        (classe) =>
                                                            String(
                                                                classe.cycle_id,
                                                            ) ===
                                                                String(
                                                                    cycle.id,
                                                                ) &&
                                                            String(
                                                                classe.etablissement_id,
                                                            ) ===
                                                                String(
                                                                    modificationGroupee.etablissement_id,
                                                                ) &&
                                                            String(
                                                                classe.annee_scolaire_id,
                                                            ) ===
                                                                String(
                                                                    modificationGroupee.annee_scolaire_id,
                                                                ),
                                                    );
                                                })
                                                .map((cycle) => (
                                                    <option
                                                        key={cycle.id}
                                                        value={cycle.id}
                                                    >
                                                        {cycle.libelle}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    {/* NIVEAU */}

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                                            Niveau
                                        </label>

                                        <select
                                            value={
                                                modificationGroupee.niveau_id
                                            }
                                            onChange={(e) =>
                                                modifierChampGroupe(
                                                    "niveau_id",
                                                    e.target.value,
                                                )
                                            }
                                            disabled={
                                                !modificationGroupee.cycle_id
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <option value="">
                                                Sélectionner
                                            </option>

                                            {niveauxGroupe
                                                .filter((niveau) => {
                                                    return classesReferentiel.some(
                                                        (classe) => {
                                                            if (
                                                                String(
                                                                    classe.niveau_id,
                                                                ) !==
                                                                String(
                                                                    niveau.id,
                                                                )
                                                            ) {
                                                                return false;
                                                            }

                                                            if (
                                                                String(
                                                                    classe.cycle_id,
                                                                ) !==
                                                                String(
                                                                    modificationGroupee.cycle_id,
                                                                )
                                                            ) {
                                                                return false;
                                                            }

                                                            if (
                                                                modificationGroupee.etablissement_id &&
                                                                String(
                                                                    classe.etablissement_id,
                                                                ) !==
                                                                    String(
                                                                        modificationGroupee.etablissement_id,
                                                                    )
                                                            ) {
                                                                return false;
                                                            }

                                                            if (
                                                                modificationGroupee.annee_scolaire_id &&
                                                                String(
                                                                    classe.annee_scolaire_id,
                                                                ) !==
                                                                    String(
                                                                        modificationGroupee.annee_scolaire_id,
                                                                    )
                                                            ) {
                                                                return false;
                                                            }

                                                            return true;
                                                        },
                                                    );
                                                })
                                                .map((niveau) => (
                                                    <option
                                                        key={niveau.id}
                                                        value={niveau.id}
                                                    >
                                                        {niveau.libelle}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    {/* CLASSE */}

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                                            Classe
                                        </label>

                                        <select
                                            value={
                                                modificationGroupee.classe_id
                                            }
                                            onChange={(e) =>
                                                modifierChampGroupe(
                                                    "classe_id",
                                                    e.target.value,
                                                )
                                            }
                                            disabled={
                                                !modificationGroupee.niveau_id
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <option value="">
                                                Sélectionner
                                            </option>

                                            {classesGroupe.map((classe) => (
                                                <option
                                                    key={classe.id}
                                                    value={classe.id}
                                                >
                                                    {classe.libelle}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* SÉRIE */}

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                                            Série
                                        </label>

                                        <select
                                            value={modificationGroupee.serie_id}
                                            onChange={(e) =>
                                                modifierChampGroupe(
                                                    "serie_id",
                                                    e.target.value,
                                                )
                                            }
                                            disabled={
                                                !modificationGroupee.classe_id
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <option value="">
                                                {modificationGroupee.classe_id
                                                    ? "Aucune série"
                                                    : "Sélectionner"}
                                            </option>

                                            {seriesDisponibles
                                                .filter((serie) =>
                                                    classesGroupe.some(
                                                        (classe) =>
                                                            String(
                                                                classe.id,
                                                            ) ===
                                                                String(
                                                                    modificationGroupee.classe_id,
                                                                ) &&
                                                            String(
                                                                classe.serie_id,
                                                            ) ===
                                                                String(
                                                                    serie.id,
                                                                ),
                                                    ),
                                                )
                                                .map((serie) => (
                                                    <option
                                                        key={serie.id}
                                                        value={serie.id}
                                                    >
                                                        {serie.libelle}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                {erreursGroupees.general && (
                                    <p className="mt-3 text-sm font-medium text-red-600">
                                        {erreursGroupees.general}
                                    </p>
                                )}

                                {erreursGroupees.classe_id && (
                                    <p className="mt-3 text-sm font-medium text-red-600">
                                        {erreursGroupees.classe_id}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-col gap-3 rounded-lg bg-indigo-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-indigo-800">
                                        Cette affectation sera appliquée aux{" "}
                                        <strong>
                                            {elevesSelectionnes.length}
                                        </strong>{" "}
                                        élève
                                        {elevesSelectionnes.length > 1
                                            ? "s"
                                            : ""}{" "}
                                        sélectionné
                                        {elevesSelectionnes.length > 1
                                            ? "s"
                                            : ""}
                                        .
                                    </p>

                                    <button
                                        type="button"
                                        onClick={appliquerModificationGroupee}
                                        disabled={
                                            enregistrementGroupe ||
                                            elevesSelectionnes.length === 0 ||
                                            !modificationGroupee.classe_id
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4" />

                                        {enregistrementGroupe
                                            ? "Application..."
                                            : `Appliquer à ${elevesSelectionnes.length} élève${
                                                  elevesSelectionnes.length > 1
                                                      ? "s"
                                                      : ""
                                              }`}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white/70 p-3 text-xs text-indigo-800">
                                <strong>Modification directe :</strong> après
                                avoir sélectionné des élèves, les autres
                                colonnes modifiables du tableau deviennent
                                directement éditables. Les informations
                                scolaires sont modifiées exclusivement à partir
                                du panneau ci-dessus afin d'éviter les
                                incohérences entre cycle, niveau, classe et
                                série.
                            </div>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    FILTRES
                ====================================================== */}

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Filtres
                            </h2>

                            <p className="text-sm text-gray-500">
                                Affinez la liste des élèves.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setFiltresOuverts(!filtresOuverts)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {filtresOuverts
                                ? "Masquer les filtres"
                                : "Afficher les filtres"}
                        </button>
                    </div>

                    {filtresOuverts && (
                        <div className="border-t p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {isSuperAdmin && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Établissement
                                        </label>

                                        <select
                                            value={etablissementId}
                                            onChange={(e) =>
                                                changerEtablissement(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        >
                                            <option value="">
                                                Tous les établissements
                                            </option>

                                            {etablissements.map(
                                                (etablissement) => (
                                                    <option
                                                        key={etablissement.id}
                                                        value={etablissement.id}
                                                    >
                                                        {etablissement.nom}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Niveau
                                    </label>

                                    <select
                                        value={niveauId}
                                        onChange={(e) => {
                                            setNiveauId(e.target.value);

                                            setClasseId("");
                                        }}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            Tous les niveaux
                                        </option>

                                        {niveaux.map((niveau) => (
                                            <option
                                                key={niveau.id}
                                                value={niveau.id}
                                            >
                                                {niveau.libelle}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Classe
                                    </label>

                                    <select
                                        value={classeId}
                                        onChange={(e) =>
                                            setClasseId(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            Toutes les classes
                                        </option>

                                        {classesFiltre.map((classe) => (
                                            <option
                                                key={classe.id}
                                                value={classe.id}
                                            >
                                                {classe.libelle}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Recherche
                                    </label>

                                    <input
                                        type="text"
                                        value={recherche}
                                        onChange={(e) =>
                                            setRecherche(e.target.value)
                                        }
                                        placeholder="Nom, prénoms, matricule..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Qualité du dossier
                                    </label>

                                    <select
                                        value={filtreQualite}
                                        onChange={(e) =>
                                            setFiltreQualite(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            Tous les dossiers
                                        </option>

                                        <option value="complet">
                                            Dossiers complets
                                        </option>

                                        <option value="incomplet">
                                            Dossiers incomplets
                                        </option>

                                        <option value="sans_matricule">
                                            Sans matricule
                                        </option>

                                        <option value="sans_date_naissance">
                                            Sans date de naissance
                                        </option>

                                        <option value="sans_lieu_naissance">
                                            Sans lieu de naissance
                                        </option>

                                        <option value="sans_nationalite">
                                            Sans nationalité
                                        </option>

                                        <option value="sans_telephone">
                                            Sans téléphone
                                        </option>

                                        <option value="sans_email">
                                            Sans email
                                        </option>

                                        <option value="sans_adresse">
                                            Sans adresse
                                        </option>

                                        <option value="sans_responsable">
                                            Sans responsable
                                        </option>

                                        <option value="sans_telephone_responsable">
                                            Sans téléphone responsable
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={reinitialiserFiltres}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* =====================================================
                    LISTE
                ====================================================== */}

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Liste des élèves
                                {etablissementSelectionne
                                    ? ` — ${etablissementSelectionne.nom}`
                                    : ""}
                            </h2>

                            <p className="text-sm text-gray-500">
                                {elevesFiltres.length} élève
                                {elevesFiltres.length > 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={exporterExcel}
                                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Excel
                            </button>

                            <button
                                type="button"
                                onClick={exporterCSV}
                                className="rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                CSV
                            </button>

                            <button
                                type="button"
                                onClick={imprimerListe}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Imprimer
                            </button>
                        </div>
                    </div>

                    {/* MENU COLONNES */}

                    <div className="relative border-b p-4">
                        <button
                            type="button"
                            onClick={() =>
                                setMenuColonnesOuvert(!menuColonnesOuvert)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Colonnes affichées ({colonnesSelectionnees.length})
                        </button>

                        {menuColonnesOuvert && (
                            <div className="absolute left-4 top-14 z-50 max-h-[70vh] w-[340px] overflow-y-auto rounded-xl border bg-white p-4 shadow-xl">
                                <div className="mb-4">
                                    <p className="mb-2 text-sm font-semibold text-gray-900">
                                        Vues rapides
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                appliquerVue("standard")
                                            }
                                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
                                        >
                                            Standard
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                appliquerVue("administrative")
                                            }
                                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
                                        >
                                            Administrative
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                appliquerVue("parents")
                                            }
                                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
                                        >
                                            Parents
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                appliquerVue("complete")
                                            }
                                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
                                        >
                                            Complète
                                        </button>
                                    </div>
                                </div>

                                {Object.entries(colonnesDisponibles).map(
                                    ([groupeId, groupe]) => (
                                        <div key={groupeId} className="mb-4">
                                            <p className="mb-2 text-sm font-semibold text-gray-900">
                                                {groupe.label}
                                            </p>

                                            <div className="space-y-2">
                                                {groupe.colonnes.map(
                                                    (colonne) => (
                                                        <label
                                                            key={colonne.id}
                                                            className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={colonnesSelectionnees.includes(
                                                                    colonne.id,
                                                                )}
                                                                onChange={() =>
                                                                    toggleColonne(
                                                                        colonne.id,
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />

                                                            {colonne.label}
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    {/* TABLEAU */}

                    <div className="overflow-x-auto">
                        <table className="min-w-max w-full">
                            <thead className="bg-gray-100">
                               
                                <tr>
                                    
                                    {modeModificationGroupee && (
                                        <th className="sticky left-0 top-0 z-50 w-[50px] min-w-[50px] bg-gray-100 px-3 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    tousLesElevesSelectionnes
                                                }
                                                onChange={() => {
                                                    if (
                                                        tousLesElevesSelectionnes
                                                    ) {
                                                        deselectionnerTousLesEleves();
                                                    } else {
                                                        selectionnerTousLesEleves();
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                        </th>
                                    )}

                                    {colonnesSelectionnees.map((colonne) => {
                                        const classeColonne =
                                            colonne === "matricule"
                                                ? "sticky left-0 top-0 z-40 w-[110px] min-w-[110px] bg-gray-100"
                                                : "sticky top-0 z-30 bg-gray-100";

                                        return (
                                            <th
                                                key={colonne}
                                                className={`${classeColonne} whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600`}
                                            >
                                                {labelColonne(colonne)}
                                            </th>
                                        );
                                    })}

                                    <th className="sticky right-0 top-0 z-40 bg-gray-100 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {elevesFiltres.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                colonnesSelectionnees.length +
                                                1 +
                                                (modeModificationGroupee
                                                    ? 1
                                                    : 0)
                                            }
                                            className="px-4 py-10 text-center text-sm text-gray-500"
                                        >
                                            Aucun élève trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    elevesFiltres.map((eleve) => {
                                        const selectionne = estSelectionne(
                                            eleve.id,
                                        );

                                        const ligneModifiee =
                                            modifications[eleve.id] &&
                                            Object.keys(modifications[eleve.id])
                                                .length > 0;

                                        return (
                                            <tr
                                                key={eleve.id}
                                                className={`border-t ${
                                                    ligneModifiee
                                                        ? "bg-yellow-50"
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >
                                                {modeModificationGroupee && (
                                                    <td className="sticky left-0 z-20 w-[50px] min-w-[50px] bg-white px-3 py-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selectionne
                                                            }
                                                            disabled={
                                                                !peutModifierEleve(
                                                                    eleve,
                                                                )
                                                            }
                                                            onChange={() =>
                                                                basculerSelectionEleve(
                                                                    eleve.id,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </td>
                                                )}

                                                {colonnesSelectionnees.map(
                                                    (colonne) => {
                                                        const classeColonne =
                                                            colonne ===
                                                            "matricule"
                                                                ? "sticky left-0 z-20 w-[110px] min-w-[110px] bg-white"
                                                                : "";

                                                        return (
                                                            <td
                                                                key={colonne}
                                                                className={`${classeColonne} px-3 py-2 text-sm text-gray-700`}
                                                            >
                                                                {modeModificationGroupee &&
                                                                selectionne &&
                                                                peutModifierEleve(
                                                                    eleve,
                                                                )
                                                                    ? champEdition(
                                                                          eleve,
                                                                          colonne,
                                                                      )
                                                                    : afficherValeur(
                                                                          eleve,
                                                                          colonne,
                                                                      )}
                                                            </td>
                                                        );
                                                    },
                                                )}

                                                <td className="sticky right-0 z-20 bg-white px-3 py-2">
                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={route(
                                                                "eleves.show",
                                                                eleve.id,
                                                            )}
                                                            title="Voir"
                                                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>

                                                        {peutModifierEleve(
                                                            eleve,
                                                        ) && (
                                                            <Link
                                                                href={route(
                                                                    "eleves.edit",
                                                                    eleve.id,
                                                                )}
                                                                title="Modifier"
                                                                className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        )}

                                                        {peutSupprimer && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    supprimerEleve(
                                                                        eleve,
                                                                    )
                                                                }
                                                                title="Supprimer"
                                                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* =====================================================
                    STATISTIQUES
                ====================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Effectif
                        </p>

                        <p className="mt-1 text-3xl font-bold text-gray-900">
                            {statistiques.total}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            {statistiques.filles} filles ·{" "}
                            {statistiques.garcons} garçons
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Taux de féminisation
                        </p>

                        <p className="mt-1 text-3xl font-bold text-pink-600">
                            {statistiques.tauxFeminisation}%
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            {statistiques.filles} fille
                            {statistiques.filles > 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Redoublants
                        </p>

                        <p className="mt-1 text-3xl font-bold text-orange-600">
                            {statistiques.redoublants}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            {statistiques.tauxRedoublement}% de l'effectif
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Élèves affectés
                        </p>

                        <p className="mt-1 text-3xl font-bold text-blue-600">
                            {statistiques.affectes}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            {statistiques.tauxAffectation}% de l'effectif
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    QUALITÉ DES DONNÉES
                ====================================================== */}

                <div className="mt-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Qualité des données
                        </h3>

                        <p className="text-sm text-gray-500">
                            Vérification des informations renseignées pour les
                            élèves actuellement affichés.
                        </p>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Dossiers complets
                                    </p>

                                    <p className="mt-1 text-3xl font-bold text-green-600">
                                        {statistiques.dossiersComplets}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {statistiques.tauxDossiersComplets}% de
                                        l'effectif
                                    </p>
                                </div>

                                <div className="rounded-lg bg-green-100 px-3 py-2 text-xl">
                                    ✓
                                </div>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{
                                        width: `${statistiques.tauxDossiersComplets}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Dossiers incomplets
                                    </p>

                                    <p className="mt-1 text-3xl font-bold text-red-600">
                                        {statistiques.dossiersIncomplets}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {statistiques.tauxDossiersIncomplets}%
                                        de l'effectif
                                    </p>
                                </div>

                                <div className="rounded-lg bg-red-100 px-3 py-2 text-xl">
                                    !
                                </div>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-red-500"
                                    style={{
                                        width: `${statistiques.tauxDossiersIncomplets}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Taux de féminisation
                            </p>

                            <p className="mt-1 text-3xl font-bold text-pink-600">
                                {statistiques.tauxFeminisation}%
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {statistiques.filles} fille
                                {statistiques.filles > 1 ? "s" : ""} sur{" "}
                                {statistiques.total}
                            </p>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-pink-500"
                                    style={{
                                        width: `${statistiques.tauxFeminisation}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900">
                                Informations manquantes
                            </h4>

                            <p className="text-sm text-gray-500">
                                Nombre d'élèves pour lesquels chaque information
                                n'est pas renseignée.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[
                                ["Sans matricule", statistiques.sansMatricule],
                                [
                                    "Sans date de naissance",
                                    statistiques.sansDateNaissance,
                                ],
                                [
                                    "Sans lieu de naissance",
                                    statistiques.sansLieuNaissance,
                                ],
                                [
                                    "Sans nationalité",
                                    statistiques.sansNationalite,
                                ],
                                ["Sans sexe", statistiques.sansSexe],
                                ["Sans niveau", statistiques.sansNiveau],
                                ["Sans classe", statistiques.sansClasse],
                                ["Sans statut", statistiques.sansStatut],
                                ["Sans régime", statistiques.sansRegime],
                                ["Sans téléphone", statistiques.sansTelephone],
                                ["Sans email", statistiques.sansEmail],
                                ["Sans adresse", statistiques.sansAdresse],
                                [
                                    "Sans responsable légal",
                                    statistiques.sansResponsable,
                                ],
                                [
                                    "Sans téléphone du responsable",
                                    statistiques.sansTelephoneResponsable,
                                ],
                                [
                                    "Sans email du responsable",
                                    statistiques.sansEmailResponsable,
                                ],
                                [
                                    "Sans profession du responsable",
                                    statistiques.sansProfessionResponsable,
                                ],
                            ].map(([label, valeur]) => (
                                <div
                                    key={label}
                                    className="rounded-lg bg-gray-50 p-4"
                                >
                                    <p className="text-sm text-gray-600">
                                        {label}
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-orange-600">
                                        {valeur}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    RÉPARTITION
                ====================================================== */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h3 className="mb-4 font-semibold text-gray-900">
                            Répartition par niveau
                        </h3>

                        <div className="space-y-3">
                            {Object.entries(statistiques.repartitionNiveaux)
                                .sort((a, b) => b[1] - a[1])
                                .map(([niveau, nombre]) => (
                                    <div
                                        key={niveau}
                                        className="flex items-center justify-between border-b pb-2 last:border-b-0"
                                    >
                                        <span className="text-sm text-gray-700">
                                            {niveau}
                                        </span>

                                        <span className="font-semibold text-gray-900">
                                            {nombre}
                                        </span>
                                    </div>
                                ))}

                            {Object.keys(statistiques.repartitionNiveaux)
                                .length === 0 && (
                                <p className="text-sm text-gray-500">
                                    Aucune donnée.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h3 className="mb-4 font-semibold text-gray-900">
                            Répartition par classe
                        </h3>

                        <div className="max-h-[400px] space-y-3 overflow-y-auto">
                            {Object.entries(statistiques.repartitionClasses)
                                .sort((a, b) => b[1] - a[1])
                                .map(([classe, nombre]) => (
                                    <div
                                        key={classe}
                                        className="flex items-center justify-between border-b pb-2 last:border-b-0"
                                    >
                                        <span className="text-sm text-gray-700">
                                            {classe}
                                        </span>

                                        <span className="font-semibold text-gray-900">
                                            {nombre}
                                        </span>
                                    </div>
                                ))}

                            {Object.keys(statistiques.repartitionClasses)
                                .length === 0 && (
                                <p className="text-sm text-gray-500">
                                    Aucune donnée.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
