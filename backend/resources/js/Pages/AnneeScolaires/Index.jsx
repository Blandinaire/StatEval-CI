import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";

export default function Index({ annees }) {

    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer cette année scolaire ?")) {
            router.delete(route("annee-scolaires.destroy", id));
        }
    }
    return (
        <AdminLayout>
            <Head title="Années scolaires" />

            <div className="max-w-7xl mx-auto">
                

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Années scolaires</h1>

                        <p className="text-gray-500 mt-1">
                            Gestion des années scolaires
                        </p>
                    </div>

                    <Link
                        href={route("annee-scolaires.create")}
                        className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                    >
                        + Nouvelle année
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-4">Libellé</th>

                                <th className="text-left p-4">Début</th>

                                <th className="text-left p-4">Fin</th>

                                <th className="text-center p-4">Statut</th>

                                <th className="text-center p-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {annees.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center p-10 text-gray-500"
                                    >
                                        Aucune année scolaire enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                annees.map((annee) => (
                                    <tr key={annee.id} className="border-t">
                                        <td className="p-4 font-semibold">
                                            {annee.libelle}
                                        </td>

                                        <td className="p-4">
                                            {annee.date_debut}
                                        </td>

                                        <td className="p-4">
                                            {annee.date_fin}
                                        </td>

                                        <td className="p-4 text-center">
                                            {annee.active ? (
                                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                                                    ✓ Active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "annee-scolaires.edit",
                                                        annee.id,
                                                    )}
                                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        supprimer(annee.id)
                                                    }
                                                    className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
