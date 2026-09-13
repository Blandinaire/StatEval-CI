import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

export default function Index({
    eleves,
    elevesModifiables = null,
    peutSupprimer = false,
}) {
    /*
    |--------------------------------------------------------------------------
    | FILTRES
    |--------------------------------------------------------------------------
    */

    const [recherche, setRecherche] = useState("");
    const [niveauId, setNiveauId] = useState("");
    const [classeId, setClasseId] = useState("");
    const [filtresOuverts, setFiltresOuverts] = useState("");
    const [filtreQualite, setFiltreQualite] = useState("");

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
                { id: "date_naissance", label: "Date de naissance" },
                { id: "lieu_naissance", label: "Lieu de naissance" },
                { id: "nationalite", label: "Nationalité" },
            ],
        },

        scolarite: {
            label: "Scolarité",
            colonnes: [
                { id: "annee_scolaire", label: "Année scolaire" },
                { id: "etablissement", label: "Établissement" },
                { id: "cycle", label: "Cycle" },
                { id: "niveau", label: "Niveau" },
                { id: "classe", label: "Classe" },
                { id: "serie", label: "Série" },
                { id: "statut", label: "Statut" },
                { id: "statut_affectation", label: "Statut affectation" },
                { id: "regime", label: "Régime" },
                { id: "redoublant", label: "Redoublant" },
                { id: "boursier", label: "Boursier" },
            ],
        },

        eleve: {
            label: "Coordonnées de l'élève",
            colonnes: [
                { id: "telephone", label: "Téléphone" },
                { id: "email", label: "Email" },
                { id: "adresse", label: "Adresse" },
            ],
        },

        tuteur: {
            label: "Responsable légal",
            colonnes: [
                { id: "type_tuteur", label: "Type de tuteur" },
                { id: "responsable_nom", label: "Nom du responsable" },
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
                { id: "pere_nom", label: "Nom du père" },
                { id: "pere_prenoms", label: "Prénoms du père" },
                { id: "pere_telephone", label: "Téléphone du père" },
                { id: "pere_email", label: "Email du père" },
                { id: "pere_profession", label: "Profession du père" },
                { id: "pere_adresse", label: "Adresse du père" },
            ],
        },

        mere: {
            label: "Mère",
            colonnes: [
                { id: "mere_nom", label: "Nom de la mère" },
                { id: "mere_prenoms", label: "Prénoms de la mère" },
                { id: "mere_telephone", label: "Téléphone de la mère" },
                { id: "mere_email", label: "Email de la mère" },
                { id: "mere_profession", label: "Profession de la mère" },
                { id: "mere_adresse", label: "Adresse de la mère" },
            ],
        },
    };

    /*
    |--------------------------------------------------------------------------
    | COLONNES PAR DÉFAUT
    |--------------------------------------------------------------------------
    */

    const colonnesParDefaut = [
        "matricule",
        "nom",
        "prenoms",
        "sexe",
        "niveau",
        "classe",
        "statut",
    ];

    /*
    |--------------------------------------------------------------------------
    | ÉTAT DES COLONNES
    |--------------------------------------------------------------------------
    */

    const [colonnesSelectionnees, setColonnesSelectionnees] = useState(() => {
        try {
            const sauvegarde = localStorage.getItem("stateval_eleves_colonnes");

            return sauvegarde ? JSON.parse(sauvegarde) : colonnesParDefaut;
        } catch {
            return colonnesParDefaut;
        }
    });

    const [menuColonnesOuvert, setMenuColonnesOuvert] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | SAUVEGARDE DES COLONNES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        localStorage.setItem(
            "stateval_eleves_colonnes",
            JSON.stringify(colonnesSelectionnees),
        );
    }, [colonnesSelectionnees]);

    /*
    |--------------------------------------------------------------------------
    | NORMALISATION
    |--------------------------------------------------------------------------
    */

    const normaliser = (valeur) => {
        return String(valeur ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    };

    /*
    |--------------------------------------------------------------------------
    | NIVEAUX
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

    /*
    |--------------------------------------------------------------------------
    | CLASSES
    |--------------------------------------------------------------------------
    */

    const classes = useMemo(() => {
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
    | FILTRAGE DES ÉLÈVES
    |--------------------------------------------------------------------------
    */

    const elevesFiltres = useMemo(() => {
        const terme = normaliser(recherche);

        const estVide = (valeur) => {
            return (
                valeur === null ||
                valeur === undefined ||
                String(valeur).trim() === ""
            );
        };

        const dossierEstComplet = (eleve) => {
            const champsPrincipaux = [
                eleve.matricule,
                eleve.date_naissance,
                eleve.lieu_naissance,
                eleve.nationalite,
                eleve.sexe,
            ];

            return champsPrincipaux.every((champ) => !estVide(champ));
        };

        return eleves.filter((eleve) => {
            /*
        |--------------------------------------------------------------------------
        | RECHERCHE
        |--------------------------------------------------------------------------
        */

            const correspondRecherche =
                !terme ||
                normaliser(eleve.nom).includes(terme) ||
                normaliser(eleve.prenoms).includes(terme) ||
                normaliser(eleve.matricule).includes(terme) ||
                normaliser(eleve.code_eleve).includes(terme);

            /*
        |--------------------------------------------------------------------------
        | NIVEAU
        |--------------------------------------------------------------------------
        */

            const correspondNiveau =
                !niveauId ||
                String(eleve.classe?.niveau_id) === String(niveauId);

            /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

            const correspondClasse =
                !classeId || String(eleve.classe_id) === String(classeId);

            /*
        |--------------------------------------------------------------------------
        | QUALITÉ DU DOSSIER
        |--------------------------------------------------------------------------
        */

            let correspondQualite = true;

            if (filtreQualite === "complet") {
                correspondQualite = dossierEstComplet(eleve);
            }

            if (filtreQualite === "incomplet") {
                correspondQualite = !dossierEstComplet(eleve);
            }

            if (filtreQualite === "sans_matricule") {
                correspondQualite = estVide(eleve.matricule);
            }

            if (filtreQualite === "sans_date_naissance") {
                correspondQualite = estVide(eleve.date_naissance);
            }

            if (filtreQualite === "sans_lieu_naissance") {
                correspondQualite = estVide(eleve.lieu_naissance);
            }

            if (filtreQualite === "sans_nationalite") {
                correspondQualite = estVide(eleve.nationalite);
            }

            if (filtreQualite === "sans_telephone") {
                correspondQualite = estVide(eleve.telephone);
            }

            if (filtreQualite === "sans_email") {
                correspondQualite = estVide(eleve.email);
            }

            if (filtreQualite === "sans_adresse") {
                correspondQualite = estVide(eleve.adresse);
            }

            if (filtreQualite === "sans_responsable") {
                correspondQualite =
                    estVide(eleve.responsable_nom) &&
                    estVide(eleve.responsable_prenoms);
            }

            if (filtreQualite === "sans_telephone_responsable") {
                correspondQualite = estVide(eleve.responsable_telephone);
            }

            return (
                correspondRecherche &&
                correspondNiveau &&
                correspondClasse &&
                correspondQualite
            );
        });
    }, [eleves, recherche, niveauId, classeId, filtreQualite]);

    /*
|--------------------------------------------------------------------------
| STATISTIQUES
|--------------------------------------------------------------------------
*/

    const statistiques = useMemo(() => {
        const total = elevesFiltres.length;

        /*
    |--------------------------------------------------------------------------
    | OUTILS
    |--------------------------------------------------------------------------
    */

        const estVide = (valeur) => {
            return (
                valeur === null ||
                valeur === undefined ||
                String(valeur).trim() === ""
            );
        };

        const estVrai = (valeur) => {
            if (
                valeur === true ||
                valeur === 1 ||
                valeur === "1" ||
                normaliser(valeur) === "oui" ||
                normaliser(valeur) === "true"
            ) {
                return true;
            }

            return false;
        };

        const sexeFeminin = (eleve) => normaliser(eleve.sexe) === "feminin";

        const sexeMasculin = (eleve) => normaliser(eleve.sexe) === "masculin";

        const pourcentage = (nombre) => {
            if (total === 0) {
                return 0;
            }

            return Math.round((nombre / total) * 100);
        };

        /*
    |--------------------------------------------------------------------------
    | GENRE
    |--------------------------------------------------------------------------
    */

        const filles = elevesFiltres.filter(sexeFeminin);

        const garcons = elevesFiltres.filter(sexeMasculin);

        const sexeNonRenseigne = elevesFiltres.filter(
            (eleve) => !sexeFeminin(eleve) && !sexeMasculin(eleve),
        );

        /*
    |--------------------------------------------------------------------------
    | REDOUBLEMENT
    |--------------------------------------------------------------------------
    */

        const redoublants = elevesFiltres.filter((eleve) =>
            estVrai(eleve.redoublant),
        );

        const redoublantes = redoublants.filter(sexeFeminin);

        const redoublantsGarcons = redoublants.filter(sexeMasculin);

        /*
    |--------------------------------------------------------------------------
    | AFFECTATION
    |--------------------------------------------------------------------------
    */

        const affectes = elevesFiltres.filter(
            (eleve) => normaliser(eleve.statut_affectation) === "affecte",
        );

        const nonAffectes = elevesFiltres.filter(
            (eleve) => normaliser(eleve.statut_affectation) === "non affecte",
        );

        const statutAffectationNonRenseigne = elevesFiltres.filter((eleve) =>
            estVide(eleve.statut_affectation),
        );

        /*
    |--------------------------------------------------------------------------
    | BOURSIERS
    |--------------------------------------------------------------------------
    */

        const boursiers = elevesFiltres.filter((eleve) =>
            estVrai(eleve.boursier),
        );

        const boursieres = boursiers.filter(sexeFeminin);

        const boursiersGarcons = boursiers.filter(sexeMasculin);

        /*
    |--------------------------------------------------------------------------
    | INFORMATIONS D'IDENTITÉ MANQUANTES
    |--------------------------------------------------------------------------
    */

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

        /*
    |--------------------------------------------------------------------------
    | INFORMATIONS SCOLAIRES MANQUANTES
    |--------------------------------------------------------------------------
    */

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

        /*
    |--------------------------------------------------------------------------
    | COORDONNÉES DE L'ÉLÈVE
    |--------------------------------------------------------------------------
    */

        const sansTelephone = elevesFiltres.filter((eleve) =>
            estVide(eleve.telephone),
        );

        const sansEmail = elevesFiltres.filter((eleve) => estVide(eleve.email));

        const sansAdresse = elevesFiltres.filter((eleve) =>
            estVide(eleve.adresse),
        );

        /*
    |--------------------------------------------------------------------------
    | RESPONSABLE LÉGAL
    |--------------------------------------------------------------------------
    */

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

        /*
    |--------------------------------------------------------------------------
    | DOSSIER D'IDENTITÉ COMPLET
    |--------------------------------------------------------------------------
    */

        const champsIdentite = [
            "matricule",
            "nom",
            "prenoms",
            "sexe",
            "date_naissance",
            "lieu_naissance",
            "nationalite",
        ];

        const estIdentiteComplete = (eleve) => {
            return champsIdentite.every((champ) => !estVide(eleve[champ]));
        };

        const identitesCompletes = elevesFiltres.filter(estIdentiteComplete);

        const identitesIncompletes = elevesFiltres.filter(
            (eleve) => !estIdentiteComplete(eleve),
        );

        /*
    |--------------------------------------------------------------------------
    | DOSSIER SCOLAIRE COMPLET
    |--------------------------------------------------------------------------
    */

        const estScolariteComplete = (eleve) => {
            return (
                !estVide(eleve.classe?.niveau?.libelle) &&
                !estVide(eleve.classe?.libelle) &&
                !estVide(eleve.statut) &&
                !estVide(eleve.statut_affectation) &&
                !estVide(eleve.regime)
            );
        };

        const scolaritesCompletes = elevesFiltres.filter(estScolariteComplete);

        /*
    |--------------------------------------------------------------------------
    | DOSSIER GLOBAL COMPLET
    |--------------------------------------------------------------------------
    */

        const estDossierComplet = (eleve) => {
            return (
                estIdentiteComplete(eleve) &&
                estScolariteComplete(eleve) &&
                !estVide(eleve.responsable_nom) &&
                !estVide(eleve.responsable_prenoms) &&
                !estVide(eleve.responsable_telephone)
            );
        };

        const dossiersComplets = elevesFiltres.filter(estDossierComplet);

        const dossiersIncomplets = elevesFiltres.filter(
            (eleve) => !estDossierComplet(eleve),
        );

        /*
    |--------------------------------------------------------------------------
    | TAUX DE COMPLÉTUDE
    |--------------------------------------------------------------------------
    */

        const tauxIdentiteComplete = pourcentage(identitesCompletes.length);

        const tauxScolariteComplete = pourcentage(scolaritesCompletes.length);

        const tauxDossiersComplets = pourcentage(dossiersComplets.length);

        const tauxDossiersIncomplets = pourcentage(dossiersIncomplets.length);

        /*
    |--------------------------------------------------------------------------
    | RÉPARTITION PAR NIVEAU
    |--------------------------------------------------------------------------
    */

        const repartitionNiveaux = {};

        elevesFiltres.forEach((eleve) => {
            const niveau = eleve.classe?.niveau?.libelle || "Non renseigné";

            repartitionNiveaux[niveau] = (repartitionNiveaux[niveau] || 0) + 1;
        });

        /*
    |--------------------------------------------------------------------------
    | RÉPARTITION PAR CLASSE
    |--------------------------------------------------------------------------
    */

        const repartitionClasses = {};

        elevesFiltres.forEach((eleve) => {
            const classe = eleve.classe?.libelle || "Non renseignée";

            repartitionClasses[classe] = (repartitionClasses[classe] || 0) + 1;
        });

        /*
    |--------------------------------------------------------------------------
    | RETOUR
    |--------------------------------------------------------------------------
    */

        return {
            /*
        |--------------------------------------------------------------------------
        | EFFECTIF
        |--------------------------------------------------------------------------
        */

            total,

            filles: filles.length,
            garcons: garcons.length,
            sexeNonRenseigne: sexeNonRenseigne.length,

            tauxFeminisation: pourcentage(filles.length),

            tauxGarcons: pourcentage(garcons.length),

            /*
        |--------------------------------------------------------------------------
        | REDOUBLEMENT
        |--------------------------------------------------------------------------
        */

            redoublants: redoublants.length,

            redoublantes: redoublantes.length,

            redoublantsGarcons: redoublantsGarcons.length,

            tauxRedoublement: pourcentage(redoublants.length),

            /*
        |--------------------------------------------------------------------------
        | AFFECTATION
        |--------------------------------------------------------------------------
        */

            affectes: affectes.length,

            affecteesFilles: affectes.filter(sexeFeminin).length,

            affectesGarcons: affectes.filter(sexeMasculin).length,

            tauxAffectation: pourcentage(affectes.length),

            nonAffectes: nonAffectes.length,

            nonAffecteesFilles: nonAffectes.filter(sexeFeminin).length,

            nonAffectesGarcons: nonAffectes.filter(sexeMasculin).length,

            tauxNonAffectation: pourcentage(nonAffectes.length),

            statutAffectationNonRenseigne: statutAffectationNonRenseigne.length,

            /*
        |--------------------------------------------------------------------------
        | BOURSIERS
        |--------------------------------------------------------------------------
        */

            boursiers: boursiers.length,

            boursieres: boursieres.length,

            boursiersGarcons: boursiersGarcons.length,

            tauxBoursiers: pourcentage(boursiers.length),

            /*
        |--------------------------------------------------------------------------
        | INFORMATIONS MANQUANTES
        |--------------------------------------------------------------------------
        */

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

            /*
        |--------------------------------------------------------------------------
        | QUALITÉ DES DOSSIERS
        |--------------------------------------------------------------------------
        */

            identitesCompletes: identitesCompletes.length,

            identitesIncompletes: identitesIncompletes.length,

            tauxIdentiteComplete,

            scolaritesCompletes: scolaritesCompletes.length,

            tauxScolariteComplete,

            dossiersComplets: dossiersComplets.length,

            dossiersIncomplets: dossiersIncomplets.length,

            tauxDossiersComplets,

            tauxDossiersIncomplets,

            /*
        |--------------------------------------------------------------------------
        | RÉPARTITIONS
        |--------------------------------------------------------------------------
        */

            repartitionNiveaux,

            repartitionClasses,
        };
    }, [elevesFiltres]);

    {
        /* =====================================================
    QUALITÉ DES DONNÉES
===================================================== */
    }

    <div className="mt-6">
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
                Qualité des données
            </h3>

            <p className="text-sm text-gray-500">
                Vérification des informations renseignées pour les élèves
                actuellement affichés.
            </p>
        </div>

        {/* Résumé général */}

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
                            {statistiques.tauxDossiersComplets}% de l'effectif
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
                            {statistiques.tauxDossiersIncomplets}% de l'effectif
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

        {/* Informations manquantes */}

        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h4 className="font-semibold text-gray-900">
                    Informations manquantes
                </h4>

                <p className="text-sm text-gray-500">
                    Nombre d'élèves pour lesquels chaque information n'est pas
                    renseignée.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-gray-600">Sans matricule</p>

                    <p className="mt-1 text-2xl font-bold text-red-600">
                        {statistiques.sansMatricule}
                    </p>
                </div>

                <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-sm text-gray-600">
                        Sans date de naissance
                    </p>

                    <p className="mt-1 text-2xl font-bold text-orange-600">
                        {statistiques.sansDateNaissance}
                    </p>
                </div>

                <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-sm text-gray-600">
                        Sans lieu de naissance
                    </p>

                    <p className="mt-1 text-2xl font-bold text-orange-600">
                        {statistiques.sansLieuNaissance}
                    </p>
                </div>

                <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-sm text-gray-600">Sans nationalité</p>

                    <p className="mt-1 text-2xl font-bold text-orange-600">
                        {statistiques.sansNationalite}
                    </p>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4">
                    <p className="text-sm text-gray-600">Sans téléphone</p>

                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                        {statistiques.sansTelephone}
                    </p>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4">
                    <p className="text-sm text-gray-600">Sans email</p>

                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                        {statistiques.sansEmail}
                    </p>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4">
                    <p className="text-sm text-gray-600">Sans adresse</p>

                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                        {statistiques.sansAdresse}
                    </p>
                </div>

                <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-gray-600">
                        Sans responsable légal
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-600">
                        {statistiques.sansResponsable}
                    </p>
                </div>

                <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-gray-600">
                        Sans téléphone du responsable
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-600">
                        {statistiques.sansTelephoneResponsable}
                    </p>
                </div>
            </div>
        </div>
    </div>;

    /*
    |--------------------------------------------------------------------------
    | RÉINITIALISATION DES FILTRES
    |--------------------------------------------------------------------------
    */

    const reinitialiserFiltres = () => {
        setRecherche("");
        setNiveauId("");
        setClasseId("");
        setFiltreQualite("");
    };

    /*
    |--------------------------------------------------------------------------
    | GESTION DES COLONNES
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
    | AFFICHAGE D'UNE CELLULE
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
                return eleve.redoublant ? "Oui" : "Non";

            case "boursier":
                return eleve.boursier ? "Oui" : "Non";

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

    /*
    |--------------------------------------------------------------------------
    | LABEL D'UNE COLONNE
    |--------------------------------------------------------------------------
    */

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
| EXPORTS
|--------------------------------------------------------------------------
*/

    /**
     * Prépare les données selon les colonnes actuellement sélectionnées.
     */
    const donneesExport = useMemo(() => {
        return elevesFiltres.map((eleve) => {
            const ligne = {};

            colonnesSelectionnees.forEach((colonne) => {
                ligne[labelColonne(colonne)] = afficherValeur(eleve, colonne);
            });

            return ligne;
        });
        const pourcentage = (nombre) => {
            if (total === 0) {
                return 0;
            }

            return Math.round((nombre / total) * 100);
        };
    }, [elevesFiltres, colonnesSelectionnees]);

    /**
     * Nom de fichier sécurisé.
     */
    const nomFichierExport = () => {
        let nom = "liste_eleves";

        if (niveauId) {
            const niveau = niveaux.find(
                (niveau) => String(niveau.id) === String(niveauId),
            );

            if (niveau) {
                nom += `_${normaliser(niveau.libelle).replace(/\s+/g, "_")}`;
            }
        }

        if (classeId) {
            const classe = classes.find(
                (classe) => String(classe.id) === String(classeId),
            );

            if (classe) {
                nom += `_${normaliser(classe.libelle).replace(/\s+/g, "_")}`;
            }
        }

        return nom;
    };

    /*
|--------------------------------------------------------------------------
| EXPORT EXCEL
|--------------------------------------------------------------------------
*/

    const exporterExcel = () => {
        if (elevesFiltres.length === 0) {
            return;
        }

        const donnees = elevesFiltres.map((eleve) => {
            const ligne = {};

            colonnesSelectionnees.forEach((colonne) => {
                ligne[labelColonne(colonne)] = afficherValeur(eleve, colonne);
            });

            return ligne;
        });

        const feuille = XLSX.utils.json_to_sheet(donnees);

        const classeur = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(classeur, feuille, "Élèves");

        XLSX.writeFile(classeur, "liste-eleves.xlsx");
    };

    /*
|--------------------------------------------------------------------------
| EXPORT CSV
|--------------------------------------------------------------------------
*/

    const exporterCSV = () => {
        if (elevesFiltres.length === 0) {
            return;
        }

        const donnees = elevesFiltres.map((eleve) => {
            const ligne = {};

            colonnesSelectionnees.forEach((colonne) => {
                ligne[labelColonne(colonne)] = afficherValeur(eleve, colonne);
            });

            return ligne;
        });

        const feuille = XLSX.utils.json_to_sheet(donnees);

        const csv = XLSX.utils.sheet_to_csv(feuille, {
            FS: ";",
        });

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const lien = document.createElement("a");

        lien.href = url;
        lien.download = "liste-eleves.csv";

        document.body.appendChild(lien);

        lien.click();

        document.body.removeChild(lien);

        URL.revokeObjectURL(url);
    };

    /*
|--------------------------------------------------------------------------
| IMPRESSION
|--------------------------------------------------------------------------
*/

    const imprimerListe = () => {
        if (elevesFiltres.length === 0) {
            return;
        }

        const fenetre = window.open("", "_blank", "width=1200,height=800");

        if (!fenetre) {
            alert(
                "La fenêtre d'impression a été bloquée par votre navigateur.",
            );

            return;
        }

        const titre = niveauId
            ? `Liste des élèves - ${
                  niveaux.find(
                      (niveau) => String(niveau.id) === String(niveauId),
                  )?.libelle ?? ""
              }`
            : classeId
              ? `Liste des élèves - ${
                    classes.find(
                        (classe) => String(classe.id) === String(classeId),
                    )?.libelle ?? ""
                }`
              : "Liste des élèves";

        const entetes = colonnesSelectionnees
            .map((colonne) => `<th>${labelColonne(colonne)}</th>`)
            .join("");

        const lignes = elevesFiltres
            .map((eleve) => {
                const cellules = colonnesSelectionnees
                    .map(
                        (colonne) =>
                            `<td>${afficherValeur(eleve, colonne)}</td>`,
                    )
                    .join("");

                return `<tr>${cellules}</tr>`;
            })
            .join("");

        fenetre.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">

            <title>${titre}</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 30px;
                    color: #111827;
                }

                h1 {
                    font-size: 22px;
                    margin-bottom: 5px;
                }

                .informations {
                    color: #6b7280;
                    margin-bottom: 20px;
                    font-size: 13px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }

                th {
                    background: #f3f4f6;
                    font-weight: bold;
                }

                th,
                td {
                    border: 1px solid #d1d5db;
                    padding: 7px;
                    text-align: left;
                }

                tr:nth-child(even) {
                    background: #f9fafb;
                }

                .pied {
                    margin-top: 20px;
                    font-size: 11px;
                    color: #6b7280;
                }

                @media print {
                    body {
                        margin: 10mm;
                    }
                }
            </style>
        </head>

        <body>

            <h1>${titre}</h1>

            <div class="informations">
                ${elevesFiltres.length} élève${
                    elevesFiltres.length > 1 ? "s" : ""
                }
            </div>

            <table>

                <thead>
                    <tr>
                        ${entetes}
                    </tr>
                </thead>

                <tbody>
                    ${lignes}
                </tbody>

            </table>

            <div class="pied">
                Document généré par StatEval-CI
            </div>

        </body>
        </html>
    `);

        fenetre.document.close();

        fenetre.focus();

        setTimeout(() => {
            fenetre.print();
        }, 300);
    };

    /*
    |--------------------------------------------------------------------------
    | RENDU
    |--------------------------------------------------------------------------
    */

    return (
        <AdminLayout>
            <Head title="Élèves" />

            <div className="min-w-0 max-w-full space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Élèves</h1>

                        <p className="text-gray-500">Gestion des élèves</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route("eleves.import.form")}
                            className="rounded-lg border border-green-600 px-5 py-3 font-medium text-green-700 hover:bg-green-50"
                        >
                            📥 Importer les élèves
                        </Link>

                        <Link
                            href={route("eleves.create")}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                        >
                            + Nouvel élève
                        </Link>
                    </div>
                </div>

                {/* =====================================================
                    FILTRES
                ===================================================== */}

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Rechercher un élève
                            </h2>

                            <p className="text-sm text-gray-500">
                                Filtrez les élèves par niveau, classe, nom,
                                prénoms ou matricule.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setFiltresOuverts(!filtresOuverts)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            {filtresOuverts
                                ? "▲ Replier"
                                : "▼ Afficher les filtres"}
                        </button>
                    </div>

                    {filtresOuverts && (
                        <div className="mt-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Niveau
                                    </label>

                                    <select
                                        value={niveauId}
                                        onChange={(e) => {
                                            setNiveauId(e.target.value);
                                            setClasseId("");
                                        }}
                                        className="w-full rounded-lg border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
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
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Classe
                                    </label>

                                    <select
                                        value={classeId}
                                        onChange={(e) =>
                                            setClasseId(e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Toutes les classes
                                        </option>

                                        {classes.map((classe) => (
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
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Recherche
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={recherche}
                                            onChange={(e) =>
                                                setRecherche(e.target.value)
                                            }
                                            placeholder="Nom, prénoms, matricule..."
                                            className="w-full rounded-lg border-gray-300 px-4 py-3 pr-10 focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            🔍
                                        </span>
                                    </div>
                                </div>
                                {/* Qualité du dossier */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Qualité du dossier
                                    </label>

                                    <select
                                        value={filtreQualite}
                                        onChange={(e) =>
                                            setFiltreQualite(e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Toutes les informations
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

                            <div className="mt-5 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">
                                        {elevesFiltres.length}
                                    </span>{" "}
                                    élève
                                    {elevesFiltres.length > 1 ? "s" : ""}{" "}
                                    affiché
                                    {elevesFiltres.length > 1 ? "s" : ""}
                                    {elevesFiltres.length !== eleves.length && (
                                        <>
                                            {" "}
                                            sur{" "}
                                            <span className="font-semibold">
                                                {eleves.length}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={reinitialiserFiltres}
                                    disabled={
                                        !recherche &&
                                        !niveauId &&
                                        !classeId &&
                                        !filtreQualite
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* =====================================================
                    BARRE DES COLONNES
                ===================================================== */}

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Liste des élèves
                        </h2>

                        <p className="text-sm text-gray-500">
                            {colonnesSelectionnees.length} colonne
                            {colonnesSelectionnees.length > 1 ? "s" : ""}{" "}
                            affichée
                            {colonnesSelectionnees.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        {/* =====================================================
        EXPORT EXCEL
    ===================================================== */}

                        <button
                            type="button"
                            onClick={exporterExcel}
                            disabled={elevesFiltres.length === 0}
                            className="rounded-lg border border-green-600 bg-white px-4 py-2 font-medium text-green-700 shadow-sm hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            📊 Excel
                        </button>

                        {/* =====================================================
        EXPORT CSV
    ===================================================== */}

                        <button
                            type="button"
                            onClick={exporterCSV}
                            disabled={elevesFiltres.length === 0}
                            className="rounded-lg border border-blue-600 bg-white px-4 py-2 font-medium text-blue-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            📄 CSV
                        </button>

                        {/* =====================================================
        IMPRESSION
    ===================================================== */}

                        <button
                            type="button"
                            onClick={imprimerListe}
                            disabled={elevesFiltres.length === 0}
                            className="rounded-lg border border-gray-400 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            🖨 Imprimer
                        </button>

                        {/* =====================================================
        MENU COLONNES
    ===================================================== */}

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setMenuColonnesOuvert(!menuColonnesOuvert)
                                }
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                ⚙ Colonnes
                            </button>

                            {menuColonnesOuvert && (
                                <div className="absolute right-0 z-50 mt-2 w-96 rounded-xl border bg-white p-4 shadow-xl">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">
                                                Colonnes à afficher
                                            </h3>

                                            <p className="text-xs text-gray-500">
                                                Personnalisez votre tableau.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMenuColonnesOuvert(false)
                                            }
                                            className="text-gray-400 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Vues */}

                                    <div className="mb-4 border-b pb-4">
                                        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                                            Vues rapides
                                        </p>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    appliquerVue("standard")
                                                }
                                                className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                                            >
                                                Standard
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    appliquerVue(
                                                        "administrative",
                                                    )
                                                }
                                                className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                                            >
                                                Administrative
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    appliquerVue("parents")
                                                }
                                                className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                                            >
                                                Parents
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    appliquerVue("complete")
                                                }
                                                className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                                            >
                                                Complète
                                            </button>
                                        </div>
                                    </div>

                                    {/* Colonnes */}

                                    <div className="max-h-[500px] space-y-5 overflow-y-auto">
                                        {Object.entries(
                                            colonnesDisponibles,
                                        ).map(([key, groupe]) => (
                                            <div key={key}>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                                                    {groupe.label}
                                                </p>

                                                <div className="space-y-2">
                                                    {groupe.colonnes.map(
                                                        (colonne) => (
                                                            <label
                                                                key={colonne.id}
                                                                className="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-gray-50"
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
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />

                                                                <span className="text-sm text-gray-700">
                                                                    {
                                                                        colonne.label
                                                                    }
                                                                </span>
                                                            </label>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    TABLEAU
                ===================================================== */}

                <div className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="min-h-[260px] max-h-[60vh] min-w-0 overflow-auto">
                        <table className="min-w-max w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    {colonnesSelectionnees.map((colonne) => {
                                        const classeColonne =
                                            colonne === "matricule"
                                                ? "sticky top-0 left-0 z-40 w-[110px] min-w-[110px] bg-gray-100"
                                                : "sticky top-0 z-30 bg-gray-100";

                                        return (
                                            <th
                                                key={colonne}
                                                className={`whitespace-nowrap border-b p-3 text-left ${classeColonne}`}
                                            >
                                                {labelColonne(colonne)}
                                            </th>
                                        );
                                    })}

                                    <th className="sticky top-0 z-30 whitespace-nowrap border-b bg-gray-100 p-3 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {elevesFiltres.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                colonnesSelectionnees.length + 1
                                            }
                                            className="p-10 text-center"
                                        >
                                            <div className="text-4xl">🔍</div>

                                            <p className="mt-3 font-medium text-gray-700">
                                                Aucun élève trouvé
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Essayez de modifier vos critères
                                                de recherche.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={reinitialiserFiltres}
                                                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                Réinitialiser
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    elevesFiltres.map((eleve) => (
                                        <tr
                                            key={eleve.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            {colonnesSelectionnees.map(
                                                (colonne) => {
                                                    const classeColonne =
                                                        colonne === "matricule"
                                                            ? "sticky left-0 z-20 w-[110px] min-w-[110px] bg-white"
                                                            : "";

                                                    return (
                                                        <td
                                                            key={colonne}
                                                            className={`whitespace-nowrap border-b p-3 ${classeColonne}`}
                                                        >
                                                            {afficherValeur(
                                                                eleve,
                                                                colonne,
                                                            )}
                                                        </td>
                                                    );
                                                },
                                            )}

                                            <td className="whitespace-nowrap p-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route(
                                                            "eleves.show",
                                                            eleve.id,
                                                        )}
                                                        aria-label="Voir l'élève"
                                                        title="Voir l'élève"
                                                        className="inline-flex items-center justify-center rounded bg-gray-700 p-2 text-white hover:bg-gray-800 sm:gap-1 sm:px-3 sm:py-1"
                                                    >
                                                        <Eye size={16} />
                                                        <span className="hidden sm:inline">
                                                            Voir
                                                        </span>
                                                    </Link>

                                                    {(elevesModifiables ===
                                                        null ||
                                                        elevesModifiables.some(
                                                            (id) =>
                                                                String(id) ===
                                                                String(
                                                                    eleve.id,
                                                                ),
                                                        )) && (
                                                        <Link
                                                            href={route(
                                                                "eleves.edit",
                                                                eleve.id,
                                                            )}
                                                            aria-label="Modifier l'élève"
                                                            title="Modifier l'élève"
                                                            className="inline-flex items-center justify-center rounded bg-blue-600 p-2 text-white hover:bg-blue-700 sm:gap-1 sm:px-3 sm:py-1"
                                                        >
                                                            <Pencil size={16} />
                                                            <span className="hidden sm:inline">
                                                                Modifier
                                                            </span>
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
                                                            aria-label="Supprimer l'élève"
                                                            title="Supprimer l'élève"
                                                            className="inline-flex items-center justify-center rounded bg-red-600 p-2 text-white hover:bg-red-700 sm:gap-1 sm:px-3 sm:py-1"
                                                        >
                                                            <Trash2 size={16} />
                                                            <span className="hidden sm:inline">
                                                                Supprimer
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* =====================================================
    STATISTIQUES
===================================================== */}

                <div className="mt-6 space-y-6">
                    {/* -------------------------------------------------
        TITRE
    ------------------------------------------------- */}

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Statistiques
                        </h2>

                        <p className="text-sm text-gray-500">
                            Statistiques calculées automatiquement sur les
                            élèves actuellement affichés.
                        </p>
                    </div>

                    {/* =================================================
        1. EFFECTIF ET GENRE
    ================================================= */}

                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Effectif et genre
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {/* Effectif total */}

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Effectif total
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            {statistiques.total}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            élèves affichés
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-100 px-3 py-2 text-xl">
                                        👥
                                    </div>
                                </div>
                            </div>

                            {/* Filles */}

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Filles
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-pink-600">
                                            {statistiques.filles}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {statistiques.tauxFeminisation}% de
                                            l'effectif
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-pink-100 px-3 py-2 text-xl">
                                        👧
                                    </div>
                                </div>
                            </div>

                            {/* Garçons */}

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Garçons
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-blue-600">
                                            {statistiques.garcons}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {statistiques.tauxGarcons}% de
                                            l'effectif
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-100 px-3 py-2 text-xl">
                                        👦
                                    </div>
                                </div>
                            </div>

                            {/* Taux de féminisation */}

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Taux de féminisation
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-purple-600">
                                            {statistiques.tauxFeminisation}%
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            part des filles
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-purple-100 px-3 py-2 text-xl">
                                        ♀
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
        2. SCOLARITÉ ET AFFECTATION
    ================================================= */}

                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Scolarité et affectation
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {/* Redoublants */}

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Redoublants
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-orange-600">
                                            {statistiques.redoublants}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {statistiques.tauxRedoublement}% de
                                            l'effectif
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-orange-100 px-3 py-2 text-xl">
                                        🔄
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-pink-50 p-2">
                                        <p className="text-xs text-gray-500">
                                            Filles
                                        </p>

                                        <p className="font-bold text-pink-600">
                                            {statistiques.redoublantes}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-2">
                                        <p className="text-xs text-gray-500">
                                            Garçons
                                        </p>

                                        <p className="font-bold text-blue-600">
                                            {statistiques.redoublantsGarcons}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Affectés */}

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Élèves affectés
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-green-600">
                                            {statistiques.affectes}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {statistiques.tauxAffectation}% de
                                            l'effectif
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-green-100 px-3 py-2 text-xl">
                                        ✓
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-pink-50 p-2">
                                        <p className="text-xs text-gray-500">
                                            Filles
                                        </p>

                                        <p className="font-bold text-pink-600">
                                            {statistiques.affecteesFilles}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-2">
                                        <p className="text-xs text-gray-500">
                                            Garçons
                                        </p>

                                        <p className="font-bold text-blue-600">
                                            {statistiques.affectesGarcons}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Non affectés */}

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Élèves non affectés
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-red-600">
                                            {statistiques.nonAffectes}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {statistiques.tauxNonAffectation}%
                                            de l'effectif
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-red-100 px-3 py-2 text-xl">
                                        !
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-pink-50 p-2">
                                        <p className="text-xs text-gray-500">
                                            Filles
                                        </p>

                                        <p className="font-bold text-pink-600">
                                            {statistiques.nonAffecteesFilles}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-2">
                                        <p className="text-xs text-gray-500">
                                            Garçons
                                        </p>

                                        <p className="font-bold text-blue-600">
                                            {statistiques.nonAffectesGarcons}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Taux de redoublement */}

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Taux de redoublement
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-orange-600">
                                            {statistiques.tauxRedoublement}%
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {statistiques.redoublants} élève(s)
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-orange-100 px-3 py-2 text-xl">
                                        %
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
        3. QUALITÉ DES DOSSIERS
    ================================================= */}

                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Qualité des dossiers
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {/* Dossiers complets */}

                            <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">
                                    Dossiers complets
                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-600">
                                    {statistiques.dossiersComplets}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {statistiques.tauxDossiersComplets}% de
                                    l'effectif
                                </p>
                            </div>

                            {/* Dossiers incomplets */}

                            <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">
                                    Dossiers incomplets
                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-600">
                                    {statistiques.dossiersIncomplets}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {statistiques.tauxDossiersIncomplets}% de
                                    l'effectif
                                </p>
                            </div>

                            {/* Sans matricule */}

                            <div className="rounded-xl border border-yellow-200 bg-white p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">
                                    Sans matricule
                                </p>

                                <p className="mt-2 text-3xl font-bold text-yellow-600">
                                    {statistiques.sansMatricule}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    information manquante
                                </p>
                            </div>

                            {/* Sans date de naissance */}

                            <div className="rounded-xl border border-yellow-200 bg-white p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">
                                    Sans date de naissance
                                </p>

                                <p className="mt-2 text-3xl font-bold text-yellow-600">
                                    {statistiques.sansDateNaissance}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    information manquante
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
    4. INFORMATIONS MANQUANTES
================================================= */}

                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Informations manquantes
                        </h3>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                            {/* Lieu naissance */}
                            <div
                                onClick={() =>
                                    setFiltreQualite(
                                        filtreQualite === "sans_lieu_naissance"
                                            ? ""
                                            : "sans_lieu_naissance",
                                    )
                                }
                                className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200
                ${
                    filtreQualite === "sans_lieu_naissance"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md"
                }`}
                            >
                                <p className="text-xs text-gray-500">
                                    Sans lieu de naissance
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-700">
                                    {statistiques.sansLieuNaissance}
                                </p>
                            </div>

                            {/* Nationalité */}
                            <div
                                onClick={() =>
                                    setFiltreQualite(
                                        filtreQualite === "sans_nationalite"
                                            ? ""
                                            : "sans_nationalite",
                                    )
                                }
                                className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200
                ${
                    filtreQualite === "sans_nationalite"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md"
                }`}
                            >
                                <p className="text-xs text-gray-500">
                                    Sans nationalité
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-700">
                                    {statistiques.sansNationalite}
                                </p>
                            </div>

                            {/* Téléphone */}
                            <div
                                onClick={() =>
                                    setFiltreQualite(
                                        filtreQualite === "sans_telephone"
                                            ? ""
                                            : "sans_telephone",
                                    )
                                }
                                className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200
                ${
                    filtreQualite === "sans_telephone"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md"
                }`}
                            >
                                <p className="text-xs text-gray-500">
                                    Sans téléphone
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-700">
                                    {statistiques.sansTelephone}
                                </p>
                            </div>

                            {/* Email */}
                            <div
                                onClick={() =>
                                    setFiltreQualite(
                                        filtreQualite === "sans_email"
                                            ? ""
                                            : "sans_email",
                                    )
                                }
                                className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200
                ${
                    filtreQualite === "sans_email"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md"
                }`}
                            >
                                <p className="text-xs text-gray-500">
                                    Sans email
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-700">
                                    {statistiques.sansEmail}
                                </p>
                            </div>

                            {/* Adresse */}
                            <div
                                onClick={() =>
                                    setFiltreQualite(
                                        filtreQualite === "sans_adresse"
                                            ? ""
                                            : "sans_adresse",
                                    )
                                }
                                className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200
                ${
                    filtreQualite === "sans_adresse"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md"
                }`}
                            >
                                <p className="text-xs text-gray-500">
                                    Sans adresse
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-700">
                                    {statistiques.sansAdresse}
                                </p>
                            </div>

                            {/* Responsable */}
                            <div
                                onClick={() =>
                                    setFiltreQualite(
                                        filtreQualite === "sans_responsable"
                                            ? ""
                                            : "sans_responsable",
                                    )
                                }
                                className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200
                ${
                    filtreQualite === "sans_responsable"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md"
                }`}
                            >
                                <p className="text-xs text-gray-500">
                                    Sans responsable
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-700">
                                    {statistiques.sansResponsable}
                                </p>
                            </div>

                            {/* Téléphone responsable */}
                            <div
                                onClick={() =>
                                    setFiltreQualite(
                                        filtreQualite ===
                                            "sans_telephone_responsable"
                                            ? ""
                                            : "sans_telephone_responsable",
                                    )
                                }
                                className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200
                ${
                    filtreQualite === "sans_telephone_responsable"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md"
                }`}
                            >
                                <p className="text-xs text-gray-500">
                                    Sans tél. responsable
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-700">
                                    {statistiques.sansTelephoneResponsable}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
