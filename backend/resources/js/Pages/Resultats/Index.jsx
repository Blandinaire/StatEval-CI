import React from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Index({
    classes = [],
    classeSelectionnee,
    periodeSelectionnee,
    periodes = [],
    resultats = [],
    etablissements = [],
    etablissementSelectionne,
    isSuperAdmin = false,
}) {
    const classe = classes.find(
        (item) => Number(item.id) === Number(classeSelectionnee),
    );

    const choisir = (nom, valeur) => {
        const params = {};

        if (etablissementSelectionne) {
            params.etablissement_id = etablissementSelectionne;
        }

        if (classeSelectionnee) {
            params.classe_id = classeSelectionnee;
        }

        if (periodeSelectionnee) {
            params.periode = periodeSelectionnee;
        }

        if (nom === "etablissement_id") {
            if (valeur) {
                params.etablissement_id = valeur;
            } else {
                delete params.etablissement_id;
            }

            delete params.classe_id;
            delete params.periode;
        } else if (nom === "classe_id") {
            if (valeur) {
                params.classe_id = valeur;
            } else {
                delete params.classe_id;
            }

            delete params.periode;
        } else {
            if (valeur) {
                params.periode = valeur;
            } else {
                delete params.periode;
            }
        }

        router.get(route("resultats.index"), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const note = (valeur) =>
        valeur === null || valeur === undefined
            ? "—"
            : `${Number(valeur).toFixed(2)} / 20`;

    return (
        <AdminLayout>
            <Head title="Résultats scolaires" />

            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Résultats scolaires
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Moyennes par matière et moyennes générales pondérées.
                    </p>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 md:flex-row">
                    {isSuperAdmin && (
                        <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium">
                                Établissement
                            </label>

                            <select
                                className="w-full rounded-lg border-slate-300"
                                value={etablissementSelectionne ?? ""}
                                onChange={(e) =>
                                    choisir("etablissement_id", e.target.value)
                                }
                            >
                                <option value="">
                                    Tous les établissements
                                </option>

                                {etablissements.map((etablissement) => (
                                    <option
                                        key={etablissement.id}
                                        value={etablissement.id}
                                    >
                                        {etablissement.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex-1">
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
                            <option value="">Sélectionner une classe</option>
                            {classes.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium">
                            Période
                        </label>
                        <select
                            className="w-full rounded-lg border-slate-300"
                            value={periodeSelectionnee ?? ""}
                            onChange={(e) => choisir("periode", e.target.value)}
                            disabled={!classeSelectionnee}
                        >
                            <option value="">Toutes les périodes</option>
                            {periodes.map((periode) => (
                                <option key={periode} value={periode}>
                                    {periode}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {classeSelectionnee && (
                    <div className="overflow-x-auto rounded-xl border bg-white">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">
                                {classe?.libelle ?? "Classe sélectionnée"}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {resultats.length} élève(s)
                            </p>
                        </div>

                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left">
                                <tr>
                                    <th className="p-3">Élève</th>
                                    <th className="p-3">Matricule</th>
                                    {resultats[0]?.matieres.map((matiere) => (
                                        <th
                                            key={matiere.matiere_id}
                                            className="p-3 text-center"
                                        >
                                            {matiere.matiere}
                                            <div className="text-xs font-normal">
                                                Coef. {matiere.coefficient}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="p-3 text-center">
                                        Moyenne générale
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {resultats.map((eleve, index) => (
                                    <tr
                                        key={eleve.eleve_id}
                                        className="border-t hover:bg-slate-50"
                                    >
                                        <td className="p-3 font-medium">
                                            {eleve.nom} {eleve.prenoms}
                                        </td>
                                        <td className="p-3">
                                            {eleve.matricule || "—"}
                                        </td>

                                        {eleve.matieres.map((matiere) => (
                                            <td
                                                key={matiere.matiere_id}
                                                className="p-3 text-center"
                                            >
                                                {note(matiere.moyenne)}
                                            </td>
                                        ))}

                                        <td className="p-3 text-center font-bold">
                                            {note(eleve.moyenne_generale)}
                                        </td>
                                    </tr>
                                ))}

                                {resultats.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            Aucun résultat disponible pour cette
                                            sélection.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
