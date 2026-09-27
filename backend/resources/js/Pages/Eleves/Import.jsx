import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import * as XLSX from "xlsx";

export default function Import({ etablissements, annees }) {
    const { flash } = usePage().props;

    const import_errors = flash?.import_errors ?? [];

    const correctionToken = flash?.import_correction_token ?? null;

    const { data, setData, post, processing, errors, progress } = useForm({
        etablissement_id: "",
        annee_scolaire_id: "",
        fichier: null,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("eleves.import"), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const telechargerModele = () => {
        if (!data.etablissement_id || !data.annee_scolaire_id) {
            return;
        }

        window.location.href = route("eleves.import.template", {
            etablissement_id: data.etablissement_id,
            annee_scolaire_id: data.annee_scolaire_id,
        });
    };

    const telechargerRapportErreurs = () => {
        if (!import_errors.length) {
            return;
        }

        const donnees = import_errors.map((erreur) => ({
            Ligne: erreur.ligne ?? "",
            Élève:
                [erreur.nom, erreur.prenoms].filter(Boolean).join(" ").trim() ||
                "—",
            Champ: erreur.champ ?? "—",
            Valeur: erreur.valeur ?? "—",
            Erreur: Array.isArray(erreur.erreurs)
                ? erreur.erreurs.join(" | ")
                : (erreur.erreurs ?? "Erreur inconnue."),
        }));

        const worksheet = XLSX.utils.json_to_sheet(donnees);

        // Largeur des colonnes
        worksheet["!cols"] = [
            { wch: 10 },
            { wch: 35 },
            { wch: 25 },
            { wch: 30 },
            { wch: 80 },
        ];

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Erreurs d'importation",
        );

        const date = new Date().toISOString().slice(0, 10);

        XLSX.writeFile(workbook, `rapport_erreurs_import_eleves_${date}.xlsx`);
    };

    return (
        <AdminLayout>
            <Head title="Importer les élèves" />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* En-tête */}
                <div>
                    <h1 className="text-3xl font-bold">Importer les élèves</h1>

                    <p className="mt-1 text-gray-500">
                        Importation des élèves depuis un fichier Excel ou CSV.
                    </p>
                </div>

                {/* Informations importantes */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h2 className="font-semibold text-blue-900">
                        Informations importantes
                    </h2>

                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-blue-800">
                        <li>
                            L'établissement et l'année scolaire sont
                            sélectionnés ici et ne doivent pas figurer dans le
                            fichier Excel.
                        </li>

                        <li>
                            La classe de chaque élève doit être inscrite
                            explicitement dans la colonne{" "}
                            <strong>classe</strong>.
                        </li>

                        <li>
                            Les champs Oui/Non doivent être renseignés à l'aide
                            des listes déroulantes du modèle Excel.
                        </li>

                        <li>
                            Le modèle Excel contient des listes déroulantes pour
                            la classe, le sexe, le régime, le statut, le statut
                            d'affectation, le type de tuteur, le groupe sanguin
                            et les champs Oui/Non.
                        </li>

                        <li>
                            Le fichier accepté peut être au format{" "}
                            <strong>.xlsx</strong>, <strong>.xls</strong> ou{" "}
                            <strong>.csv</strong>.
                        </li>

                        <li>
                            La taille maximale du fichier est de{" "}
                            <strong>10 Mo</strong>.
                        </li>
                    </ul>
                </div>

                {/* Rapport d'erreurs d'importation */}
                {/* Rapport d'importation */}
                {(import_errors.length > 0 || flash?.import_summary) && (
                    <div className="space-y-4">
                        {/* Résumé */}
                        {flash?.import_summary && (
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Importés */}
                                <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">✅</div>

                                        <div>
                                            <p className="text-sm font-medium text-green-700">
                                                Élèves importés
                                            </p>

                                            <p className="text-2xl font-bold text-green-900">
                                                {flash.import_summary.importes}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Erreurs */}
                                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">⚠️</div>

                                        <div>
                                            <p className="text-sm font-medium text-red-700">
                                                Lignes rejetées
                                            </p>

                                            <p className="text-2xl font-bold text-red-900">
                                                {flash.import_summary.erreurs}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Détail des erreurs */}
                        {import_errors.length > 0 && (
                            <div className="rounded-xl border border-red-300 bg-red-50 p-5">
                                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-red-800">
                                            ⚠️ Rapport des élèves rejetés
                                        </h2>

                                        <p className="mt-1 text-sm text-red-700">
                                            {import_errors.length} erreur(s) ont
                                            été détectée(s). Les lignes
                                            concernées n'ont pas été importées.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={telechargerRapportErreurs}
                                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                                    >
                                        📥 Télécharger le rapport
                                    </button>

                                    {correctionToken && (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <a
                                                href={route(
                                                    "eleves.import.correction",
                                                    correctionToken,
                                                )}
                                                className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                                            >
                                                📥 Télécharger les élèves à
                                                corriger
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-red-200 bg-white">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-red-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-red-900">
                                                    Ligne
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold text-red-900">
                                                    Élève
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold text-red-900">
                                                    Champ
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold text-red-900">
                                                    Valeur
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold text-red-900">
                                                    Erreur
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-red-100">
                                            {import_errors.map(
                                                (erreur, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-red-50"
                                                    >
                                                        <td className="px-4 py-3 font-medium text-gray-900">
                                                            {erreur.ligne}
                                                        </td>

                                                        <td className="px-4 py-3 font-medium text-gray-900">
                                                            {[
                                                                erreur.nom,
                                                                erreur.prenoms,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(" ") ||
                                                                "—"}
                                                        </td>

                                                        <td className="px-4 py-3 text-gray-700">
                                                            {erreur.champ ??
                                                                "—"}
                                                        </td>

                                                        <td className="px-4 py-3 text-gray-700">
                                                            {erreur.valeur ??
                                                                "—"}
                                                        </td>

                                                        <td className="px-4 py-3 text-red-700">
                                                            <ul className="list-disc space-y-1 pl-5">
                                                                {erreur.erreurs?.map(
                                                                    (
                                                                        message,
                                                                        messageIndex,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                messageIndex
                                                                            }
                                                                        >
                                                                            {
                                                                                message
                                                                            }
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Formulaire */}
                <div className="rounded-xl bg-white p-8 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Établissement */}
                        <div>
                            <label
                                htmlFor="etablissement_id"
                                className="mb-2 block font-medium text-gray-700"
                            >
                                Établissement
                            </label>

                            <select
                                id="etablissement_id"
                                value={data.etablissement_id}
                                onChange={(e) =>
                                    setData("etablissement_id", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="">
                                    Sélectionner un établissement
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

                            {errors.etablissement_id && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.etablissement_id}
                                </p>
                            )}
                        </div>

                        {/* Année scolaire */}
                        <div>
                            <label
                                htmlFor="annee_scolaire_id"
                                className="mb-2 block font-medium text-gray-700"
                            >
                                Année scolaire
                            </label>

                            <select
                                id="annee_scolaire_id"
                                value={data.annee_scolaire_id}
                                onChange={(e) =>
                                    setData("annee_scolaire_id", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="">
                                    Sélectionner une année scolaire
                                </option>

                                {annees.map((annee) => (
                                    <option key={annee.id} value={annee.id}>
                                        {annee.libelle ??
                                            `${annee.date_debut} - ${annee.date_fin}`}
                                    </option>
                                ))}
                            </select>

                            {errors.annee_scolaire_id && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.annee_scolaire_id}
                                </p>
                            )}
                        </div>

                        {/* Fichier */}
                        <div>
                            <label
                                htmlFor="fichier"
                                className="mb-2 block font-medium text-gray-700"
                            >
                                Fichier Excel / CSV
                            </label>

                            <input
                                id="fichier"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) =>
                                    setData(
                                        "fichier",
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                            />

                            <p className="mt-2 text-sm text-gray-500">
                                Formats acceptés : XLSX, XLS ou CSV — maximum 10
                                Mo.
                            </p>

                            {errors.fichier && (
                                <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {errors.fichier}
                                </div>
                            )}
                        </div>

                        {/* Barre de progression */}
                        {progress && (
                            <div>
                                <div className="mb-2 flex justify-between text-sm text-gray-600">
                                    <span>Importation en cours...</span>
                                    <span>{progress.percentage}%</span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${progress.percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Boutons */}
                        <div className="flex items-center justify-between gap-3 border-t pt-6">
                            <button
                                type="button"
                                onClick={telechargerModele}
                                disabled={
                                    !data.etablissement_id ||
                                    !data.annee_scolaire_id
                                }
                                className="rounded-lg border border-green-600 px-5 py-3 font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                📥 Télécharger le modèle Excel
                            </button>

                            <div className="flex items-center gap-3">
                                <a
                                    href={route("eleves.index")}
                                    className="rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-50"
                                >
                                    Annuler
                                </a>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.etablissement_id ||
                                        !data.annee_scolaire_id ||
                                        !data.fichier
                                    }
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? "Importation en cours..."
                                        : "Importer les élèves"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
