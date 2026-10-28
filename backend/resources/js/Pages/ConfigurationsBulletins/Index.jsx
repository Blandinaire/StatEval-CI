import React from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Index({
    configuration = null,
    etablissements = [],
    etablissementSelectionne = null,
    isSuperAdmin = false,
}) {
    const valeursInitiales = {
        etablissement_id: etablissementSelectionne ?? "",
        format: configuration?.format ?? "a4",
        afficher_appreciations: configuration?.afficher_appreciations ?? true,
        afficher_professeurs: configuration?.afficher_professeurs ?? true,
        afficher_rang: configuration?.afficher_rang ?? true,
        afficher_absences_retards:
            configuration?.afficher_absences_retards ?? true,
        afficher_conduite: configuration?.afficher_conduite ?? true,
        afficher_observations: configuration?.afficher_observations ?? true,
        afficher_directeur: configuration?.afficher_directeur ?? true,
        afficher_signatures: configuration?.afficher_signatures ?? true,
    };

    const { data, setData, put, processing, errors } =
        useForm(valeursInitiales);

    const choisirEtablissement = (id) => {
        router.get(
            route("configurations-bulletins.index"),
            id ? { etablissement_id: id } : {},
            { preserveScroll: true },
        );
    };

    const options = [
        ["afficher_appreciations", "Appréciations pour chaque matière"],
        ["afficher_professeurs", "Noms des professeurs par matière"],
        ["afficher_rang", "Rang de l'élève dans la classe"],
        ["afficher_absences_retards", "Absences et retards"],
        ["afficher_conduite", "Conduite"],
        ["afficher_observations", "Observations générales"],
        ["afficher_directeur", "Nom du directeur"],
        ["afficher_signatures", "Espaces de signature et cachet"],
    ];

    const enregistrer = (e) => {
        e.preventDefault();

        put(route("configurations-bulletins.update"), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Configuration des bulletins" />

            <AdminLayout>
                <div className="space-y-6 p-4 md:p-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Configuration des bulletins
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Personnalise la présentation et les informations
                            imprimées sur les bulletins de ton établissement.
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <div className="rounded-xl border bg-white p-4">
                            <label className="mb-2 block text-sm font-medium">
                                Établissement à configurer
                            </label>
                            <select
                                value={etablissementSelectionne ?? ""}
                                onChange={(e) =>
                                    choisirEtablissement(e.target.value)
                                }
                                className="w-full rounded-lg border-slate-300 md:max-w-lg"
                            >
                                <option value="">
                                    Sélectionner un établissement
                                </option>
                                {etablissements.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <form onSubmit={enregistrer} className="space-y-6">
                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="text-lg font-semibold text-slate-800">
                                Format d'impression
                            </h2>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                                {[
                                    {
                                        value: "a4",
                                        title: "A4 classique",
                                        description: "Un bulletin par page A4.",
                                    },
                                    {
                                        value: "souche",
                                        title: "Avec souche",
                                        description:
                                            "Bulletin avec partie détachable.",
                                    },
                                    {
                                        value: "double",
                                        title: "Deux bulletins par page",
                                        description:
                                            "Deux bulletins sur une feuille A4.",
                                    },
                                ].map((format) => (
                                    <label
                                        key={format.value}
                                        className={`cursor-pointer rounded-lg border p-4 ${
                                            data.format === format.value
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-slate-200"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="format"
                                            value={format.value}
                                            checked={
                                                data.format === format.value
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "format",
                                                    e.target.value,
                                                )
                                            }
                                            className="mr-2"
                                        />
                                        <span className="font-medium">
                                            {format.title}
                                        </span>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {format.description}
                                        </p>
                                    </label>
                                ))}
                            </div>

                            {errors.format && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.format}
                                </p>
                            )}
                        </section>

                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="text-lg font-semibold text-slate-800">
                                Éléments à afficher
                            </h2>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                {options.map(([champ, libelle]) => (
                                    <label
                                        key={champ}
                                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data[champ])}
                                            onChange={(e) =>
                                                setData(champ, e.target.checked)
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                        />
                                        <span className="text-sm text-slate-700">
                                            {libelle}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    (isSuperAdmin && !etablissementSelectionne)
                                }
                                className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? "Enregistrement..."
                                    : "Enregistrer la configuration"}
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}
