import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ educateurs }) {
    return (
        <AdminLayout>
            <Head title="Éducateurs" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Éducateurs
                        </h1>

                        <p className="text-gray-500">
                            Gestion des éducateurs de l'établissement
                        </p>
                    </div>

                    <Link
                        href={route("educateurs.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Nouvel éducateur
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Matricule</th>
                                <th className="p-3 text-left">Nom</th>
                                <th className="p-3 text-left">Prénoms</th>
                                <th className="p-3 text-left">Téléphone</th>
                                <th className="p-3 text-left">Statut</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {educateurs.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="p-6 text-center text-gray-500"
                                    >
                                        Aucun éducateur enregistré.
                                    </td>
                                </tr>
                            ) : (
                                educateurs.map((educateur) => (
                                    <tr
                                        key={educateur.id}
                                        className="border-t"
                                    >
                                        <td className="p-3">
                                            {educateur.matricule}
                                        </td>

                                        <td className="p-3">
                                            {educateur.nom}
                                        </td>

                                        <td className="p-3">
                                            {educateur.prenoms}
                                        </td>

                                        <td className="p-3">
                                            {educateur.telephone || "-"}
                                        </td>

                                        <td className="p-3">
                                            {educateur.statut}
                                        </td>

                                        <td className="p-3 text-center">
                                            <Link
                                                href={route(
                                                    "educateurs.edit",
                                                    educateur.id
                                                )}
                                                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                            >
                                                Modifier
                                            </Link>
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