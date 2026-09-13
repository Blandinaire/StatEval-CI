import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Index({
    evaluations = [],
    etablissements = [],
    classes = [],
    matieres = [],
    enseignants = [],
    periodes = [],
    isSuperAdmin = false,
}) {
    /*
    |--------------------------------------------------------------------------
    | FILTRES
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState("");
    const [etablissementId, setEtablissementId] = useState("");
    const [classeId, setClasseId] = useState("");
    const [matiereId, setMatiereId] = useState("");
    const [enseignantId, setEnseignantId] = useState("");
    const [periode, setPeriode] = useState("");
    const [type, setType] = useState("");
    const [statut, setStatut] = useState("");

    /*
    |--------------------------------------------------------------------------
    | CLASSES FILTRÉES SELON L'ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

    const classesFiltrees = useMemo(() => {
        if (!etablissementId) {
            return classes;
        }

        return classes.filter(
            (classe) =>
                String(classe.etablissement_id) === String(etablissementId),
        );
    }, [classes, etablissementId]);

    /*
    |--------------------------------------------------------------------------
    | ÉVALUATIONS FILTRÉES
    |--------------------------------------------------------------------------
    */

    const evaluationsFiltrees = useMemo(() => {
        return evaluations.filter((evaluation) => {
            /*
            |--------------------------------------------------------------------------
            | RECHERCHE
            |--------------------------------------------------------------------------
            */

            const terme = search.toLowerCase();

            const enseignant = evaluation.enseignant
                ? `${evaluation.enseignant.nom ?? ""} ${
                      evaluation.enseignant.prenoms ?? ""
                  }`.toLowerCase()
                : "";

            const correspondRecherche =
                !search ||
                evaluation.libelle?.toLowerCase().includes(terme) ||
                evaluation.type?.toLowerCase().includes(terme) ||
                evaluation.classe?.libelle?.toLowerCase().includes(terme) ||
                evaluation.matiere?.libelle?.toLowerCase().includes(terme) ||
                enseignant.includes(terme);

            /*
            |--------------------------------------------------------------------------
            | ÉTABLISSEMENT
            |--------------------------------------------------------------------------
            */

            const correspondEtablissement =
                !etablissementId ||
                String(evaluation.etablissement_id) === String(etablissementId);

            /*
            |--------------------------------------------------------------------------
            | CLASSE
            |--------------------------------------------------------------------------
            */

            const correspondClasse =
                !classeId || String(evaluation.classe_id) === String(classeId);

            /*
            |--------------------------------------------------------------------------
            | MATIÈRE
            |--------------------------------------------------------------------------
            */

            const correspondMatiere =
                !matiereId ||
                String(evaluation.matiere_id) === String(matiereId);

            /*
            |--------------------------------------------------------------------------
            | ENSEIGNANT
            |--------------------------------------------------------------------------
            */

            const correspondEnseignant =
                !enseignantId ||
                String(evaluation.enseignant_id) === String(enseignantId);

            /*
            |--------------------------------------------------------------------------
            | PÉRIODE
            |--------------------------------------------------------------------------
            */

            const correspondPeriode =
                !periode || evaluation.periode === periode;

            /*
            |--------------------------------------------------------------------------
            | TYPE
            |--------------------------------------------------------------------------
            */

            const correspondType = !type || evaluation.type === type;

            /*
            |--------------------------------------------------------------------------
            | STATUT
            |--------------------------------------------------------------------------
            */

            const correspondStatut =
                !statut ||
                (statut === "active" && Boolean(evaluation.active)) ||
                (statut === "inactive" && !Boolean(evaluation.active));

            return (
                correspondRecherche &&
                correspondEtablissement &&
                correspondClasse &&
                correspondMatiere &&
                correspondEnseignant &&
                correspondPeriode &&
                correspondType &&
                correspondStatut
            );
        });
    }, [
        evaluations,
        search,
        etablissementId,
        classeId,
        matiereId,
        enseignantId,
        periode,
        type,
        statut,
    ]);

    /*
    |--------------------------------------------------------------------------
    | RÉINITIALISATION
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {
        setSearch("");
        setEtablissementId("");
        setClasseId("");
        setMatiereId("");
        setEnseignantId("");
        setPeriode("");
        setType("");
        setStatut("");
    };

    return (
        <AdminLayout>
            <Head title="Évaluations" />

            <div className="space-y-6">
                {/* ========================================================= */}
                {/* EN-TÊTE */}
                {/* ========================================================= */}

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Évaluations
                        </h1>

                        <p className="text-gray-500">
                            Gestion des évaluations scolaires
                        </p>
                    </div>

                    <Link
                        href={route("evaluations.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white shadow-sm transition hover:bg-blue-700"
                    >
                        + Nouvelle évaluation
                    </Link>
                </div>

                {/* ========================================================= */}
                {/* FILTRES */}
                {/* ========================================================= */}

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Filtres
                            </h2>

                            <p className="text-sm text-gray-500">
                                Filtrez rapidement les évaluations.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {/* ------------------------------------------------- */}
                        {/* RECHERCHE */}
                        {/* ------------------------------------------------- */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Recherche
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Évaluation, classe, enseignant..."
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {/* ------------------------------------------------- */}
                        {/* ÉTABLISSEMENT */}
                        {/* ------------------------------------------------- */}

                        {isSuperAdmin && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Établissement
                                </label>

                                <select
                                    value={etablissementId}
                                    onChange={(event) => {
                                        setEtablissementId(event.target.value);

                                        /*
                                        |--------------------------------------
                                        | Réinitialisation de la classe
                                        |--------------------------------------
                                        */

                                        setClasseId("");
                                    }}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Tous les établissements
                                    </option>

                                    {etablissements.map((etablissement) => (
                                        <option
                                            key={etablissement.id}
                                            value={etablissement.id}
                                        >
                                            {etablissement.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* ------------------------------------------------- */}
                        {/* CLASSE */}
                        {/* ------------------------------------------------- */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Classe
                            </label>

                            <select
                                value={classeId}
                                onChange={(event) =>
                                    setClasseId(event.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Toutes les classes</option>

                                {classesFiltrees.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ------------------------------------------------- */}
                        {/* MATIÈRE */}
                        {/* ------------------------------------------------- */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Matière
                            </label>

                            <select
                                value={matiereId}
                                onChange={(event) =>
                                    setMatiereId(event.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Toutes les matières</option>

                                {matieres.map((matiere) => (
                                    <option key={matiere.id} value={matiere.id}>
                                        {matiere.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ------------------------------------------------- */}
                        {/* ENSEIGNANT */}
                        {/* ------------------------------------------------- */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Enseignant
                            </label>

                            <select
                                value={enseignantId}
                                onChange={(event) =>
                                    setEnseignantId(event.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Tous les enseignants</option>

                                {enseignants.map((enseignant) => (
                                    <option
                                        key={enseignant.id}
                                        value={enseignant.id}
                                    >
                                        {enseignant.nom} {enseignant.prenoms}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ------------------------------------------------- */}
                        {/* TYPE */}
                        {/* ------------------------------------------------- */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Type
                            </label>

                            <select
                                value={type}
                                onChange={(event) =>
                                    setType(event.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Tous les types</option>

                                <option value="Interrogation">
                                    Interrogation
                                </option>

                                <option value="Devoir">Devoir</option>

                                <option value="Composition">Composition</option>

                                <option value="Examen">Examen</option>

                                <option value="Autre">Autre</option>
                            </select>
                        </div>

                        {/* ------------------------------------------------- */}
                        {/* PÉRIODE */}
                        {/* ------------------------------------------------- */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Période
                            </label>

                            <select
                                value={periode}
                                onChange={(event) =>
                                    setPeriode(event.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Toutes les périodes</option>

                                {periodes.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ------------------------------------------------- */}
                        {/* STATUT */}
                        {/* ------------------------------------------------- */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Statut
                            </label>

                            <select
                                value={statut}
                                onChange={(event) =>
                                    setStatut(event.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Tous les statuts</option>

                                <option value="active">Active</option>

                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* NOMBRE DE RÉSULTATS */}
                {/* ========================================================= */}

                <div className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">
                        {evaluationsFiltrees.length}
                    </span>{" "}
                    évaluation
                    {evaluationsFiltrees.length > 1 ? "s" : ""} trouvée
                    {evaluationsFiltrees.length > 1 ? "s" : ""}
                </div>

                {/* ========================================================= */}
                {/* TABLEAU */}
                {/* ========================================================= */}

                <div className="bg-white rounded-xl shadow">
                    <ResponsiveTable minWidth="1300px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Date</th>

                                <th className="p-3 text-left">Évaluation</th>

                                <th className="p-3 text-left">Type</th>

                                <th className="p-3 text-left">Classe</th>

                                <th className="p-3 text-left">Matière</th>

                                <th className="p-3 text-left">Enseignant</th>

                                <th className="p-3 text-left">Barème</th>

                                <th className="p-3 text-center">Statut</th>

                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {evaluationsFiltrees.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="p-8 text-center text-gray-500"
                                    >
                                        Aucune évaluation ne correspond aux
                                        filtres sélectionnés.
                                    </td>
                                </tr>
                            ) : (
                                evaluationsFiltrees.map((evaluation) => (
                                    <tr
                                        key={evaluation.id}
                                        className="border-t transition hover:bg-gray-50"
                                    >
                                        <td className="p-3">
                                            {evaluation.date_evaluation
                                                ? new Date(
                                                      evaluation.date_evaluation,
                                                  ).toLocaleDateString("fr-FR")
                                                : "-"}
                                        </td>

                                        <td className="p-3 font-medium">
                                            {evaluation.libelle}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.type}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.classe?.libelle ?? "-"}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.matiere?.libelle ?? "-"}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.enseignant
                                                ? `${
                                                      evaluation.enseignant
                                                          .nom ?? ""
                                                  } ${
                                                      evaluation.enseignant
                                                          .prenoms ?? ""
                                                  }`
                                                : "-"}
                                        </td>

                                        <td className="p-3">
                                            {Number(evaluation.bareme).toFixed(
                                                2,
                                            )}
                                        </td>

                                        <td className="p-3 text-center">
                                            {evaluation.active ? (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "evaluations.edit",
                                                        evaluation.id,
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <Link
                                                    href={route(
                                                        "evaluations.show",
                                                        evaluation.id,
                                                    )}
                                                    className="rounded bg-gray-600 px-3 py-1 text-sm text-white transition hover:bg-gray-700"
                                                >
                                                    Voir
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </ResponsiveTable>
                </div>
            </div>
        </AdminLayout>
    );
}
