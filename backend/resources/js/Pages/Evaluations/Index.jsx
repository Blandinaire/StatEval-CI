import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ evaluations }) {
    return (
        <AdminLayout>
            <Head title="Évaluations" />

            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Évaluations</h1>

                        <p className="text-gray-500">
                            Gestion des évaluations scolaires
                        </p>
                    </div>

                    <Link
                        href={route("evaluations.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Nouvelle évaluation
                    </Link>
                </div>

                {/* Tableau */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Date</th>

                                <th className="p-3 text-left">Évaluation</th>

                                <th className="p-3 text-left">Type</th>

                                <th className="p-3 text-left">Classe</th>

                                <th className="p-3 text-left">Matière</th>

                                <th className="p-3 text-left">Enseignant</th>

                                <th className="p-3 text-left">Barème</th>

                                <th className="p-3 text-center">Statut</th>

                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {evaluations.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="p-8 text-center text-gray-500"
                                    >
                                        Aucune évaluation enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                evaluations.map((evaluation) => (
                                    <tr
                                        key={evaluation.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3">
                                            {evaluation.date_evaluation
                                                ? new Date(
                                                      evaluation.date_evaluation,
                                                  ).toLocaleDateString("fr-FR")
                                                : "-"}
                                        </td>

                                        <td className="p-3 font-medium">
                                            {evaluation.libelle}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.type}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.classe?.libelle ?? "-"}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.matiere?.libelle ?? "-"}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.enseignant
                                                ? `${evaluation.enseignant.nom ?? ""} ${
                                                      evaluation.enseignant
                                                          .prenoms ?? ""
                                                  }`
                                                : "-"}
                                        </td>

                                        <td className="p-3">
                                            {evaluation.bareme}
                                        </td>

                                        <td className="p-3 text-center">
                                            {evaluation.active ? (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "evaluations.edit",
                                                        evaluation.id,
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <Link
                                                    href={route(
                                                        "evaluations.show",
                                                        evaluation.id,
                                                    )}
                                                    className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                                                >
                                                    Voir
                                                </Link>
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
