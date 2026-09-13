import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import ResponsiveTable from "@/Components/ResponsiveTable";
import StatistiquesEnseignants from "./StatistiquesEnseignants";

export default function Index({
    enseignants,
    statistiques,
    etablissements = [],
    etablissementSelectionne = null,
}) {
    return (
        <AdminLayout>
            <Head title="Enseignants" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Enseignants</h1>

                        <p className="text-gray-500">Gestion des enseignants</p>
                    </div>

                    <Link
                        href={route("enseignants.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white"
                    >
                        + Nouvel enseignant
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow">
    <ResponsiveTable minWidth="900px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Nom</th>
                                <th className="p-3 text-left">Prénoms</th>
                                <th className="p-3 text-left">Téléphone</th>
                                <th className="p-3 text-left">Statut</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {enseignants.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-6 text-center text-gray-500"
                                    >
                                        Aucun enseignant enregistré.
                                    </td>
                                </tr>
                            ) : (
                                enseignants.map((enseignant) => (
                                    <tr
                                        key={enseignant.id}
                                        className="border-t"
                                    >
                                        <td className="p-3">
                                            {enseignant.nom}
                                        </td>

                                        <td className="p-3">
                                            {enseignant.prenoms}
                                        </td>

                                        <td className="p-3">
                                            {enseignant.telephone}
                                        </td>

                                        <td className="p-3">
                                            {enseignant.statut}
                                        </td>

                                        <td className="p-3 text-center">
                                            <Link
                                                href={route(
                                                    "enseignants.edit",
                                                    enseignant.id,
                                                )}
                                                className="rounded bg-blue-600 px-3 py-1 text-white"
                                            >
                                                Modifier
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </ResponsiveTable>
                </div>

                {/* STATISTIQUES */}
                <StatistiquesEnseignants statistiques={statistiques} />
            </div>
        </AdminLayout>
    );
}
