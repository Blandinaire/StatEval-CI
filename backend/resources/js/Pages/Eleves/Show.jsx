import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";

export default function Show({
    eleve,
    historique = [],
    statistiques = {},
    parents = [],
}) {
    const [filtre, setFiltre] = useState("tous");

    // Gestion des associations de parents
    const [afficherFormulaireParent, setAfficherFormulaireParent] =
        useState(false);

    const [modeCreation, setModeCreation] = useState(false);

    const [rechercheParent, setRechercheParent] = useState("");
    const [resultatsParents, setResultatsParents] = useState([]);
    const [rechercheEffectuee, setRechercheEffectuee] = useState(false);
    const [parentSelectionne, setParentSelectionne] = useState(null);

    const [lienParent, setLienParent] = useState("Responsable légal");

    const [nomParent, setNomParent] = useState("");
    const [telephoneParent, setTelephoneParent] = useState("");
    const [emailParent, setEmailParent] = useState("");

    const [rechercheEnCours, setRechercheEnCours] = useState(false);
    const [erreurParent, setErreurParent] = useState("");

    const liensPossibles = [
        "Père",
        "Mère",
        "Tuteur",
        "Responsable légal",
        "Autre",
    ];

    const rechercherParents = async () => {
        setRechercheEffectuee(false);

        if (rechercheParent.trim().length < 2) {
            setErreurParent(
                "Saisissez au moins deux caractères pour rechercher.",
            );
            return;
        }

        setRechercheEnCours(true);
        setErreurParent("");
        setResultatsParents([]);
        setParentSelectionne(null);

        try {
            const response = await axios.get(
                route("eleves.parents.rechercher", eleve.id),
                {
                    params: {
                        q: rechercheParent.trim(),
                    },
                },
            );

            setResultatsParents(response.data);
        } catch (error) {
            setErreurParent("Impossible de rechercher les comptes parents.");
        } finally {
            setRechercheEnCours(false);
            setRechercheEffectuee(true);
        }
    };

    const soumettreAssociationParent = (e) => {
        e.preventDefault();

        setErreurParent("");

        const donnees = {
            parent_id: parentSelectionne?.id || null,
            lien: lienParent,
        };

        if (modeCreation && !parentSelectionne) {
            donnees.name = nomParent;
            donnees.telephone = telephoneParent;
            donnees.email = emailParent || null;
        }

        router.post(route("eleves.parents.associer", eleve.id), donnees, {
            preserveScroll: true,

            onSuccess: () => {
                setAfficherFormulaireParent(false);
                setModeCreation(false);
                setRechercheParent("");
                setResultatsParents([]);
                setParentSelectionne(null);
                setNomParent("");
                setTelephoneParent("");
                setEmailParent("");
                setLienParent("Responsable légal");
            },
        });
    };

    const fermerFormulaireParent = () => {
        setAfficherFormulaireParent(false);
        setModeCreation(false);
        setRechercheParent("");
        setResultatsParents([]);
        setParentSelectionne(null);
        setErreurParent("");
    };

    const historiqueFiltre =
        filtre === "tous"
            ? historique
            : historique.filter((item) => item.type === filtre);

    return (
        <AdminLayout>
            <Head title={`Fiche élève - ${eleve.nom} ${eleve.prenoms}`} />

            <div className="space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Fiche de l'élève</h1>

                        <p className="text-gray-500">
                            Historique scolaire et disciplinaire
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={route("eleves.edit", eleve.id)}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                        >
                            Modifier
                        </Link>

                        <Link
                            href={route("eleves.index")}
                            className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50"
                        >
                            Retour
                        </Link>
                    </div>
                </div>

                {/* =====================================================
                    IDENTITÉ
                ===================================================== */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-gray-500">Matricule</p>

                            <p className="mt-1 font-bold">
                                {eleve.matricule || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Nom</p>

                            <p className="mt-1 font-bold">{eleve.nom}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Prénoms</p>

                            <p className="mt-1 font-bold">{eleve.prenoms}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Sexe</p>

                            <p className="mt-1 font-bold">{eleve.sexe}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Établissement
                            </p>

                            <p className="mt-1 font-medium">
                                {eleve.etablissement?.nom || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Année scolaire
                            </p>

                            <p className="mt-1 font-medium">
                                {eleve.annee_scolaire?.libelle || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Classe</p>

                            <p className="mt-1 font-medium">
                                {eleve.classe?.libelle || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Statut</p>

                            <p className="mt-1 font-medium">
                                {eleve.statut || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* =====================================================
    PARENTS ET RESPONSABLES LÉGAUX
===================================================== */}

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 p-5">
                        <div>
                            <h2 className="text-xl font-bold">
                                Parents et responsables légaux
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Comptes parents associés à cet élève.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setAfficherFormulaireParent(
                                    !afficherFormulaireParent,
                                );
                                setModeCreation(false);
                                setErreurParent("");
                            }}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            {afficherFormulaireParent
                                ? "Fermer"
                                : "+ Ajouter un parent"}
                        </button>
                    </div>

                    <div className="p-5">
                        {/* LISTE DES PARENTS */}

                        {parents.length === 0 ? (
                            <p className="rounded-lg bg-gray-50 p-5 text-center text-sm text-gray-500">
                                Aucun compte parent n'est actuellement associé à
                                cet élève.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {parents.map((parent) => (
                                    <div
                                        key={parent.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {parent.name}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-600">
                                                    Téléphone :{" "}
                                                    {parent.telephone || "-"}
                                                </p>

                                                <p className="text-sm text-gray-600">
                                                    E-mail :{" "}
                                                    {parent.email || "-"}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                {parent.lien ||
                                                    "Responsable légal"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* FORMULAIRE D'AJOUT */}

                        {afficherFormulaireParent && (
                            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/40 p-5">
                                <h3 className="mb-2 text-lg font-bold text-gray-800">
                                    Associer un parent
                                </h3>

                                <p className="mb-5 text-sm text-gray-600">
                                    Recherchez d'abord un compte existant avant
                                    de créer un nouveau compte.
                                </p>

                                <form
                                    onSubmit={soumettreAssociationParent}
                                    className="space-y-5"
                                >
                                    {/* RECHERCHE */}

                                    {!modeCreation && (
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold">
                                                Rechercher un compte parent
                                            </label>

                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <input
                                                    type="search"
                                                    value={rechercheParent}
                                                    onChange={(e) => {
                                                        setRechercheParent(
                                                            e.target.value,
                                                        );
                                                        setParentSelectionne(
                                                            null,
                                                        );
                                                        setResultatsParents([]);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            rechercherParents();
                                                        }
                                                    }}
                                                    placeholder="Nom, téléphone ou adresse e-mail..."
                                                    className="w-full rounded-lg border-gray-300"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={rechercherParents}
                                                    disabled={rechercheEnCours}
                                                    className="rounded-lg bg-gray-800 px-5 py-2 font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                                                >
                                                    {rechercheEnCours
                                                        ? "Recherche..."
                                                        : "Rechercher"}
                                                </button>
                                            </div>

                                            {resultatsParents.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-sm font-semibold text-gray-700">
                                                        Comptes trouvés
                                                    </p>

                                                    {resultatsParents.map(
                                                        (parent) => (
                                                            <button
                                                                key={parent.id}
                                                                type="button"
                                                                disabled={
                                                                    parent.deja_associe
                                                                }
                                                                onClick={() => {
                                                                    setParentSelectionne(
                                                                        parent,
                                                                    );
                                                                    setErreurParent(
                                                                        "",
                                                                    );
                                                                }}
                                                                className={`w-full rounded-lg border p-3 text-left ${
                                                                    parent.deja_associe
                                                                        ? "cursor-not-allowed bg-gray-100 opacity-60"
                                                                        : parentSelectionne?.id ===
                                                                            parent.id
                                                                          ? "border-blue-500 bg-blue-100"
                                                                          : "bg-white hover:bg-blue-50"
                                                                }`}
                                                            >
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <div>
                                                                        <p className="font-semibold">
                                                                            {
                                                                                parent.name
                                                                            }
                                                                        </p>

                                                                        <p className="text-sm text-gray-600">
                                                                            {parent.telephone ||
                                                                                "-"}
                                                                        </p>

                                                                        <p className="text-sm text-gray-500">
                                                                            {parent.email ||
                                                                                "-"}
                                                                        </p>
                                                                    </div>

                                                                    <span className="text-xs font-semibold">
                                                                        {parent.deja_associe
                                                                            ? "Déjà associé"
                                                                            : parentSelectionne?.id ===
                                                                                parent.id
                                                                              ? "Sélectionné"
                                                                              : "Sélectionner"}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                            {rechercheEffectuee &&
                                                !rechercheEnCours &&
                                                resultatsParents.length === 0 &&
                                                !erreurParent && (
                                                    <p className="text-sm text-gray-500">
                                                        Aucun compte parent
                                                        trouvé avec ces
                                                        informations.
                                                    </p>
                                                )}

                                            {!parentSelectionne && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setModeCreation(true);
                                                        setParentSelectionne(
                                                            null,
                                                        );
                                                        setErreurParent("");
                                                        setNomParent("");
                                                        setTelephoneParent("");
                                                        setEmailParent("");
                                                    }}
                                                    className="mt-4 text-sm font-semibold text-blue-700 underline"
                                                >
                                                    Créer un nouveau compte
                                                    parent
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* CRÉATION D'UN NOUVEAU COMPTE */}

                                    {modeCreation && (
                                        <div className="space-y-4 rounded-lg border bg-white p-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-bold">
                                                    Nouveau compte parent
                                                </h4>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setModeCreation(false);
                                                        setErreurParent("");
                                                    }}
                                                    className="text-sm font-medium text-blue-700 underline"
                                                >
                                                    Rechercher un compte
                                                    existant
                                                </button>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium">
                                                    Nom et prénoms *
                                                </label>

                                                <input
                                                    type="text"
                                                    value={nomParent}
                                                    onChange={(e) =>
                                                        setNomParent(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="w-full rounded-lg border-gray-300"
                                                    placeholder="Nom complet du parent"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium">
                                                    Téléphone *
                                                </label>

                                                <input
                                                    type="text"
                                                    value={telephoneParent}
                                                    onChange={(e) =>
                                                        setTelephoneParent(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="w-full rounded-lg border-gray-300"
                                                    placeholder="Numéro de téléphone"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium">
                                                    Adresse e-mail
                                                </label>

                                                <input
                                                    type="email"
                                                    value={emailParent}
                                                    onChange={(e) =>
                                                        setEmailParent(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border-gray-300"
                                                    placeholder="Adresse e-mail facultative"
                                                />
                                            </div>

                                            <p className="text-xs text-gray-500">
                                                Le matricule de l'élève sera
                                                utilisé comme mot de passe
                                                initial. Le parent devra le
                                                modifier lors de sa première
                                                connexion.
                                            </p>
                                        </div>
                                    )}

                                    {/* COMPTE EXISTANT SÉLECTIONNÉ */}

                                    {parentSelectionne && !modeCreation && (
                                        <div className="rounded-lg border border-green-300 bg-green-50 p-4">
                                            <p className="text-sm font-semibold text-green-800">
                                                Compte parent sélectionné
                                            </p>

                                            <p className="mt-1 font-bold">
                                                {parentSelectionne.name}
                                            </p>

                                            <p className="text-sm text-gray-600">
                                                {parentSelectionne.telephone ||
                                                    "-"}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setParentSelectionne(null)
                                                }
                                                className="mt-2 text-sm text-red-600 underline"
                                            >
                                                Annuler la sélection
                                            </button>
                                        </div>
                                    )}

                                    {/* LIEN AVEC L'ÉLÈVE */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold">
                                            Lien avec l'élève *
                                        </label>

                                        <select
                                            value={lienParent}
                                            onChange={(e) =>
                                                setLienParent(e.target.value)
                                            }
                                            className="w-full rounded-lg border-gray-300"
                                            required
                                        >
                                            {liensPossibles.map((lien) => (
                                                <option key={lien} value={lien}>
                                                    {lien}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {erreurParent && (
                                        <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                                            {erreurParent}
                                        </p>
                                    )}

                                    {/* ACTIONS */}

                                    <div className="flex flex-wrap justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={fermerFormulaireParent}
                                            className="rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-50"
                                        >
                                            Annuler
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                (!modeCreation &&
                                                    !parentSelectionne) ||
                                                (modeCreation &&
                                                    (!nomParent.trim() ||
                                                        !telephoneParent.trim()))
                                            }
                                            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Associer le parent
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    STATISTIQUES
                ===================================================== */}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard
                        titre="Absences"
                        valeur={statistiques.absences ?? 0}
                        couleur="red"
                    />

                    <StatCard
                        titre="Heures d'absence"
                        valeur={statistiques.heures_absence ?? 0}
                        suffix=" h"
                        couleur="orange"
                    />

                    <StatCard
                        titre="Retards"
                        valeur={statistiques.retards ?? 0}
                        couleur="yellow"
                    />

                    <StatCard
                        titre="Minutes de retard"
                        valeur={statistiques.minutes_retard ?? 0}
                        suffix=" min"
                        couleur="purple"
                    />

                    <StatCard
                        titre="Conduites"
                        valeur={statistiques.conduites ?? 0}
                        couleur="blue"
                    />

                    <StatCard
                        titre="Évaluations"
                        valeur={statistiques.notes ?? 0}
                        couleur="green"
                    />

                    <StatCard
                        titre="Absences justifiées"
                        valeur={statistiques.absences_justifiees ?? 0}
                        couleur="emerald"
                    />

                    <StatCard
                        titre="Absences non justifiées"
                        valeur={statistiques.absences_non_justifiees ?? 0}
                        couleur="rose"
                    />
                </div>

                {/* =====================================================
                    HISTORIQUE
                ===================================================== */}

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-gray-50 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Historique de l'élève
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Ensemble des événements enregistrés
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Filtre
                                    actif={filtre === "tous"}
                                    onClick={() => setFiltre("tous")}
                                >
                                    Tous
                                </Filtre>

                                <Filtre
                                    actif={filtre === "absence"}
                                    onClick={() => setFiltre("absence")}
                                >
                                    Absences
                                </Filtre>

                                <Filtre
                                    actif={filtre === "retard"}
                                    onClick={() => setFiltre("retard")}
                                >
                                    Retards
                                </Filtre>

                                <Filtre
                                    actif={filtre === "conduite"}
                                    onClick={() => setFiltre("conduite")}
                                >
                                    Conduite
                                </Filtre>

                                <Filtre
                                    actif={filtre === "note"}
                                    onClick={() => setFiltre("note")}
                                >
                                    Évaluations
                                </Filtre>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        TABLEAU
                    ================================================= */}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Date</th>

                                    <th className="p-3 text-left">Type</th>

                                    <th className="p-3 text-left">Année</th>

                                    <th className="p-3 text-left">Classe</th>

                                    <th className="p-3 text-left">Détails</th>

                                    <th className="p-3 text-left">
                                        Observation
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {historiqueFiltre.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-8 text-center text-gray-500"
                                        >
                                            Aucun événement enregistré.
                                        </td>
                                    </tr>
                                ) : (
                                    historiqueFiltre.map((item, index) => (
                                        <tr
                                            key={`${item.type}-${index}`}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="p-3 whitespace-nowrap">
                                                {item.date_formatee || "-"}
                                            </td>

                                            <td className="p-3">
                                                <TypeBadge type={item.type} />
                                            </td>

                                            <td className="p-3">
                                                {item.annee_scolaire || "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.classe || "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.type === "absence" && (
                                                    <div>
                                                        <div>
                                                            <strong>
                                                                {item.duree ??
                                                                    0}
                                                            </strong>{" "}
                                                            heure(s)
                                                        </div>

                                                        <div className="text-sm text-gray-500">
                                                            {item.justifiee
                                                                ? "Justifiée"
                                                                : "Non justifiée"}
                                                        </div>

                                                        {item.motif && (
                                                            <div className="text-sm">
                                                                Motif :{" "}
                                                                {item.motif}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {item.type === "retard" && (
                                                    <div>
                                                        <div>
                                                            <strong>
                                                                {item.duree ??
                                                                    0}
                                                            </strong>{" "}
                                                            minute(s)
                                                        </div>

                                                        <div className="text-sm text-gray-500">
                                                            Prévu :{" "}
                                                            {item.heure_prevue ||
                                                                "-"}
                                                        </div>

                                                        <div className="text-sm text-gray-500">
                                                            Arrivée :{" "}
                                                            {item.heure_arrivee ||
                                                                "-"}
                                                        </div>

                                                        {item.motif && (
                                                            <div className="text-sm">
                                                                Motif :{" "}
                                                                {item.motif}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {item.type === "conduite" && (
                                                    <div>
                                                        {item.note !== null &&
                                                            item.note !==
                                                                undefined && (
                                                                <div>
                                                                    Note :{" "}
                                                                    <strong>
                                                                        {
                                                                            item.note
                                                                        }
                                                                    </strong>
                                                                </div>
                                                            )}

                                                        {item.educateur && (
                                                            <div className="text-sm text-gray-500">
                                                                Éducateur :{" "}
                                                                {item.educateur}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {item.type === "note" && (
                                                    <div>
                                                        <div>
                                                            <strong>
                                                                {item.note ??
                                                                    "-"}
                                                            </strong>

                                                            {item.bareme && (
                                                                <>
                                                                    {" "}
                                                                    /{" "}
                                                                    {
                                                                        item.bareme
                                                                    }
                                                                </>
                                                            )}
                                                        </div>

                                                        {item.matiere && (
                                                            <div className="text-sm">
                                                                {item.matiere}
                                                            </div>
                                                        )}

                                                        {item.evaluation && (
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    item.evaluation
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-3 text-sm text-gray-600">
                                                {item.observation ||
                                                    item.appreciation ||
                                                    "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

/*
|--------------------------------------------------------------------------
| CARTE STATISTIQUE
|--------------------------------------------------------------------------
*/

function StatCard({ titre, valeur, suffix = "" }) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{titre}</p>

            <p className="mt-2 text-2xl font-bold">
                {valeur}
                {suffix}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| FILTRE
|--------------------------------------------------------------------------
*/

function Filtre({ actif, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                actif
                    ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            }
        >
            {children}
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| BADGE TYPE
|--------------------------------------------------------------------------
*/

function TypeBadge({ type }) {
    const styles = {
        absence: "bg-red-100 text-red-700",

        retard: "bg-orange-100 text-orange-700",

        conduite: "bg-purple-100 text-purple-700",

        note: "bg-green-100 text-green-700",
    };

    const labels = {
        absence: "Absence",
        retard: "Retard",
        conduite: "Conduite",
        note: "Évaluation",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                styles[type]
            }`}
        >
            {labels[type]}
        </span>
    );
}
