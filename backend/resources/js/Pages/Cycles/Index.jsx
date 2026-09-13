import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router, usePage } from "@inertiajs/react";

export default function Index({ cycles }) {
    const { auth } = usePage().props;

    const user = auth?.user;

    const role = user?.roles?.[0]?.name ?? user?.role ?? "Utilisateur";

    const isSuperAdmin = role === "SuperAdmin";

    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer ce cycle ?")) {
            router.delete(route("cycles.destroy", id));
        }
    }

    return (
        <AdminLayout>
            <Head title="Cycles" />

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Cycles</h1>

                        <p className="text-gray-500 mt-1">
                            Référentiel des cycles pédagogiques
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <Link
                            href={route("cycles.create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
                        >
                            + Nouveau cycle
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow">
                    <ResponsiveTable minWidth="600px">
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
                            {cycles.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={isSuperAdmin ? 5 : 4}
                                        className="text-center p-8 text-gray-500"
                                    >
                                        Aucun cycle enregistré.
                                    </td>
                                </tr>
                            ) : (
                                cycles.map((cycle) => (
                                    <tr key={cycle.id} className="border-t">
                                        <td className="p-4 font-semibold">
                                            {cycle.code}
                                        </td>

                                        <td className="p-4">{cycle.libelle}</td>

                                        <td className="p-4 text-center">
                                            {cycle.ordre}
                                        </td>

                                        <td className="p-4 text-center">
                                            {cycle.actif ? (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                                    Actif
                                                </span>
                                            ) : (
                                                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                    Inactif
                                                </span>
                                            )}
                                        </td>

                                        {isSuperAdmin && (
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <Link
                                                        href={route(
                                                            "cycles.edit",
                                                            cycle.id,
                                                        )}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                                    >
                                                        Modifier
                                                    </Link>

                                                    <button
                                                        onClick={() =>
                                                            supprimer(cycle.id)
                                                        }
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
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
