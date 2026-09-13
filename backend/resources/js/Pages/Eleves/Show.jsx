import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

export default function Show({
    eleve,
    historique = [],
    statistiques = {},
}) {
    const [filtre, setFiltre] = useState("tous");

    const historiqueFiltre =
        filtre === "tous"
            ? historique
            : historique.filter(
                  (item) => item.type === filtre
              );

    return (
        <AdminLayout>
            <Head
                title={`Fiche élève - ${eleve.nom} ${eleve.prenoms}`}
            />

            <div className="space-y-6">

                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold">
                            Fiche de l'élève
                        </h1>

                        <p className="text-gray-500">
                            Historique scolaire et disciplinaire
                        </p>
                    </div>

                    <div className="flex gap-3">

                        <Link
                            href={route(
                                "eleves.edit",
                                eleve.id
                            )}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                        >
                            Modifier
                        </Link>

                        <Link
                            href={route("eleves.index")}
                            className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50"
                        >
                            Retour
                        </Link>

                    </div>
                </div>

                {/* =====================================================
                    IDENTITÉ
                ===================================================== */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">

                        <div>
                            <p className="text-sm text-gray-500">
                                Matricule
                            </p>

                            <p className="mt-1 font-bold">
                                {eleve.matricule || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Nom
                            </p>

                            <p className="mt-1 font-bold">
                                {eleve.nom}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Prénoms
                            </p>

                            <p className="mt-1 font-bold">
                                {eleve.prenoms}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Sexe
                            </p>

                            <p className="mt-1 font-bold">
                                {eleve.sexe}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Établissement
                            </p>

                            <p className="mt-1 font-medium">
                                {eleve.etablissement?.nom || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Année scolaire
                            </p>

                            <p className="mt-1 font-medium">
                                {eleve.annee_scolaire?.libelle || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Classe
                            </p>

                            <p className="mt-1 font-medium">
                                {eleve.classe?.libelle || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Statut
                            </p>

                            <p className="mt-1 font-medium">
                                {eleve.statut || "-"}
                            </p>
                        </div>

                    </div>
                </div>

                {/* =====================================================
                    STATISTIQUES
                ===================================================== */}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                    <StatCard
                        titre="Absences"
                        valeur={statistiques.absences ?? 0}
                        couleur="red"
                    />

                    <StatCard
                        titre="Heures d'absence"
                        valeur={statistiques.heures_absence ?? 0}
                        suffix=" h"
                        couleur="orange"
                    />

                    <StatCard
                        titre="Retards"
                        valeur={statistiques.retards ?? 0}
                        couleur="yellow"
                    />

                    <StatCard
                        titre="Minutes de retard"
                        valeur={statistiques.minutes_retard ?? 0}
                        suffix=" min"
                        couleur="purple"
                    />

                    <StatCard
                        titre="Conduites"
                        valeur={statistiques.conduites ?? 0}
                        couleur="blue"
                    />

                    <StatCard
                        titre="Évaluations"
                        valeur={statistiques.notes ?? 0}
                        couleur="green"
                    />

                    <StatCard
                        titre="Absences justifiées"
                        valeur={statistiques.absences_justifiees ?? 0}
                        couleur="emerald"
                    />

                    <StatCard
                        titre="Absences non justifiées"
                        valeur={statistiques.absences_non_justifiees ?? 0}
                        couleur="rose"
                    />

                </div>

                {/* =====================================================
                    HISTORIQUE
                ===================================================== */}

                <div className="rounded-xl border bg-white shadow-sm">

                    <div className="border-b bg-gray-50 p-5">

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>
                                <h2 className="text-xl font-bold">
                                    Historique de l'élève
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Ensemble des événements enregistrés
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">

                                <Filtre
                                    actif={filtre === "tous"}
                                    onClick={() => setFiltre("tous")}
                                >
                                    Tous
                                </Filtre>

                                <Filtre
                                    actif={filtre === "absence"}
                                    onClick={() => setFiltre("absence")}
                                >
                                    Absences
                                </Filtre>

                                <Filtre
                                    actif={filtre === "retard"}
                                    onClick={() => setFiltre("retard")}
                                >
                                    Retards
                                </Filtre>

                                <Filtre
                                    actif={filtre === "conduite"}
                                    onClick={() => setFiltre("conduite")}
                                >
                                    Conduite
                                </Filtre>

                                <Filtre
                                    actif={filtre === "note"}
                                    onClick={() => setFiltre("note")}
                                >
                                    Évaluations
                                </Filtre>

                            </div>

                        </div>
                    </div>

                    {/* =================================================
                        TABLEAU
                    ================================================= */}

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-100">

                                <tr>
                                    <th className="p-3 text-left">
                                        Date
                                    </th>

                                    <th className="p-3 text-left">
                                        Type
                                    </th>

                                    <th className="p-3 text-left">
                                        Année
                                    </th>

                                    <th className="p-3 text-left">
                                        Classe
                                    </th>

                                    <th className="p-3 text-left">
                                        Détails
                                    </th>

                                    <th className="p-3 text-left">
                                        Observation
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {historiqueFiltre.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-8 text-center text-gray-500"
                                        >
                                            Aucun événement enregistré.
                                        </td>
                                    </tr>

                                ) : (

                                    historiqueFiltre.map(
                                        (item, index) => (

                                            <tr
                                                key={`${item.type}-${index}`}
                                                className="border-t hover:bg-gray-50"
                                            >

                                                <td className="p-3 whitespace-nowrap">
                                                    {item.date_formatee || "-"}
                                                </td>

                                                <td className="p-3">
                                                    <TypeBadge
                                                        type={item.type}
                                                    />
                                                </td>

                                                <td className="p-3">
                                                    {item.annee_scolaire || "-"}
                                                </td>

                                                <td className="p-3">
                                                    {item.classe || "-"}
                                                </td>

                                                <td className="p-3">

                                                    {item.type === "absence" && (
                                                        <div>
                                                            <div>
                                                                <strong>
                                                                    {item.duree ?? 0}
                                                                </strong>{" "}
                                                                heure(s)
                                                            </div>

                                                            <div className="text-sm text-gray-500">
                                                                {item.justifiee
                                                                    ? "Justifiée"
                                                                    : "Non justifiée"}
                                                            </div>

                                                            {item.motif && (
                                                                <div className="text-sm">
                                                                    Motif : {item.motif}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {item.type === "retard" && (
                                                        <div>
                                                            <div>
                                                                <strong>
                                                                    {item.duree ?? 0}
                                                                </strong>{" "}
                                                                minute(s)
                                                            </div>

                                                            <div className="text-sm text-gray-500">
                                                                Prévu :{" "}
                                                                {item.heure_prevue ||
                                                                    "-"}
                                                            </div>

                                                            <div className="text-sm text-gray-500">
                                                                Arrivée :{" "}
                                                                {item.heure_arrivee ||
                                                                    "-"}
                                                            </div>

                                                            {item.motif && (
                                                                <div className="text-sm">
                                                                    Motif : {item.motif}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {item.type === "conduite" && (
                                                        <div>
                                                            {item.note !== null &&
                                                                item.note !== undefined && (
                                                                    <div>
                                                                        Note :{" "}
                                                                        <strong>
                                                                            {item.note}
                                                                        </strong>
                                                                    </div>
                                                                )}

                                                            {item.educateur && (
                                                                <div className="text-sm text-gray-500">
                                                                    Éducateur :{" "}
                                                                    {item.educateur}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {item.type === "note" && (
                                                        <div>
                                                            <div>
                                                                <strong>
                                                                    {item.note ?? "-"}
                                                                </strong>

                                                                {item.bareme && (
                                                                    <>
                                                                        {" "}
                                                                        /{" "}
                                                                        {item.bareme}
                                                                    </>
                                                                )}
                                                            </div>

                                                            {item.matiere && (
                                                                <div className="text-sm">
                                                                    {item.matiere}
                                                                </div>
                                                            )}

                                                            {item.evaluation && (
                                                                <div className="text-sm text-gray-500">
                                                                    {item.evaluation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                </td>

                                                <td className="p-3 text-sm text-gray-600">
                                                    {item.observation ||
                                                        item.appreciation ||
                                                        "-"}
                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}

/*
|--------------------------------------------------------------------------
| CARTE STATISTIQUE
|--------------------------------------------------------------------------
*/

function StatCard({
    titre,
    valeur,
    suffix = "",
}) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
                {titre}
            </p>

            <p className="mt-2 text-2xl font-bold">
                {valeur}
                {suffix}
            </p>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| FILTRE
|--------------------------------------------------------------------------
*/

function Filtre({
    actif,
    onClick,
    children,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                actif
                    ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            }
        >
            {children}
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| BADGE TYPE
|--------------------------------------------------------------------------
*/

function TypeBadge({ type }) {

    const styles = {
        absence:
            "bg-red-100 text-red-700",

        retard:
            "bg-orange-100 text-orange-700",

        conduite:
            "bg-purple-100 text-purple-700",

        note:
            "bg-green-100 text-green-700",
    };

    const labels = {
        absence: "Absence",
        retard: "Retard",
        conduite: "Conduite",
        note: "Évaluation",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                styles[type]
            }`}
        >
            {labels[type]}
        </span>
    );
}