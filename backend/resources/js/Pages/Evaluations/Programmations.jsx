import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

const statutClasses = {
    programmee: "bg-amber-100 text-amber-700",
    active: "bg-emerald-100 text-emerald-700",
    cloturee: "bg-slate-200 text-slate-700",
    annulee: "bg-red-100 text-red-700",
};

export default function Programmations({ programmations = [] }) {
    const [statut, setStatut] = useState("");
    const [recherche, setRecherche] = useState("");

    const resultats = useMemo(
        () =>
            programmations.filter((item) => {
                const texte =
                    `${item.libelle} ${item.niveau ?? ""} ${item.matiere ?? ""}`.toLowerCase();
                return (
                    (!statut || item.statut === statut) &&
                    (!recherche || texte.includes(recherche.toLowerCase()))
                );
            }),
        [programmations, recherche, statut],
    );

    return (
        <AdminLayout>
            <Head title="Programmations des évaluations" />
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Programmations des évaluations
                        </h1>
                        <p className="text-gray-500">
                            Suivez les devoirs et examens programmés par
                            l'administration.
                        </p>
                    </div>
                    <Link
                        href={route("evaluations.programmer")}
                        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                        Nouvelle programmation
                    </Link>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row">
                    <input
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        placeholder="Rechercher..."
                        className="rounded-lg border p-3 md:flex-1"
                    />
                    <select
                        value={statut}
                        onChange={(e) => setStatut(e.target.value)}
                        className="rounded-lg border p-3"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="programmee">Programmée</option>
                        <option value="active">Active</option>
                        <option value="cloturee">Clôturée</option>
                        <option value="annulee">Annulée</option>
                    </select>
                </div>
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-slate-600">
                            <tr>
                                <th className="p-4">Évaluation</th>
                                <th className="p-4">Niveau</th>
                                <th className="p-4">Matière</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Classes</th>
                                <th className="p-4">Saisie</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultats.map((item) => {
                                const progression = item.eleves_count
                                    ? Math.round(
                                          (item.notes_count /
                                              item.eleves_count) *
                                              100,
                                      )
                                    : 0;
                                return (
                                    <tr
                                        key={item.id}
                                        className="border-t hover:bg-slate-50"
                                    >
                                        <td className="p-4 font-medium">
                                            {item.libelle}
                                            <div className="text-xs text-slate-500">
                                                {item.type}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {item.niveau ?? "-"}
                                        </td>
                                        <td className="p-4">
                                            {item.matiere ?? "-"}
                                        </td>
                                        <td className="p-4">
                                            {item.date_evaluation
                                                ? new Date(
                                                      item.date_evaluation,
                                                  ).toLocaleDateString("fr-FR")
                                                : "-"}
                                        </td>
                                        <td className="p-4">
                                            {item.classes_count}
                                        </td>
                                        <td className="p-4 min-w-32">
                                            <div className="h-2 rounded-full bg-slate-200">
                                                <div
                                                    className="h-2 rounded-full bg-blue-600"
                                                    style={{
                                                        width: `${progression}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {progression}%
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${statutClasses[item.statut] ?? "bg-slate-100 text-slate-600"}`}
                                            >
                                                {item.statut}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                href={route(
                                                    "evaluations.programmation",
                                                    item.id,
                                                )}
                                                className="rounded-lg bg-slate-700 px-3 py-2 text-white hover:bg-slate-800"
                                            >
                                                Voir
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {resultats.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="p-10 text-center text-slate-500"
                                    >
                                        Aucune programmation trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
