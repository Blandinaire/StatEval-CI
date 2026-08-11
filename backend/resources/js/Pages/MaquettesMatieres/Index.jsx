import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ maquette, lignes }) {
    return (
        <AdminLayout>
            <Head title="Maquette pédagogique" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {maquette.libelle}
                        </h1>

                        <p className="text-gray-500">Gestion des matières</p>
                    </div>

                    <Link
                        href={route("maquettes.matieres.create", maquette.id)}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white"
                    >
                        + Ajouter une matière
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Ordre</th>
                                <th className="p-3 text-left">Matière</th>
                                <th className="p-3 text-center">Coef</th>
                                <th className="p-3 text-center">VH</th>
                                <th className="p-3 text-center">Note</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lignes.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="p-6 text-center text-gray-500"
                                    >
                                        Aucune matière ajoutée.
                                    </td>
                                </tr>
                            ) : (
                                lignes.map((ligne) => (
                                    <tr key={ligne.id} className="border-t">
                                        <td className="p-3">{ligne.ordre}</td>

                                        <td className="p-3">
                                            {ligne.matiere.libelle}
                                        </td>

                                        <td className="p-3 text-center">
                                            {ligne.coefficient}
                                        </td>

                                        <td className="p-3 text-center">
                                            {ligne.volume_horaire}
                                        </td>

                                        <td className="p-3 text-center">
                                            {ligne.note_sur}
                                        </td>

                                        <td className="p-3">
                                            <div className="flex justify-center gap-4">
                                                <Link
                                                    href={route(
                                                        "maquettes.matieres.edit",
                                                        [maquette.id, ligne.id],
                                                    )}
                                                    className="text-blue-600 hover:text-blue-800 text-xl"
                                                    title="Modifier"
                                                >
                                                    ✏️
                                                </Link>

                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:text-red-800 text-xl"
                                                    title="Supprimer"
                                                >
                                                    🗑
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
