import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Index({
    classes = [],
    etablissements = [],
    isSuperAdmin = false,
    filters = {},
}) {
    const [etablissementId, setEtablissementId] = useState(
        filters.etablissement_id ?? "",
    );

    /*
    |--------------------------------------------------------------------------
    | Synchronisation avec les filtres reçus par Inertia
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        setEtablissementId(filters.etablissement_id ?? "");
    }, [filters.etablissement_id]);

    /*
    |--------------------------------------------------------------------------
    | Filtre établissement
    |--------------------------------------------------------------------------
    */
    function filtrerParEtablissement(value) {
        setEtablissementId(value);

        router.get(
            route("classes.index"),
            {
                etablissement_id: value || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Réinitialisation du filtre
    |--------------------------------------------------------------------------
    */
    function reinitialiserFiltres() {
        setEtablissementId("");

        router.get(
            route("classes.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Suppression
    |--------------------------------------------------------------------------
    */
    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer cette classe ?")) {
            router.delete(route("classes.destroy", id));
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Nombre de colonnes
    |--------------------------------------------------------------------------
    */
    const nombreColonnes = isSuperAdmin ? 7 : 6;

    return (
        <AdminLayout>
            <Head title="Classes" />

            <div className="mx-auto max-w-7xl">
                {/* --------------------------------------------------------- */}
                {/* EN-TÊTE */}
                {/* --------------------------------------------------------- */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Classes
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Gestion des classes
                        </p>
                    </div>

                    <Link
                        href={route("classes.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-center text-white hover:bg-blue-700"
                    >
                        + Nouvelle classe
                    </Link>
                </div>

                {/* --------------------------------------------------------- */}
                {/* FILTRES SUPERADMIN */}
                {/* --------------------------------------------------------- */}

                {isSuperAdmin && (
                    <div className="mb-6 rounded-xl bg-white p-5 shadow">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="w-full sm:max-w-md">
                                <label
                                    htmlFor="etablissement_id"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Établissement
                                </label>

                                <select
                                    id="etablissement_id"
                                    value={etablissementId}
                                    onChange={(e) =>
                                        filtrerParEtablissement(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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

                            {etablissementId && (
                                <button
                                    type="button"
                                    onClick={reinitialiserFiltres}
                                    className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* TABLEAU */}
                {/* --------------------------------------------------------- */}

                <div className="rounded-xl bg-white shadow">
                    <ResponsiveTable
                        minWidth={isSuperAdmin ? "1050px" : "850px"}
                    >
                        <thead className="bg-gray-100">
                            <tr>
                                {isSuperAdmin && (
                                    <th className="p-4 text-left">
                                        Établissement
                                    </th>
                                )}

                                <th className="p-4 text-left">Libellé</th>

                                <th className="p-4 text-left">Niveau</th>

                                <th className="p-4 text-left">
                                    Année scolaire
                                </th>

                                <th className="p-4 text-center">Capacité</th>

                                <th className="p-4 text-center">Effectif</th>

                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {classes.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={nombreColonnes}
                                        className="p-8 text-center text-gray-500"
                                    >
                                        {isSuperAdmin && etablissementId
                                            ? "Aucune classe enregistrée dans cet établissement."
                                            : "Aucune classe enregistrée."}
                                    </td>
                                </tr>
                            ) : (
                                classes.map((classe) => (
                                    <tr
                                        key={classe.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        {/* ÉTABLISSEMENT */}
                                        {isSuperAdmin && (
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">
                                                    {classe.etablissement
                                                        ?.nom ?? "—"}
                                                </div>
                                            </td>
                                        )}

                                        {/* LIBELLÉ */}
                                        <td className="p-4 font-semibold">
                                            {classe.libelle}
                                        </td>

                                        {/* NIVEAU */}
                                        <td className="p-4">
                                            {classe.niveau?.libelle ?? "—"}
                                        </td>

                                        {/* ANNÉE SCOLAIRE */}
                                        <td className="p-4">
                                            {classe.annee_scolaire?.libelle ??
                                                "—"}
                                        </td>

                                        {/* CAPACITÉ */}
                                        <td className="p-4 text-center">
                                            {classe.capacite}
                                        </td>

                                        <td className="p-4 text-center">
                                            {classe.eleves_count ?? 0}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "classes.edit",
                                                        classe.id,
                                                    )}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        supprimer(classe.id)
                                                    }
                                                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
