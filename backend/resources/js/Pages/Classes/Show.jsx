import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Show({ classe, eleves = [], evaluations = [] }) {
    const [periodeFiltre, setPeriodeFiltre] = useState("");
    const [typeFiltre, setTypeFiltre] = useState("");
    const [matiereFiltre, setMatiereFiltre] = useState("");
    const [recherche, setRecherche] = useState("");

    const periodes = [
        ...new Set(
            evaluations.map((evaluation) => evaluation.periode).filter(Boolean),
        ),
    ];
    const types = [
        ...new Set(
            evaluations.map((evaluation) => evaluation.type).filter(Boolean),
        ),
    ];
    const matieres = [
        ...new Map(
            evaluations
                .filter(
                    (evaluation) => evaluation.matiere_id && evaluation.matiere,
                )
                .map((evaluation) => [
                    String(evaluation.matiere_id),
                    evaluation.matiere,
                ]),
        ),
    ];

    const evaluationsFiltrees = useMemo(
        () =>
            evaluations.filter((evaluation) => {
                const texte =
                    `${evaluation.libelle} ${evaluation.matiere ?? ""} ${evaluation.type ?? ""}`.toLowerCase();

                return (
                    (!periodeFiltre || evaluation.periode === periodeFiltre) &&
                    (!typeFiltre || evaluation.type === typeFiltre) &&
                    (!matiereFiltre ||
                        String(evaluation.matiere_id) === matiereFiltre) &&
                    (!recherche || texte.includes(recherche.toLowerCase()))
                );
            }),
        [evaluations, periodeFiltre, typeFiltre, matiereFiltre, recherche],
    );

    function reinitialiserFiltres() {
        setPeriodeFiltre("");
        setTypeFiltre("");
        setMatiereFiltre("");
        setRecherche("");
    }

    return (
        <AdminLayout>
            <Head title={`Classe ${classe.libelle}`} />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {classe.niveau?.libelle ?? "Classe"} ·{" "}
                            {classe.annee_scolaire?.libelle ?? ""}
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-gray-800">
                            {classe.libelle}
                        </h1>
                        <p className="mt-1 text-gray-500">
                            {eleves.length} élève
                            {eleves.length === 1 ? "" : "s"}
                            {evaluations.length > 0 &&
                                ` · ${evaluations.length} évaluation${evaluations.length === 1 ? "" : "s"}`}
                        </p>
                    </div>

                    <Link
                        href={route("classes.index")}
                        className="self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:self-auto"
                    >
                        Retour aux classes
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-sm font-medium text-gray-700">
                        Trimestre
                        <select
                            value={periodeFiltre}
                            onChange={(event) =>
                                setPeriodeFiltre(event.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                        >
                            <option value="">Tous les trimestres</option>
                            {periodes.map((periode) => (
                                <option key={periode} value={periode}>
                                    {periode}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm font-medium text-gray-700">
                        Type d’évaluation
                        <select
                            value={typeFiltre}
                            onChange={(event) =>
                                setTypeFiltre(event.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                        >
                            <option value="">Tous les types</option>
                            {types.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm font-medium text-gray-700">
                        Matière
                        <select
                            value={matiereFiltre}
                            onChange={(event) =>
                                setMatiereFiltre(event.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                        >
                            <option value="">Toutes les matières</option>
                            {matieres.map(([id, libelle]) => (
                                <option key={id} value={id}>
                                    {libelle}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm font-medium text-gray-700">
                        Recherche
                        <input
                            type="search"
                            value={recherche}
                            onChange={(event) =>
                                setRecherche(event.target.value)
                            }
                            placeholder="Nom d’évaluation, matière…"
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                        />
                    </label>

                    <div className="flex items-end justify-between gap-3 text-sm text-gray-500 sm:col-span-2 lg:col-span-4">
                        <span>
                            {evaluationsFiltrees.length} évaluation(s)
                            affichée(s)
                        </span>
                        <button
                            type="button"
                            onClick={reinitialiserFiltres}
                            className="rounded-md border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <ResponsiveTable minWidth="900px">
                        <thead className="bg-gray-100 text-sm text-gray-700">
                            <tr>
                                <th className="w-16 p-4 text-center">N°</th>
                                <th className="p-4 text-left">Matricule</th>
                                <th className="p-4 text-left">Nom</th>
                                <th className="p-4 text-left">Prénom</th>
                                <th className="p-4 text-left">Genre</th>
                                {evaluationsFiltrees.map((evaluation) => (
                                    <th
                                        key={evaluation.id}
                                        className="min-w-40 p-4 text-center"
                                    >
                                        <span className="block font-semibold">
                                            {evaluation.matiere ?? "Matière"}
                                        </span>
                                        <span className="block font-normal">
                                            {evaluation.libelle}
                                        </span>
                                        <span className="block text-xs font-normal text-gray-500">
                                            {evaluation.date} · /
                                            {evaluation.bareme}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {eleves.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5 + evaluationsFiltrees.length}
                                        className="p-8 text-center text-gray-500"
                                    >
                                        Aucun élève n’est inscrit dans cette
                                        classe.
                                    </td>
                                </tr>
                            ) : (
                                eleves.map((eleve, index) => (
                                    <tr
                                        key={eleve.id}
                                        className="border-t border-gray-100 text-sm text-gray-800"
                                    >
                                        <td className="p-4 text-center tabular-nums text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="p-4">
                                            {eleve.matricule || "—"}
                                        </td>
                                        <td className="p-4 font-medium">
                                            {eleve.nom}
                                        </td>
                                        <td className="p-4">{eleve.prenoms}</td>
                                        <td className="p-4">
                                            {String(eleve.sexe)
                                                .toLowerCase()
                                                .startsWith("m")
                                                ? "M"
                                                : String(eleve.sexe)
                                                        .toLowerCase()
                                                        .startsWith("f")
                                                  ? "F"
                                                  : "—"}
                                        </td>
                                        {evaluationsFiltrees.map(
                                            (evaluation) => {
                                                const note =
                                                    evaluation.notes.find(
                                                        (item) =>
                                                            Number(
                                                                item.eleve_id,
                                                            ) ===
                                                            Number(eleve.id),
                                                    );

                                                return (
                                                    <td
                                                        key={evaluation.id}
                                                        className="p-4 text-center tabular-nums"
                                                    >
                                                        {note
                                                            ? note.absent
                                                                ? "Absent"
                                                                : (note.note ??
                                                                  "—")
                                                            : "—"}
                                                    </td>
                                                );
                                            },
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </ResponsiveTable>
                </div>
            </div>
        </AdminLayout>
    );
}
