import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
    affectations = [],
    etablissements = [],
    anneesScolaires = [],
    educateurs = [],
    classes = [],
    filters = {},
    isSuperAdmin = false,
}) {
    const filtres = {
        etablissement_id: "",
        annee_scolaire_id: "",
        educateur_id: "",
        classe_id: "",
        ...filters,
    };

    const appliquerFiltre = (nom, valeur) => {
        router.get(
            route("educateur-classes.index"),
            {
                ...filtres,
                [nom]: valeur,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const supprimer = (id) => {
        if (!confirm("Voulez-vous vraiment supprimer cette affectation ?")) {
            return;
        }

        router.delete(route("educateur-classes.destroy", id));
    };

    const toggle = (id) => {
        router.patch(route("educateur-classes.toggle", id));
    };

    const nomEducateur = (educateur) =>
        `${educateur?.nom ?? ""} ${educateur?.prenoms ?? ""}`.trim();

    return (
        <AdminLayout>
            <Head title="Affectation des classes aux éducateurs" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Affectation des classes aux éducateurs
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Définissez les classes prises en charge par chaque
                            éducateur.
                        </p>
                    </div>

                    <Link
                        href={route("educateur-classes.create")}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        + Nouvelle affectation
                    </Link>
                </div>

                {/* Filtres */}
                <div className="rounded-xl bg-white p-4 shadow">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {isSuperAdmin && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Établissement
                                </label>

                                <select
                                    value={filtres.etablissement_id}
                                    onChange={(e) =>
                                        appliquerFiltre(
                                            "etablissement_id",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border-gray-300"
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

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Année scolaire
                            </label>

                            <select
                                value={filtres.annee_scolaire_id}
                                onChange={(e) =>
                                    appliquerFiltre(
                                        "annee_scolaire_id",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Toutes les années</option>

                                {anneesScolaires.map((annee) => (
                                    <option key={annee.id} value={annee.id}>
                                        {annee.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Éducateur
                            </label>

                            <select
                                value={filtres.educateur_id}
                                onChange={(e) =>
                                    appliquerFiltre(
                                        "educateur_id",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Tous les éducateurs</option>

                                {educateurs.map((educateur) => (
                                    <option
                                        key={educateur.id}
                                        value={educateur.id}
                                    >
                                        {nomEducateur(educateur)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Classe
                            </label>

                            <select
                                value={filtres.classe_id}
                                onChange={(e) =>
                                    appliquerFiltre("classe_id", e.target.value)
                                }
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Toutes les classes</option>

                                {classes.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tableau */}
                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <ResponsiveTable minWidth="1000px">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Établissement
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Année scolaire
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Éducateur
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Classe
                                </th>

                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                                    Statut
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {affectations.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-10 text-center text-gray-500"
                                    >
                                        Aucune affectation enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                affectations.map((affectation) => (
                                    <tr
                                        key={affectation.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {affectation.etablissement?.nom}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {
                                                affectation.annee_scolaire
                                                    ?.libelle
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                            {nomEducateur(
                                                affectation.educateur,
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                            {affectation.classe?.libelle}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggle(affectation.id)
                                                }
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    affectation.actif
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {affectation.actif
                                                    ? "Active"
                                                    : "Inactive"}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route(
                                                        "educateur-classes.edit",
                                                        affectation.id,
                                                    )}
                                                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                                >
                                                    Modifier
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        supprimer(
                                                            affectation.id,
                                                        )
                                                    }
                                                    className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
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
