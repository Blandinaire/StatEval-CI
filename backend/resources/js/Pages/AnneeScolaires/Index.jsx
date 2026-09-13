import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router, usePage } from "@inertiajs/react";

export default function Index({ annees }) {
    const { auth } = usePage().props;

    const user = auth?.user;

    const role = user?.roles?.[0]?.name ?? user?.role ?? "Utilisateur";

    const isSuperAdmin = role === "SuperAdmin";

    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer cette année scolaire ?")) {
            router.delete(route("annee-scolaires.destroy", id));
        }
    }

    return (
        <AdminLayout>
            <Head title="Années scolaires" />

            <div className="max-w-7xl mx-auto">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Années scolaires
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Consultez les années scolaires disponibles dans
                            StatEval-CI.
                        </p>
                    </div>

                    {/* =================================================
                        CRÉATION RÉSERVÉE AU SUPERADMIN
                    ================================================= */}

                    {isSuperAdmin && (
                        <Link
                            href={route("annee-scolaires.create")}
                            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            + Nouvelle année
                        </Link>
                    )}
                </div>

                {/* =====================================================
                    TABLEAU
                ===================================================== */}

                <div className="bg-white rounded-xl shadow">
    <ResponsiveTable minWidth="650px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-4">Libellé</th>

                                <th className="text-left p-4">Début</th>

                                <th className="text-left p-4">Fin</th>

                                <th className="text-center p-4">Statut</th>

                                {isSuperAdmin && (
                                    <th className="text-center p-4">Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {annees.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={isSuperAdmin ? 5 : 4}
                                        className="text-center p-10 text-gray-500"
                                    >
                                        Aucune année scolaire enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                annees.map((annee) => (
                                    <tr
                                        key={annee.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        {/* LIBELLÉ */}

                                        <td className="p-4 font-semibold text-gray-800">
                                            {annee.libelle}
                                        </td>

                                        {/* DATE DE DÉBUT */}

                                        <td className="p-4">
                                            {annee.date_debut}
                                        </td>

                                        {/* DATE DE FIN */}

                                        <td className="p-4">
                                            {annee.date_fin}
                                        </td>

                                        {/* STATUT */}

                                        <td className="p-4 text-center">
                                            {annee.active ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                                                    ✓ Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* =================================
                                            ACTIONS SUPERADMIN UNIQUEMENT
                                        ================================= */}

                                        {isSuperAdmin && (
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <Link
                                                        href={route(
                                                            "annee-scolaires.edit",
                                                            annee.id,
                                                        )}
                                                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                                                    >
                                                        Modifier
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            supprimer(annee.id)
                                                        }
                                                        disabled={annee.active}
                                                        className={`inline-flex items-center rounded-lg px-4 py-2 text-white transition ${
                                                            annee.active
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-red-600 hover:bg-red-700"
                                                        }`}
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
