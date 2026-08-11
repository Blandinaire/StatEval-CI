import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ evaluations = [] }) {
    return (
        <AdminLayout>
            <Head title="Saisie des notes" />

            <div className="mx-auto max-w-7xl space-y-6">

                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="rounded-xl bg-white p-8 shadow">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Saisie des notes
                            </h1>

                            <p className="mt-2 text-gray-500">
                                Sélectionnez une évaluation pour saisir ou
                                modifier les notes des élèves.
                            </p>
                        </div>

                        <Link
                            href={route("evaluations.index")}
                            className="rounded-lg border px-5 py-3 hover:bg-gray-50"
                        >
                            Voir les évaluations
                        </Link>

                    </div>

                </div>

                {/* =====================================================
                    LISTE DES ÉVALUATIONS
                ===================================================== */}

                <div className="overflow-hidden rounded-xl bg-white shadow">

                    <div className="border-b bg-slate-50 px-6 py-5">

                        <h2 className="text-xl font-bold text-gray-800">
                            Évaluations disponibles
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {evaluations.length} évaluation
                            {evaluations.length > 1 ? "s" : ""} disponible
                            {evaluations.length > 1 ? "s" : ""}
                        </p>

                    </div>

                    {evaluations.length === 0 ? (

                        <div className="p-12 text-center">

                            <div className="text-5xl">
                                📝
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-gray-800">
                                Aucune évaluation disponible
                            </h3>

                            <p className="mt-2 text-gray-500">
                                Créez d'abord une évaluation avant de saisir
                                les notes.
                            </p>

                            <Link
                                href={route("evaluations.create")}
                                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                + Nouvelle évaluation
                            </Link>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-100">

                                    <tr>

                                        <th className="px-5 py-4 text-left">
                                            Date
                                        </th>

                                        <th className="px-5 py-4 text-left">
                                            Évaluation
                                        </th>

                                        <th className="px-5 py-4 text-left">
                                            Classe
                                        </th>

                                        <th className="px-5 py-4 text-left">
                                            Matière
                                        </th>

                                        <th className="px-5 py-4 text-left">
                                            Enseignant
                                        </th>

                                        <th className="px-5 py-4 text-center">
                                            Barème
                                        </th>

                                        <th className="px-5 py-4 text-center">
                                            Notes
                                        </th>

                                        <th className="px-5 py-4 text-center">
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {evaluations.map((evaluation) => {

                                        const totalEleves =
                                            evaluation.notes?.length ?? 0;

                                        const notesSaisies =
                                            evaluation.notes?.filter(
                                                (note) =>
                                                    !note.absent &&
                                                    note.note !== null
                                            ).length ?? 0;

                                        return (
                                            <tr
                                                key={evaluation.id}
                                                className="border-t hover:bg-gray-50"
                                            >

                                                {/* DATE */}

                                                <td className="px-5 py-4">

                                                    {evaluation.date_evaluation
                                                        ? new Date(
                                                              evaluation.date_evaluation
                                                          ).toLocaleDateString(
                                                              "fr-FR"
                                                          )
                                                        : "—"}

                                                </td>

                                                {/* ÉVALUATION */}

                                                <td className="px-5 py-4">

                                                    <div className="font-semibold text-gray-800">
                                                        {evaluation.libelle}
                                                    </div>

                                                    <div className="mt-1 text-sm text-gray-500">
                                                        {evaluation.type}
                                                        {evaluation.numero
                                                            ? ` n°${evaluation.numero}`
                                                            : ""}
                                                    </div>

                                                </td>

                                                {/* CLASSE */}

                                                <td className="px-5 py-4">

                                                    <span className="font-medium">
                                                        {evaluation.classe
                                                            ?.libelle ?? "—"}
                                                    </span>

                                                </td>

                                                {/* MATIÈRE */}

                                                <td className="px-5 py-4">

                                                    {evaluation.matiere
                                                        ?.libelle ?? "—"}

                                                </td>

                                                {/* ENSEIGNANT */}

                                                <td className="px-5 py-4">

                                                    {evaluation.enseignant
                                                        ? `${evaluation.enseignant.nom ?? ""} ${evaluation.enseignant.prenoms ?? ""}`
                                                        : "—"}

                                                </td>

                                                {/* BARÈME */}

                                                <td className="px-5 py-4 text-center">

                                                    <span className="font-semibold text-blue-600">
                                                        /{evaluation.bareme}
                                                    </span>

                                                </td>

                                                {/* NOTES */}

                                                <td className="px-5 py-4 text-center">

                                                    {totalEleves > 0 ? (

                                                        <div>

                                                            <div className="font-semibold text-gray-800">
                                                                {notesSaisies}
                                                                {" / "}
                                                                {totalEleves}
                                                            </div>

                                                            <div className="mt-1 text-xs text-gray-500">
                                                                notes saisies
                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <span className="text-gray-400">
                                                            Aucune
                                                        </span>

                                                    )}

                                                </td>

                                                {/* ACTION */}

                                                <td className="px-5 py-4 text-center">

                                                    <Link
                                                        href={route(
                                                            "notes.create",
                                                            evaluation.id
                                                        )}
                                                        className="inline-flex rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                                                    >
                                                        📝 Saisir les notes
                                                    </Link>

                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>
        </AdminLayout>
    );
}