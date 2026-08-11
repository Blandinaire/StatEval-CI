import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Statistiques({
    evaluation,
    statistiques,
    repartition = [],
    resultats = [],
}) {
    const formatNote = (note) => {
        if (note === null || note === undefined) {
            return "—";
        }

        return Number(note).toFixed(2);
    };

    const formatPourcentage = (value) => {
        return `${Number(value ?? 0).toFixed(1)} %`;
    };

    const appreciationClasses = {
        Excellent: "bg-green-100 text-green-700",
        "Très bien": "bg-emerald-100 text-emerald-700",
        Bien: "bg-blue-100 text-blue-700",
        "Assez bien": "bg-cyan-100 text-cyan-700",
        Moyen: "bg-yellow-100 text-yellow-700",
        Passable: "bg-orange-100 text-orange-700",
        Insuffisant: "bg-orange-100 text-orange-700",
        "Très insuffisant": "bg-red-100 text-red-700",
        Faible: "bg-red-100 text-red-700",
    };

    const maxRepartition = Math.max(
        ...repartition.map((item) => Number(item.nombre)),
        1
    );

    return (
        <AdminLayout>
            <Head
                title={`Statistiques - ${evaluation.libelle}`}
            />

            <div className="mx-auto max-w-7xl space-y-6">

                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="rounded-xl bg-white p-8 shadow">

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Statistiques de l'évaluation
                            </h1>

                            <p className="mt-2 text-gray-500">
                                {evaluation.libelle}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">

                            <Link
                                href={route(
                                    "evaluations.show",
                                    evaluation.id
                                )}
                                className="rounded-lg border px-5 py-3 hover:bg-gray-50"
                            >
                                ← Retour à l'évaluation
                            </Link>

                            <Link
                                href={route(
                                    "notes.create",
                                    evaluation.id
                                )}
                                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                            >
                                Saisir / modifier les notes
                            </Link>

                        </div>

                    </div>

                    {/* Informations */}

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-500">
                                Établissement
                            </p>

                            <p className="mt-1 font-semibold">
                                {evaluation.etablissement?.nom ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-500">
                                Classe
                            </p>

                            <p className="mt-1 font-semibold">
                                {evaluation.classe?.libelle ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-500">
                                Matière
                            </p>

                            <p className="mt-1 font-semibold">
                                {evaluation.matiere?.libelle ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-gray-500">
                                Barème
                            </p>

                            <p className="mt-1 text-2xl font-bold text-blue-600">
                                /{evaluation.bareme}
                            </p>
                        </div>

                    </div>

                </div>

                {/* =====================================================
                    INDICATEURS PRINCIPAUX
                ===================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Élèves concernés
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-800">
                            {statistiques.total_eleves}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Notes saisies
                        </p>

                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            {statistiques.notes_saisies}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            sur {statistiques.total_eleves}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Absents
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {statistiques.absents}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            {formatPourcentage(
                                statistiques.taux_absence
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Non notés
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-600">
                            {statistiques.non_notes}
                        </p>
                    </div>

                </div>

                {/* =====================================================
                    PERFORMANCES
                ===================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Moyenne de la classe
                        </p>

                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            {formatNote(statistiques.moyenne)}
                            <span className="text-lg">
                                {" "}
                                / {evaluation.bareme}
                            </span>
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Médiane
                        </p>

                        <p className="mt-2 text-3xl font-bold text-indigo-600">
                            {formatNote(statistiques.mediane)}
                            <span className="text-lg">
                                {" "}
                                / {evaluation.bareme}
                            </span>
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Meilleure note
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {formatNote(statistiques.meilleure_note)}
                            <span className="text-lg">
                                {" "}
                                / {evaluation.bareme}
                            </span>
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Plus faible note
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {formatNote(
                                statistiques.plus_faible_note
                            )}
                            <span className="text-lg">
                                {" "}
                                / {evaluation.bareme}
                            </span>
                        </p>
                    </div>

                </div>

                {/* =====================================================
                    AUTRES INDICATEURS
                ===================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Écart-type
                        </p>

                        <p className="mt-2 text-3xl font-bold text-purple-600">
                            {formatNote(statistiques.ecart_type)}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Dispersion des notes
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Taux de réussite
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {formatPourcentage(
                                statistiques.taux_reussite
                            )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            {statistiques.reussites} réussite
                            {statistiques.reussites > 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Échecs
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {statistiques.echecs}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Note normalisée inférieure à 10/20
                        </p>
                    </div>

                </div>

                {/* =====================================================
                    RÉPARTITION
                ===================================================== */}

                <div className="rounded-xl bg-white p-6 shadow">

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Répartition des résultats
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Répartition des élèves selon leur note
                            normalisée sur 20.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {repartition.map((item) => (

                            <div
                                key={item.appreciation}
                                className="rounded-lg border bg-slate-50 p-4"
                            >

                                <div className="flex items-center justify-between">

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                            appreciationClasses[
                                                item.appreciation
                                            ] ??
                                            "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {item.appreciation}
                                    </span>

                                    <span className="font-bold text-gray-700">
                                        {item.nombre}
                                    </span>

                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">

                                    <div
                                        className="h-full rounded-full bg-blue-500"
                                        style={{
                                            width: `${
                                                (Number(item.nombre) /
                                                    maxRepartition) *
                                                100
                                            }%`,
                                        }}
                                    />

                                </div>

                                <p className="mt-2 text-xs text-gray-500">
                                    {formatPourcentage(
                                        item.pourcentage
                                    )}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

                {/* =====================================================
                    RÉSULTATS DES ÉLÈVES
                ===================================================== */}

                <div className="overflow-hidden rounded-xl bg-white shadow">

                    <div className="border-b bg-slate-50 px-6 py-5">

                        <h2 className="text-xl font-bold text-gray-800">
                            Résultats détaillés
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Notes originales et notes normalisées
                            sur 20.
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="px-4 py-4 text-left">
                                        #
                                    </th>

                                    <th className="px-4 py-4 text-left">
                                        Élève
                                    </th>

                                    <th className="px-4 py-4 text-center">
                                        Note /{evaluation.bareme}
                                    </th>

                                    <th className="px-4 py-4 text-center">
                                        Note /20
                                    </th>

                                    <th className="px-4 py-4 text-center">
                                        Statut
                                    </th>

                                    <th className="px-4 py-4 text-left">
                                        Appréciation
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {resultats.map((item, index) => {

                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-t hover:bg-gray-50"
                                        >

                                            <td className="px-4 py-4 font-semibold text-gray-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-4">

                                                <div className="font-semibold text-gray-800">
                                                    {item.eleve?.nom ?? "—"}{" "}
                                                    {item.eleve?.prenoms ?? ""}
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {item.eleve?.code_eleve ?? "—"}
                                                </div>

                                            </td>

                                            <td className="px-4 py-4 text-center font-semibold">
                                                {item.absent
                                                    ? "—"
                                                    : item.note !== null
                                                      ? formatNote(item.note)
                                                      : "Non saisie"}
                                            </td>

                                            <td className="px-4 py-4 text-center">

                                                {item.absent ? (
                                                    <span className="text-gray-400">
                                                        —
                                                    </span>
                                                ) : item.note_sur_20 !== null ? (
                                                    <span className="font-bold text-blue-600">
                                                        {formatNote(
                                                            item.note_sur_20
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        —
                                                    </span>
                                                )}

                                            </td>

                                            <td className="px-4 py-4 text-center">

                                                {item.absent ? (

                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                                                        Absent
                                                    </span>

                                                ) : item.note !== null ? (

                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                                        Présent
                                                    </span>

                                                ) : (

                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                                        Non noté
                                                    </span>

                                                )}

                                            </td>

                                            <td className="px-4 py-4">

                                                {item.appreciation ? (

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                                            appreciationClasses[
                                                                item.appreciation
                                                            ] ??
                                                            "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {item.appreciation}
                                                    </span>

                                                ) : (

                                                    <span className="text-gray-400">
                                                        —
                                                    </span>

                                                )}

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}