import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ retards }) {
    return (
        <AdminLayout>
            <Head title="Gestion des retards" />

            <div className="space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Gestion des retards
                        </h1>

                        <p className="text-gray-500">
                            Suivi des retards des élèves
                        </p>
                    </div>

                    <Link
                        href={route("retards.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Enregistrer un retard
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
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
                                        Date
                                    </th>

                                    <th className="p-3 text-left">
                                        Classe
                                    </th>

                                    <th className="p-3 text-center">
                                        Heure prévue
                                    </th>

                                    <th className="p-3 text-center">
                                        Heure arrivée
                                    </th>

                                    <th className="p-3 text-center">
                                        Durée
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
                                {retards.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="p-8 text-center text-gray-500"
                                        >
                                            Aucun retard enregistré.
                                        </td>
                                    </tr>
                                ) : (
                                    retards.map((retard) => (
                                        <tr
                                            key={retard.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="p-3 font-medium">
                                                {retard.eleve
                                                    ? `${retard.eleve.nom} ${retard.eleve.prenoms}`
                                                    : "-"}
                                            </td>

                                            <td className="p-3">
                                                {retard.educateur
                                                    ? `${retard.educateur.nom} ${retard.educateur.prenoms}`
                                                    : "-"}
                                            </td>

                                            <td className="p-3">
                                                {retard.date_retard
                                                    ? new Date(
                                                        retard.date_retard
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )
                                                    : "-"}
                                            </td>

                                            <td className="p-3">
                                                {retard.classe?.libelle ?? "-"}
                                            </td>

                                            <td className="p-3 text-center">
                                                {retard.heure_prevue ?? "-"}
                                            </td>

                                            <td className="p-3 text-center">
                                                {retard.heure_arrivee ?? "-"}
                                            </td>

                                            <td className="p-3 text-center">
                                                <span className="rounded-lg bg-orange-100 px-3 py-1 font-semibold text-orange-700">
                                                    {retard.duree_minutes ?? 0} min
                                                </span>
                                            </td>

                                            <td className="p-3 text-center">
                                                {retard.billet_edite ? (
                                                    <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                                        Édité
                                                    </span>
                                                ) : (
                                                    <span className="rounded-lg bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-600">
                                                        Non édité
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-3 text-center">
                                                <Link
                                                    href={route(
                                                        "retards.edit",
                                                        retard.id
                                                    )}
                                                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
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