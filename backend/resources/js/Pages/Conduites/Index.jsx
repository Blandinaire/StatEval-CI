import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ conduites }) {
    return (
        <AdminLayout>
            <Head title="Notes de conduite" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Notes de conduite
                        </h1>

                        <p className="text-gray-500">
                            Gestion des notes de conduite des élèves
                        </p>
                    </div>

                    <Link
                        href={route("conduites.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Nouvelle note de conduite
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">
                                        Élève
                                    </th>

                                    <th className="p-3 text-left">
                                        Éducateur
                                    </th>

                                    <th className="p-3 text-left">
                                        Année scolaire
                                    </th>

                                    <th className="p-3 text-left">
                                        Classe
                                    </th>

                                    <th className="p-3 text-left">
                                        Évaluation
                                    </th>

                                    <th className="p-3 text-center">
                                        Note
                                    </th>

                                    <th className="p-3 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {conduites.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="p-6 text-center text-gray-500"
                                        >
                                            Aucune note de conduite enregistrée.
                                        </td>
                                    </tr>
                                ) : (
                                    conduites.map((conduite) => (
                                        <tr
                                            key={conduite.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="p-3">
                                                {conduite.eleve
                                                    ? `${conduite.eleve.nom} ${conduite.eleve.prenoms}`
                                                    : "-"}
                                            </td>

                                            <td className="p-3">
                                                {conduite.educateur
                                                    ? `${conduite.educateur.nom} ${conduite.educateur.prenoms}`
                                                    : "-"}
                                            </td>

                                            <td className="p-3">
                                                {conduite.annee_scolaire
                                                    ?.libelle ?? "-"}
                                            </td>

                                            <td className="p-3">
                                                {conduite.classe
                                                    ?.libelle ?? "-"}
                                            </td>

                                            <td className="p-3">
                                                {conduite.evaluation
                                                    ?.libelle ?? "-"}
                                            </td>

                                            <td className="p-3 text-center">
                                                <span className="rounded-lg bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                                                    {Number(
                                                        conduite.note
                                                    ).toFixed(2)}
                                                    /20
                                                </span>
                                            </td>

                                            <td className="p-3 text-center">
                                                <Link
                                                    href={route(
                                                        "conduites.edit",
                                                        conduite.id
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
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
            </div>
        </AdminLayout>
    );
}