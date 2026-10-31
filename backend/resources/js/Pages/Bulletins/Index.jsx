import React from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

const configurationParDefaut = {
    format: "a4",
    afficher_appreciations: true,
    afficher_professeurs: true,
    afficher_rang: true,
    afficher_absences_retards: true,
    afficher_conduite: true,
    afficher_observations: true,
    afficher_directeur: true,
    afficher_signatures: true,
};

export default function Index({
    etablissements = [],
    etablissementSelectionne,
    isSuperAdmin = false,
    classes = [],
    classeSelectionnee,
    periodes = [],
    periodeSelectionnee,
    eleves = [],
    eleveSelectionne,
    bulletin = null,
    configuration = null,
}) {
    const config = {
        ...configurationParDefaut,
        ...(configuration ?? {}),
    };

    const choisir = (nom, valeur) => {
        const params = {};

        if (etablissementSelectionne) {
            params.etablissement_id = etablissementSelectionne;
        }

        if (classeSelectionnee) {
            params.classe_id = classeSelectionnee;
        }

        if (periodeSelectionnee) {
            params.periode_id = periodeSelectionnee;
        }

        if (eleveSelectionne) {
            params.eleve_id = eleveSelectionne;
        }

        if (nom === "etablissement_id") {
            if (valeur) params.etablissement_id = valeur;
            else delete params.etablissement_id;

            delete params.classe_id;
            delete params.periode_id;
            delete params.eleve_id;
        } else if (nom === "classe_id") {
            if (valeur) params.classe_id = valeur;
            else delete params.classe_id;

            delete params.periode_id;
            delete params.eleve_id;
        } else if (nom === "periode_id") {
            if (valeur) params.periode_id = valeur;
            else delete params.periode_id;

            delete params.eleve_id;
        } else if (nom === "eleve_id") {
            if (valeur) params.eleve_id = valeur;
            else delete params.eleve_id;
        }

        router.get(route("bulletins.index"), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const afficherNote = (valeur) =>
        valeur === null || valeur === undefined || valeur === ""
            ? "—"
            : `${Number(valeur).toFixed(2)} / 20`;

    const imprimer = () => window.print();

    return (
        <>
            <Head title="Bulletins scolaires" />

            <AdminLayout>
                <div className="space-y-6 p-4 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Bulletins scolaires
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Préparation et impression des bulletins
                                scolaires.
                            </p>
                        </div>

                        {bulletin && (
                            <button
                                type="button"
                                onClick={imprimer}
                                className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
                            >
                                Imprimer le bulletin
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-4 md:grid-cols-2 lg:grid-cols-4 print:hidden">
                        {isSuperAdmin && (
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Établissement
                                </label>
                                <select
                                    className="w-full rounded-lg border-slate-300"
                                    value={etablissementSelectionne ?? ""}
                                    onChange={(e) =>
                                        choisir(
                                            "etablissement_id",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Tous les établissements
                                    </option>
                                    {etablissements.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Classe
                            </label>
                            <select
                                className="w-full rounded-lg border-slate-300"
                                value={classeSelectionnee ?? ""}
                                onChange={(e) =>
                                    choisir("classe_id", e.target.value)
                                }
                            >
                                <option value="">
                                    Sélectionner une classe
                                </option>
                                {classes.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Période
                            </label>
                            <select
                                className="w-full rounded-lg border-slate-300"
                                value={periodeSelectionnee ?? ""}
                                onChange={(e) =>
                                    choisir("periode_id", e.target.value)
                                }
                                disabled={!classeSelectionnee}
                            >
                                <option value="">
                                    Sélectionner une période
                                </option>

                                {periodes.map((periode) => (
                                    <option key={periode.id} value={periode.id}>
                                        {periode.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Élève
                            </label>
                            <select
                                className="w-full rounded-lg border-slate-300"
                                value={eleveSelectionne ?? ""}
                                onChange={(e) =>
                                    choisir("eleve_id", e.target.value)
                                }
                                disabled={
                                    !classeSelectionnee || !periodeSelectionnee
                                }
                            >
                                <option value="">Sélectionner un élève</option>
                                {eleves.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nom} {item.prenoms}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {bulletin ? (
                        <div
                            id="bulletin-a-imprimer"
                            className={`bulletin-print rounded-xl border bg-white p-6 md:p-10 ${
                                config.format === "souche"
                                    ? "bulletin-souche"
                                    : config.format === "double"
                                      ? "bulletin-double"
                                      : ""
                            }`}
                        >
                            <header className="border-b-2 border-slate-800 pb-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        {bulletin.etablissement?.logo && (
                                            <img
                                                src={
                                                    bulletin.etablissement.logo.startsWith(
                                                        "http",
                                                    )
                                                        ? bulletin.etablissement
                                                              .logo
                                                        : `/storage/${bulletin.etablissement.logo.replace(/^\/+/, "")}`
                                                }
                                                alt="Logo de l'établissement"
                                                className="h-20 w-20 object-contain"
                                            />
                                        )}

                                        <div>
                                            <h2 className="text-lg font-bold uppercase">
                                                {bulletin.etablissement?.nom ||
                                                    "Établissement scolaire"}
                                            </h2>

                                            {bulletin.etablissement?.sigle && (
                                                <p className="text-sm font-semibold">
                                                    {
                                                        bulletin.etablissement
                                                            .sigle
                                                    }
                                                </p>
                                            )}

                                            {bulletin.etablissement
                                                ?.adresse && (
                                                <p className="text-xs">
                                                    {
                                                        bulletin.etablissement
                                                            .adresse
                                                    }
                                                    {bulletin.etablissement
                                                        .ville
                                                        ? `, ${bulletin.etablissement.ville}`
                                                        : ""}
                                                </p>
                                            )}

                                            {bulletin.etablissement
                                                ?.telephone && (
                                                <p className="text-xs">
                                                    Tél. :{" "}
                                                    {
                                                        bulletin.etablissement
                                                            .telephone
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            ANNÉE SCOLAIRE
                                        </p>
                                        <p className="text-sm">
                                            {bulletin.annee_scolaire || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 text-center">
                                    <h2 className="text-xl font-bold uppercase">
                                        Bulletin scolaire
                                    </h2>
                                    <p className="mt-1 font-semibold">
                                        {bulletin.periode}
                                    </p>
                                </div>
                            </header>

                            <section className="my-5 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                <p>
                                    <strong>Élève :</strong>{" "}
                                    {bulletin.eleve.nom}{" "}
                                    {bulletin.eleve.prenoms}
                                </p>
                                <p>
                                    <strong>Matricule :</strong>{" "}
                                    {bulletin.eleve.matricule || "—"}
                                </p>
                                <p>
                                    <strong>Classe :</strong> {bulletin.classe}
                                </p>

                                {config.afficher_rang && (
                                    <p>
                                        <strong>Rang :</strong>{" "}
                                        {bulletin.rang
                                            ? `${bulletin.rang}${bulletin.rang === 1 ? "er" : "e"} / ${bulletin.effectif_classe}`
                                            : "Non classé"}
                                    </p>
                                )}
                            </section>

                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="border border-slate-400 p-2 text-left">
                                            Matières
                                        </th>

                                        <th className="border border-slate-400 p-2 text-center">
                                            Coefficient
                                        </th>
                                        <th className="border border-slate-400 p-2 text-center">
                                            Moyenne / 20
                                        </th>
                                        {config.afficher_appreciations && (
                                            <th className="border border-slate-400 p-2 text-left">
                                                Appréciation
                                            </th>
                                        )}
                                        {config.afficher_professeurs && (
                                            <th className="border border-slate-400 p-2 text-left">
                                                Professeur
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bulletin.matieres.map((matiere) => (
                                        <tr key={matiere.matiere_id}>
                                            <td className="border border-slate-400 p-2">
                                                {matiere.matiere}
                                            </td>

                                            <td className="border border-slate-400 p-2 text-center">
                                                {matiere.coefficient}
                                            </td>
                                            <td className="border border-slate-400 p-2 text-center">
                                                {afficherNote(matiere.moyenne)}
                                            </td>
                                            {config.afficher_appreciations && (
                                                <td className="border border-slate-400 p-2">
                                                    {matiere.appreciation ||
                                                        "—"}
                                                </td>
                                            )}
                                            {config.afficher_professeurs && (
                                                <td className="border border-slate-400 p-2">
                                                    {matiere.professeur || "—"}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-5 flex justify-end">
                                <div className="min-w-64 rounded-lg border-2 border-slate-800 p-4 text-right">
                                    <p className="text-sm font-semibold">
                                        Moyenne générale
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {afficherNote(
                                            bulletin.moyenne_generale,
                                        )}
                                    </p>
                                </div>
                            </div>

                            {config.afficher_absences_retards && (
                                <section className="mt-5">
                                    <h3 className="mb-2 font-bold">
                                        Assiduité
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                                        <div className="border p-3">
                                            <p className="text-slate-500">
                                                Absences
                                            </p>
                                            <p className="font-semibold">
                                                {bulletin.absences?.nombre ?? 0}
                                            </p>
                                        </div>
                                        <div className="border p-3">
                                            <p className="text-slate-500">
                                                Heures d'absence
                                            </p>
                                            <p className="font-semibold">
                                                {bulletin.absences?.heures ?? 0}
                                            </p>
                                        </div>
                                        <div className="border p-3">
                                            <p className="text-slate-500">
                                                Absences justifiées
                                            </p>
                                            <p className="font-semibold">
                                                {bulletin.absences
                                                    ?.justifiees ?? 0}
                                            </p>
                                        </div>
                                        <div className="border p-3">
                                            <p className="text-slate-500">
                                                Retards
                                            </p>
                                            <p className="font-semibold">
                                                {bulletin.retards?.nombre ?? 0}{" "}
                                                (
                                                {bulletin.retards?.minutes ?? 0}{" "}
                                                min)
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Données cumulées sur l'année scolaire.
                                    </p>
                                </section>
                            )}

                            {(config.afficher_conduite ||
                                config.afficher_observations) && (
                                <section className="mt-5 space-y-3">
                                    {config.afficher_conduite && (
                                        <div>
                                            <h3 className="font-bold">
                                                Conduite
                                            </h3>
                                            <p className="mt-1 text-sm">
                                                Note :{" "}
                                                {bulletin.conduite === null ||
                                                bulletin.conduite === undefined
                                                    ? "—"
                                                    : bulletin.conduite}
                                                {" / 20"}
                                            </p>
                                        </div>
                                    )}

                                    {config.afficher_observations && (
                                        <div>
                                            <h3 className="font-bold">
                                                Observations générales
                                            </h3>
                                            <p className="mt-1 min-h-10 border-b border-slate-300 py-2 text-sm">
                                                {bulletin.observation_conduite ||
                                                    " "}
                                            </p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {(config.afficher_directeur ||
                                config.afficher_signatures) && (
                                <footer className="mt-12 grid grid-cols-2 gap-8 text-sm">
                                    <div>
                                        {config.afficher_directeur && (
                                            <p className="font-semibold">
                                                {bulletin.etablissement
                                                    ?.directeur
                                                    ? `Le Directeur : ${bulletin.etablissement.directeur}`
                                                    : "Le responsable de l’établissement"}
                                            </p>
                                        )}

                                        {config.afficher_signatures && (
                                            <div className="mt-12 border-t border-slate-400 pt-2">
                                                Signature et cachet
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {config.afficher_signatures && (
                                            <>
                                                <p className="font-semibold">
                                                    Le parent ou tuteur
                                                </p>
                                                <div className="mt-12 border-t border-slate-400 pt-2">
                                                    Signature
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </footer>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-500 print:hidden">
                            Sélectionne une classe, une période et un élève pour
                            afficher son bulletin.
                        </div>
                    )}
                </div>
            </AdminLayout>

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }

                    body {
                        background: white !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #bulletin-a-imprimer,
                    #bulletin-a-imprimer * {
                        visibility: visible;
                    }

                    #bulletin-a-imprimer {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }

                    .bulletin-print {
                        color: black !important;
                    }

                    table {
                        page-break-inside: auto;
                    }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                }
            `}</style>
        </>
    );
}
