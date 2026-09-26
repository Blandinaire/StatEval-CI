import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";
import { useMemo } from "react";

export default function Index({
    affectations = [],
    filtres = {},
    etablissements = [],
    annees = [],
    niveaux = [],
    classes = [],
    matieres = [],
    enseignants = [],
    isSuperAdmin = false,
}) {
    /*
    |--------------------------------------------------------------------------
    | Filtres actuels
    |--------------------------------------------------------------------------
    */

    const filtreEtablissement = filtres.etablissement_id ?? "";

    const filtreAnnee = filtres.annee_scolaire_id ?? "";

    const filtreNiveau = filtres.niveau_id ?? "";

    const filtreClasse = filtres.classe_id ?? "";

    const filtreMatiere = filtres.matiere_id ?? "";

    const filtreEnseignant = filtres.enseignant_id ?? "";

    const filtreActif = filtres.actif ?? "1";

    /*
    |--------------------------------------------------------------------------
    | Classes disponibles selon établissement / année / niveau
    |--------------------------------------------------------------------------
    */

    const classesFiltrees = useMemo(() => {
        return classes.filter((classe) => {
            if (
                filtreEtablissement &&
                String(classe.etablissement_id) !== String(filtreEtablissement)
            ) {
                return false;
            }

            if (
                filtreAnnee &&
                String(classe.annee_scolaire_id) !== String(filtreAnnee)
            ) {
                return false;
            }

            if (
                filtreNiveau &&
                String(classe.niveau_id) !== String(filtreNiveau)
            ) {
                return false;
            }

            return true;
        });
    }, [classes, filtreEtablissement, filtreAnnee, filtreNiveau]);

    /*
    |--------------------------------------------------------------------------
    | Matières disponibles
    |--------------------------------------------------------------------------
    */

    const matieresFiltrees = useMemo(() => {
        return matieres;
    }, [matieres]);

    /*
    |--------------------------------------------------------------------------
    | Enseignants disponibles
    |--------------------------------------------------------------------------
    */

    const enseignantsFiltres = useMemo(() => {
        return enseignants.filter((enseignant) => {
            if (
                filtreEtablissement &&
                String(enseignant.etablissement_id) !==
                    String(filtreEtablissement)
            ) {
                return false;
            }

            return true;
        });
    }, [enseignants, filtreEtablissement]);

    /*
    |--------------------------------------------------------------------------
    | Nombre de classes représentées
    |--------------------------------------------------------------------------
    */

    const nombreClasses = new Set(affectations.map((item) => item.classe_id))
        .size;

    /*
    |--------------------------------------------------------------------------
    | Nombre d'enseignants représentés
    |--------------------------------------------------------------------------
    */

    const nombreEnseignants = new Set(
        affectations.map((item) => item.enseignant_id).filter(Boolean),
    ).size;

    /*
    |--------------------------------------------------------------------------
    | Nombre de matières représentées
    |--------------------------------------------------------------------------
    */

    const nombreMatieres = new Set(affectations.map((item) => item.matiere_id))
        .size;

    /*
    |--------------------------------------------------------------------------
    | Appliquer les filtres
    |--------------------------------------------------------------------------
    */

    function appliquerFiltre(nom, valeur) {
        const params = {
            etablissement_id: filtreEtablissement,
            annee_scolaire_id: filtreAnnee,
            niveau_id: filtreNiveau,
            classe_id: filtreClasse,
            matiere_id: filtreMatiere,
            enseignant_id: filtreEnseignant,
            actif: filtreActif,
        };

        params[nom] = valeur;

        /*
        |----------------------------------------------------------------------
        | Nettoyage des dépendances
        |----------------------------------------------------------------------
        */

        if (nom === "etablissement_id") {
            params.niveau_id = "";
            params.classe_id = "";
            params.enseignant_id = "";
        }

        if (nom === "annee_scolaire_id") {
            params.classe_id = "";
        }

        if (nom === "niveau_id") {
            params.classe_id = "";
        }

        router.get(route("affectations.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Réinitialisation
    |--------------------------------------------------------------------------
    */

    function reinitialiser() {
        const params = {};

        /*
        | Pour un utilisateur non SuperAdmin,
        | l'établissement est imposé côté serveur.
        */

        function reinitialiser() {
            router.get(
                route("affectations.index"),
                {},
                {
                    preserveState: false,
                    preserveScroll: false,
                    replace: true,
                },
            );
        }

        router.get(route("affectations.index"), params, {
            preserveState: false,
            preserveScroll: false,
            replace: true,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Suppression
    |--------------------------------------------------------------------------
    */

    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer cette affectation ?")) {
            router.delete(route("affectations.destroy", id));
        }
    }

    return (
        <AdminLayout>
            <Head title="Affectations" />

            <div className="space-y-6">
                {/* ========================================================= */}
                {/* EN-TÊTE */}
                {/* ========================================================= */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Affectations</h1>

                        <p className="text-gray-500">
                            Gestion des affectations des enseignants
                        </p>
                    </div>

                    <Link
                        href={route("affectations.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-center text-white hover:bg-blue-700"
                    >
                        + Nouvelle affectation
                    </Link>
                </div>

                {/* ========================================================= */}
                {/* INDICATEURS */}
                {/* ========================================================= */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Affectations</p>

                        <p className="mt-1 text-2xl font-bold">
                            {affectations.length}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Classes</p>

                        <p className="mt-1 text-2xl font-bold">
                            {nombreClasses}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Enseignants</p>

                        <p className="mt-1 text-2xl font-bold">
                            {nombreEnseignants}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Matières</p>

                        <p className="mt-1 text-2xl font-bold">
                            {nombreMatieres}
                        </p>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* FILTRES */}
                {/* ========================================================= */}

                <div className="rounded-xl bg-white p-6 shadow">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold">Filtres</h2>

                            <p className="text-sm text-gray-500">
                                Affinez la liste des affectations.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={reinitialiser}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* ------------------------------------------------- */}
                        {/* Établissement */}
                        {/* ------------------------------------------------- */}

                        {isSuperAdmin && (
                            <label className="text-sm font-semibold">
                                Établissement
                                <select
                                    value={filtreEtablissement}
                                    onChange={(event) =>
                                        appliquerFiltre(
                                            "etablissement_id",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-normal"
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
                            </label>
                        )}

                        {/* ------------------------------------------------- */}
                        {/* Année scolaire */}
                        {/* ------------------------------------------------- */}

                        <label className="text-sm font-semibold">
                            Année scolaire
                            <select
                                value={filtreAnnee}
                                onChange={(event) =>
                                    appliquerFiltre(
                                        "annee_scolaire_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-normal"
                            >
                                <option value="">Toutes les années</option>

                                {annees.map((annee) => (
                                    <option key={annee.id} value={annee.id}>
                                        {annee.libelle}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* ------------------------------------------------- */}
                        {/* Niveau */}
                        {/* ------------------------------------------------- */}

                        <label className="text-sm font-semibold">
                            Niveau
                            <select
                                value={filtreNiveau}
                                onChange={(event) =>
                                    appliquerFiltre(
                                        "niveau_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-normal"
                            >
                                <option value="">Tous les niveaux</option>

                                {niveaux.map((niveau) => (
                                    <option key={niveau.id} value={niveau.id}>
                                        {niveau.libelle}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* ------------------------------------------------- */}
                        {/* Classe */}
                        {/* ------------------------------------------------- */}

                        <label className="text-sm font-semibold">
                            Classe
                            <select
                                value={filtreClasse}
                                onChange={(event) =>
                                    appliquerFiltre(
                                        "classe_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-normal"
                            >
                                <option value="">Toutes les classes</option>

                                {classesFiltrees.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.libelle}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* ------------------------------------------------- */}
                        {/* Matière */}
                        {/* ------------------------------------------------- */}

                        <label className="text-sm font-semibold">
                            Matière
                            <select
                                value={filtreMatiere}
                                onChange={(event) =>
                                    appliquerFiltre(
                                        "matiere_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-normal"
                            >
                                <option value="">Toutes les matières</option>

                                {matieresFiltrees.map((matiere) => (
                                    <option key={matiere.id} value={matiere.id}>
                                        {matiere.libelle}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* ------------------------------------------------- */}
                        {/* Enseignant */}
                        {/* ------------------------------------------------- */}

                        <label className="text-sm font-semibold">
                            Enseignant
                            <select
                                value={filtreEnseignant}
                                onChange={(event) =>
                                    appliquerFiltre(
                                        "enseignant_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-normal"
                            >
                                <option value="">Tous les enseignants</option>

                                {enseignantsFiltres.map((enseignant) => (
                                    <option
                                        key={enseignant.id}
                                        value={enseignant.id}
                                    >
                                        {enseignant.nom} {enseignant.prenoms}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* ------------------------------------------------- */}
                        {/* Statut */}
                        {/* ------------------------------------------------- */}

                        <label className="text-sm font-semibold">
                            Statut
                            <select
                                value={filtreActif}
                                onChange={(event) =>
                                    appliquerFiltre("actif", event.target.value)
                                }
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-normal"
                            >
                                <option value="">Tous les statuts</option>

                                <option value="1">Actives</option>

                                <option value="0">Inactives</option>
                            </select>
                        </label>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* TABLEAU */}
                {/* ========================================================= */}

                <div className="rounded-xl bg-white shadow">
                    <ResponsiveTable minWidth="1000px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Établissement</th>

                                <th className="p-3 text-left">Classe</th>

                                <th className="p-3 text-left">Matière</th>

                                <th className="p-3 text-left">Enseignant</th>

                                <th className="p-3 text-left">Année</th>

                                <th className="p-3 text-center">Coefficient</th>

                                <th className="p-3 text-center">Volume</th>

                                <th className="p-3 text-center">Statut</th>

                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {affectations.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="p-8 text-center text-gray-500"
                                    >
                                        Aucune affectation correspondant aux
                                        critères sélectionnés.
                                    </td>
                                </tr>
                            ) : (
                                affectations.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3">
                                            {item.etablissement?.nom}
                                        </td>

                                        <td className="p-3">
                                            {item.classe?.libelle}
                                        </td>

                                        <td className="p-3">
                                            {item.matiere?.libelle}
                                        </td>

                                        <td className="p-3">
                                            {item.enseignant?.nom}{" "}
                                            {item.enseignant?.prenoms}
                                        </td>

                                        <td className="p-3">
                                            {item.annee_scolaire?.libelle}
                                        </td>

                                        <td className="p-3 text-center">
                                            {item.coefficient}
                                        </td>

                                        <td className="p-3 text-center">
                                            {item.volume_horaire}
                                        </td>

                                        <td className="p-3 text-center">
                                            {item.actif ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "affectations.edit",
                                                        item.id,
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        supprimer(item.id)
                                                    }
                                                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                                                >
                                                    Supprimer
                                                </button>
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
