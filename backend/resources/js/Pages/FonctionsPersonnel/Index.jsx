import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ fonctions = [] }) {
    const [modeEdition, setModeEdition] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        libelle: "",
        description: "",
        actif: true,
    });

    function soumettre(e) {
        e.preventDefault();

        if (modeEdition) {
            put(route("fonctions-personnel.update", modeEdition), {
                onSuccess: () => {
                    reset();
                    setModeEdition(null);
                },
            });
        } else {
            post(route("fonctions-personnel.store"), {
                onSuccess: () => reset(),
            });
        }
    }

    function modifier(fonction) {
        setModeEdition(fonction.id);
        setData({
            libelle: fonction.libelle ?? "",
            description: fonction.description ?? "",
            actif: Boolean(fonction.actif),
        });
    }

    function annulerModification() {
        setModeEdition(null);
        reset();
    }

    function supprimer(fonction) {
        if (window.confirm(`Supprimer la fonction « ${fonction.libelle} » ?`)) {
            router.delete(route("fonctions-personnel.destroy", fonction.id));
        }
    }

    function changerStatut(fonction) {
        router.patch(route("fonctions-personnel.toggle", fonction.id));
    }

    return (
        <AdminLayout>
            <Head title="Gestion des fonctions du personnel" />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Fonctions du personnel
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez les fonctions attribuées aux autres
                            personnels.
                        </p>
                    </div>

                    <Link
                        href={route("autres-personnels.index")}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Retour aux personnels
                    </Link>
                </div>

                <div className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">
                        {modeEdition
                            ? "Modifier une fonction"
                            : "Ajouter une fonction"}
                    </h2>

                    <form onSubmit={soumettre} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Libellé de la fonction *
                            </label>
                            <input
                                type="text"
                                value={data.libelle}
                                onChange={(e) =>
                                    setData("libelle", e.target.value)
                                }
                                className="w-full rounded-lg border p-2"
                                placeholder="Ex. : Éducateur, Secrétaire, Chauffeur"
                                required
                            />
                            {errors.libelle && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.libelle}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                className="w-full rounded-lg border p-2"
                                rows="3"
                                placeholder="Description facultative de la fonction"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {modeEdition && (
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.actif}
                                    onChange={(e) =>
                                        setData("actif", e.target.checked)
                                    }
                                />
                                <span className="text-sm">Fonction active</span>
                            </label>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing
                                    ? "Enregistrement..."
                                    : modeEdition
                                      ? "Enregistrer les modifications"
                                      : "Ajouter la fonction"}
                            </button>

                            {modeEdition && (
                                <button
                                    type="button"
                                    onClick={annulerModification}
                                    className="rounded-lg border px-5 py-2 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3">Fonction</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-center">
                                    Personnels associés
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Statut
                                </th>
                                <th className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {fonctions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        Aucune fonction enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                fonctions.map((fonction) => (
                                    <tr key={fonction.id}>
                                        <td className="px-4 py-3 font-medium">
                                            {fonction.libelle}
                                        </td>
                                        <td className="px-4 py-3">
                                            {fonction.description || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {fonction.personnels_count ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={
                                                    fonction.actif
                                                        ? "rounded-full bg-green-100 px-3 py-1 text-xs text-green-800"
                                                        : "rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                                                }
                                            >
                                                {fonction.actif
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        modifier(fonction)
                                                    }
                                                    className="rounded border px-3 py-1 hover:bg-gray-50"
                                                >
                                                    Modifier
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changerStatut(fonction)
                                                    }
                                                    className="rounded border px-3 py-1 hover:bg-gray-50"
                                                >
                                                    {fonction.actif
                                                        ? "Désactiver"
                                                        : "Activer"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        supprimer(fonction)
                                                    }
                                                    className="rounded border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
