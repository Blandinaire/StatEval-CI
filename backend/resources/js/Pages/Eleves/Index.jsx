import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ eleves }) {
    return (
        <AdminLayout>
            <Head title="Élèves" />

            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Élèves</h1>

                        <p className="text-gray-500">Gestion des élèves</p>
                    </div>

                    <Link
                        href={route("eleves.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Nouvel élève
                    </Link>
                </div>

                {/* Tableau */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Matricule</th>

                                <th className="p-3 text-left">Nom</th>

                                <th className="p-3 text-left">Prénoms</th>

                                <th className="p-3 text-left">Sexe</th>

                                <th className="p-3 text-left">Classe</th>

                                <th className="p-3 text-left">Statut</th>

                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {eleves.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="p-6 text-center text-gray-500"
                                    >
                                        Aucun élève enregistré.
                                    </td>
                                </tr>
                            ) : (
                                eleves.map((eleve) => (
                                    <tr
                                        key={eleve.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3 font-medium">
                                            {eleve.matricule}
                                        </td>

                                        <td className="p-3">{eleve.nom}</td>

                                        <td className="p-3">{eleve.prenoms}</td>

                                        <td className="p-3">{eleve.sexe}</td>

                                        <td className="p-3">
                                            {eleve.classe?.libelle ?? "-"}
                                        </td>

                                        <td className="p-3">{eleve.statut}</td>

                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "eleves.edit",
                                                        eleve.id,
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                `Voulez-vous vraiment supprimer l'élève ${eleve.nom} ${eleve.prenoms} ?`,
                                                            )
                                                        ) {
                                                            router.delete(
                                                                route(
                                                                    "eleves.destroy",
                                                                    eleve.id,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
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
