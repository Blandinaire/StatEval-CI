import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router, usePage } from "@inertiajs/react";

export default function Index({ series }) {
    const { auth } = usePage().props;

    const user = auth?.user;

    const role = user?.roles?.[0]?.name ?? user?.role ?? "Utilisateur";

    const isSuperAdmin = role === "SuperAdmin";

    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer cette série ?")) {
            router.delete(route("series.destroy", id));
        }
    }

    return (
        <AdminLayout>
            <Head title="Séries" />

            <div className="max-w-7xl mx-auto">
                {/* En-tête */}

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Séries</h1>

                        <p className="text-gray-500 mt-1">
                            Référentiel des séries pédagogiques
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <Link
                            href={route("series.create")}
                            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                        >
                            + Nouvelle série
                        </Link>
                    )}
                </div>

                {/* Tableau */}

                <div className="bg-white rounded-xl shadow">
                    <ResponsiveTable minWidth="650px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-4">Code</th>

                                <th className="text-left p-4">Libellé</th>

                                <th className="text-center p-4">Ordre</th>

                                <th className="text-center p-4">Statut</th>

                                {isSuperAdmin && (
                                    <th className="text-center p-4">Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {series.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={isSuperAdmin ? 5 : 4}
                                        className="text-center p-10 text-gray-500"
                                    >
                                        Aucune série enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                series.map((serie) => (
                                    <tr
                                        key={serie.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-4 font-semibold">
                                            {serie.code}
                                        </td>

                                        <td className="p-4">{serie.libelle}</td>

                                        <td className="p-4 text-center">
                                            {serie.ordre}
                                        </td>

                                        <td className="p-4 text-center">
                                            {serie.actif ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {isSuperAdmin && (
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <Link
                                                        href={route(
                                                            "series.edit",
                                                            serie.id,
                                                        )}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                                    >
                                                        Modifier
                                                    </Link>

                                                    <button
                                                        onClick={() =>
                                                            supprimer(serie.id)
                                                        }
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        )}
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
