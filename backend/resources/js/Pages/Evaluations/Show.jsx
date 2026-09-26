import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { useState } from "react";
import { Head, Link } from "@inertiajs/react";

export default function Show({ evaluation, notes = [], canEdit = false }) {
    /*
    |--------------------------------------------------------------------------
    | FONCTIONS UTILITAIRES
    |--------------------------------------------------------------------------
    */

    /**
     * Convertit une note quelconque vers une note sur 20.
     *
     * Exemple :
     * 15/20  -> 15/20
     * 24/30  -> 16/20
     * 40/50  -> 16/20
     */
    function noteSur20(note) {
        if (
            note === null ||
            note === undefined ||
            evaluation.bareme === null ||
            Number(evaluation.bareme) === 0
        ) {
            return null;
        }

        return (Number(note) / Number(evaluation.bareme)) * 20;
    }

    /**
     * Détermine automatiquement l'appréciation
     * à partir de la note normalisée sur 20.
     */
    function calculerAppreciation(note, absent = false) {
        if (absent || note === null || note === undefined) {
            return "—";
        }

        const note20 = noteSur20(note);

        if (note20 === null) {
            return "—";
        }

        if (note20 >= 18) {
            return "Excellent";
        }

        if (note20 >= 16) {
            return "Très bien";
        }

        if (note20 >= 14) {
            return "Bien";
        }

        if (note20 >= 12) {
            return "Assez bien";
        }

        if (note20 >= 11) {
            return "Moyen";
        }

        if (note20 >= 10) {
            return "Passable";
        }

        if (note20 >= 8) {
            return "Insuffisant";
        }

        if (note20 >= 5) {
            return "Très insuffisant";
        }

        return "Faible";
    }

    /**
     * Couleur de l'appréciation.
     */
    function couleurAppreciation(appreciation) {
        switch (appreciation) {
            case "Excellent":
                return "bg-green-100 text-green-800";

            case "Très bien":
                return "bg-emerald-100 text-emerald-800";

            case "Bien":
                return "bg-blue-100 text-blue-800";

            case "Assez bien":
                return "bg-cyan-100 text-cyan-800";

            case "Moyen":
                return "bg-yellow-100 text-yellow-800";

            case "Passable":
                return "bg-orange-100 text-orange-800";

            case "Insuffisant":
                return "bg-orange-100 text-orange-800";

            case "Très insuffisant":
                return "bg-red-100 text-red-700";

            case "Faible":
                return "bg-red-200 text-red-800";

            default:
                return "bg-gray-100 text-gray-600";
        }
    }

    /*
    |--------------------------------------------------------------------------
    | PRÉPARATION DES DONNÉES
    |--------------------------------------------------------------------------
    */

    const totalEleves = notes.length;

    const notesSaisies = notes.filter(
        (item) => !item.absent && item.note !== null && item.note !== undefined,
    );

    const absents = notes.filter((item) => item.absent);

    const nonNotes = notes.filter(
        (item) =>
            !item.absent && (item.note === null || item.note === undefined),
    );

    /*
    |--------------------------------------------------------------------------
    | NOTES NORMALISÉES SUR 20
    |--------------------------------------------------------------------------
    */

    const notesSur20 = notesSaisies
        .map((item) => noteSur20(item.note))
        .filter((note) => note !== null);

    /*
    |--------------------------------------------------------------------------
    | STATISTIQUES
    |--------------------------------------------------------------------------
    */

    const moyenne =
        notesSur20.length > 0
            ? notesSur20.reduce((total, note) => total + note, 0) /
              notesSur20.length
            : null;

    const meilleureNote =
        notesSur20.length > 0 ? Math.max(...notesSur20) : null;

    const plusFaibleNote =
        notesSur20.length > 0 ? Math.min(...notesSur20) : null;

    const nombreReussites = notesSur20.filter((note) => note >= 10).length;

    const nombreEchecs = notesSur20.filter((note) => note < 10).length;

    const tauxReussite =
        notesSur20.length > 0 ? (nombreReussites / notesSur20.length) * 100 : 0;

    /*
    |--------------------------------------------------------------------------
    | RÉPARTITION DES APPRÉCIATIONS
    |--------------------------------------------------------------------------
    */

    const appreciations = {
        Excellent: 0,
        "Très bien": 0,
        Bien: 0,
        "Assez bien": 0,
        Moyen: 0,
        Passable: 0,
        Insuffisant: 0,
        "Très insuffisant": 0,
        Faible: 0,
    };

    notesSaisies.forEach((item) => {
        const appreciation = calculerAppreciation(item.note, item.absent);

        if (appreciations[appreciation] !== undefined) {
            appreciations[appreciation]++;
        }
    });

    /*
    |--------------------------------------------------------------------------
    | AFFICHAGE
    |--------------------------------------------------------------------------
    */

    return (
        <AdminLayout>
            <Head title={`Évaluation - ${evaluation.libelle}`} />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="rounded-xl bg-white p-8 shadow">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {evaluation.libelle}
                            </h1>

                            <p className="mt-2 text-gray-500">
                                Consultation de l'évaluation et des résultats
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route("evaluations.index")}
                                className="rounded-lg border px-5 py-3 hover:bg-gray-50"
                            >
                                ← Retour aux évaluations
                            </Link>

                            {canEdit && (
                                <Link
                                    href={route(
                                        "evaluations.edit",
                                        evaluation.id,
                                    )}
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                                >
                                    ✏️ Modifier l'évaluation
                                </Link>
                            )}

                            <Link
                                href={route(
                                    "evaluations.statistiques",
                                    evaluation.id,
                                )}
                                className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                            >
                                📊 Statistiques
                            </Link>

                            {evaluation.active && (
                                <Link
                                    href={route("notes.create", evaluation.id)}
                                    className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                                >
                                    📝 Saisir / modifier les notes
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        INFORMATIONS ÉVALUATION
                    ================================================= */}

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
                                Année scolaire
                            </p>

                            <p className="mt-1 font-semibold">
                                {evaluation.annee_scolaire?.libelle ??
                                    evaluation.anneeScolaire?.libelle ??
                                    "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-500">Classe</p>

                            <p className="mt-1 font-semibold">
                                {evaluation.classe?.libelle ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-gray-500">Barème</p>

                            <p className="mt-1 text-2xl font-bold text-blue-600">
                                /{evaluation.bareme}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-gray-500">Matière</p>

                            <p className="mt-1 font-semibold">
                                {evaluation.matiere?.libelle ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Enseignant</p>

                            <p className="mt-1 font-semibold">
                                {evaluation.enseignant
                                    ? `${evaluation.enseignant.nom ?? ""} ${evaluation.enseignant.prenoms ?? ""}`
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Type</p>

                            <p className="mt-1 font-semibold">
                                {evaluation.type ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Période</p>

                            <p className="mt-1 font-semibold">
                                {evaluation.periode ?? "—"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-gray-500">Numéro</p>

                            <p className="mt-1 font-semibold">
                                {evaluation.numero ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Date de l'évaluation
                            </p>

                            <p className="mt-1 font-semibold">
                                {evaluation.date_evaluation
                                    ? new Date(
                                          evaluation.date_evaluation,
                                      ).toLocaleDateString("fr-FR")
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Coefficient</p>

                            <p className="mt-1 font-semibold">
                                {evaluation.coefficient ?? "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    STATISTIQUES PRINCIPALES
                ===================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Élèves */}

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Élèves concernés
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-800">
                            {totalEleves}
                        </p>
                    </div>

                    {/* Moyenne */}

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Moyenne de la classe
                        </p>

                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            {moyenne !== null
                                ? `${moyenne.toFixed(2)} / 20`
                                : "—"}
                        </p>
                    </div>

                    {/* Meilleure note */}

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Meilleure note</p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {meilleureNote !== null
                                ? `${meilleureNote.toFixed(2)} / 20`
                                : "—"}
                        </p>
                    </div>

                    {/* Plus faible */}

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Plus faible note
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {plusFaibleNote !== null
                                ? `${plusFaibleNote.toFixed(2)} / 20`
                                : "—"}
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    STATISTIQUES SECONDAIRES
                ===================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Présents */}

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Notes saisies</p>

                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {notesSaisies.length}
                        </p>
                    </div>

                    {/* Absents */}

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Absents</p>

                        <p className="mt-2 text-2xl font-bold text-red-600">
                            {absents.length}
                        </p>
                    </div>

                    {/* Non notés */}

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Non notés</p>

                        <p className="mt-2 text-2xl font-bold text-gray-600">
                            {nonNotes.length}
                        </p>
                    </div>

                    {/* Réussite */}

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            Taux de réussite
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {notesSaisies.length > 0
                                ? `${tauxReussite.toFixed(1)} %`
                                : "—"}
                        </p>

                        {notesSaisies.length > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                                {nombreReussites} réussite
                                {nombreReussites > 1 ? "s" : ""} /{" "}
                                {notesSaisies.length}
                            </p>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    RÉPARTITION DES APPRÉCIATIONS
                ===================================================== */}

                <div className="rounded-xl bg-white p-6 shadow">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-gray-800">
                            Répartition des résultats
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Répartition des élèves selon leur note normalisée
                            sur 20
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                        {Object.entries(appreciations).map(
                            ([appreciation, nombre]) => (
                                <div
                                    key={appreciation}
                                    className="rounded-lg border bg-gray-50 p-4"
                                >
                                    <span
                                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${couleurAppreciation(
                                            appreciation,
                                        )}`}
                                    >
                                        {appreciation}
                                    </span>

                                    <p className="mt-3 text-2xl font-bold text-gray-800">
                                        {nombre}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        élève
                                        {nombre > 1 ? "s" : ""}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </div>

                {/* =====================================================
                    TABLEAU DES NOTES
                ===================================================== */}

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="flex flex-col gap-3 border-b bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Résultats des élèves
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Notes originales et normalisation sur 20
                            </p>
                        </div>

                        <div className="rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-700">
                            Barème : /{evaluation.bareme}
                        </div>
                    </div>

                    {notes.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="text-4xl">📝</div>

                            <h3 className="mt-3 text-lg font-semibold text-gray-800">
                                Aucune note enregistrée
                            </h3>

                            <p className="mt-1 text-gray-500">
                                Les notes de cette évaluation n'ont pas encore
                                été saisies.
                            </p>

                            <Link
                                href={route("notes.create", evaluation.id)}
                                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                Saisir les notes
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow">
                            <ResponsiveTable minWidth="750px">
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
                                    {notes.map((item, index) => {
                                        const note =
                                            item.note !== null &&
                                            item.note !== undefined
                                                ? Number(item.note)
                                                : null;

                                        const note20 =
                                            note !== null
                                                ? noteSur20(note)
                                                : null;

                                        const appreciation =
                                            calculerAppreciation(
                                                note,
                                                item.absent,
                                            );

                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-t hover:bg-gray-50"
                                            >
                                                {/* Numéro */}

                                                <td className="px-4 py-4 font-semibold text-gray-500">
                                                    {index + 1}
                                                </td>

                                                {/* Élève */}

                                                <td className="px-4 py-4">
                                                    <div className="font-semibold text-gray-800">
                                                        {item.eleve?.nom ?? "—"}{" "}
                                                        {item.eleve?.prenoms ??
                                                            ""}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {item.eleve
                                                            ?.code_eleve ?? "—"}
                                                    </div>
                                                </td>

                                                {/* Note originale */}

                                                <td className="px-4 py-4 text-center">
                                                    {item.absent ? (
                                                        <span className="font-semibold text-gray-400">
                                                            —
                                                        </span>
                                                    ) : note !== null ? (
                                                        <span className="text-lg font-bold text-gray-700">
                                                            {note.toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Note normalisée */}

                                                <td className="px-4 py-4 text-center">
                                                    {item.absent ? (
                                                        <span className="font-semibold text-gray-400">
                                                            —
                                                        </span>
                                                    ) : note20 !== null ? (
                                                        <span
                                                            className={`text-lg font-bold ${
                                                                note20 >= 10
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {note20.toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            Non saisie
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Statut */}

                                                <td className="px-4 py-4 text-center">
                                                    {item.absent ? (
                                                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                                                            Absent
                                                        </span>
                                                    ) : note !== null ? (
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                                            Présent
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                                            Non noté
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Appréciation */}

                                                <td className="px-4 py-4">
                                                    {note20 !== null &&
                                                    !item.absent ? (
                                                        <span
                                                            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${couleurAppreciation(
                                                                appreciation,
                                                            )}`}
                                                        >
                                                            {appreciation}
                                                        </span>
                                                    ) : item.appreciation ? (
                                                        <span className="text-gray-700">
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
                            </ResponsiveTable>
                        </div>
                    )}
                </div>

                {/* =====================================================
                    LÉGENDE
                ===================================================== */}

                <div className="rounded-xl bg-white p-6 shadow">
                    <h2 className="text-lg font-bold text-gray-800">
                        Barème des appréciations
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(appreciations).map(([appreciation]) => (
                            <span
                                key={appreciation}
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${couleurAppreciation(
                                    appreciation,
                                )}`}
                            >
                                {appreciation}
                            </span>
                        ))}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-3">
                        <p>
                            <strong>18 – 20 :</strong> Excellent
                        </p>

                        <p>
                            <strong>16 – 17,99 :</strong> Très bien
                        </p>

                        <p>
                            <strong>14 – 15,99 :</strong> Bien
                        </p>

                        <p>
                            <strong>12 – 13,99 :</strong> Assez bien
                        </p>

                        <p>
                            <strong>11 – 11,99 :</strong> Moyen
                        </p>

                        <p>
                            <strong>10 – 10,99 :</strong> Passable
                        </p>

                        <p>
                            <strong>8 – 9,99 :</strong> Insuffisant
                        </p>

                        <p>
                            <strong>5 – 7,99 :</strong> Très insuffisant
                        </p>

                        <p>
                            <strong>0 – 4,99 :</strong> Faible
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
