import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ absences }) {
    return (
        <AdminLayout>
            <Head title="Absences" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Gestion des absences
                        </h1>

                        <p className="text-gray-500">
                            Suivi des absences des élèves
                        </p>
                    </div>

                    <Link
                        href={route("absences.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Nouvelle absence
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">
                                        Date
                                    </th>

                                    <th className="p-3 text-left">
                                        Élève
                                    </th>

                                    <th className="p-3 text-left">
                                        Classe
                                    </th>

                                    <th className="p-3 text-left">
                                        Éducateur
                                    </th>

                                    <th className="p-3 text-center">
                                        Durée
                                    </th>

                                    <th className="p-3 text-center">
                                        Justification
                                    </th>

                                    <th className="p-3 text-center">
                                        Billet
                                    </th>

                                    <th className="p-3 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {absences.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="p-6 text-center text-gray-500"
                                        >
                                            Aucune absence enregistrée.
                                        </td>
                                    </tr>
                                ) : (
                                    absences.map((absence) => (
                                        <tr
                                            key={absence.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            {/* Date */}

                                            <td className="p-3">
                                                {absence.date_absence
                                                    ? new Date(
                                                          absence.date_absence
                                                      ).toLocaleDateString(
                                                          "fr-FR"
                                                      )
                                                    : "-"}
                                            </td>

                                            {/* Élève */}

                                            <td className="p-3">
                                                {absence.eleve
                                                    ? `${absence.eleve.nom} ${absence.eleve.prenoms}`
                                                    : "-"}
                                            </td>

                                            {/* Classe */}

                                            <td className="p-3">
                                                {absence.classe?.libelle ??
                                                    "-"}
                                            </td>

                                            {/* Éducateur */}

                                            <td className="p-3">
                                                {absence.educateur
                                                    ? `${absence.educateur.nom} ${absence.educateur.prenoms}`
                                                    : "-"}
                                            </td>

                                            {/* Durée */}

                                            <td className="p-3 text-center">
                                                {absence.duree_heures
                                                    ? `${absence.duree_heures} h`
                                                    : "-"}
                                            </td>

                                            {/* Justification */}

                                            <td className="p-3 text-center">
                                                <span
                                                    className={
                                                        absence.justifiee
                                                            ? "rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                                                            : "rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700"
                                                    }
                                                >
                                                    {absence.justifiee
                                                        ? "Justifiée"
                                                        : "Non justifiée"}
                                                </span>
                                            </td>

                                            {/* Billet */}

                                            <td className="p-3 text-center">
                                                <span
                                                    className={
                                                        absence.billet_edite
                                                            ? "rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700"
                                                            : "rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700"
                                                    }
                                                >
                                                    {absence.billet_edite
                                                        ? "Édité"
                                                        : "Non édité"}
                                                </span>
                                            </td>

                                            {/* Actions */}

                                            <td className="p-3 text-center">
                                                <Link
                                                    href={route(
                                                        "absences.edit",
                                                        absence.id
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