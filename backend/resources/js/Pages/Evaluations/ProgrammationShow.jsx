import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function ProgrammationShow({ evaluation, classes = [] }) {
    return (
        <AdminLayout>
            <Head title={evaluation.libelle} />
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {evaluation.libelle}
                        </h1>
                        <p className="text-gray-500">
                            Détail de la programmation administrative
                        </p>
                    </div>
                    <Link
                        href={route("evaluations.programmations")}
                        className="rounded-lg border px-5 py-3 hover:bg-gray-50"
                    >
                        Retour
                    </Link>
                </div>
                <section className="grid grid-cols-2 gap-4 rounded-xl border bg-white p-6 shadow-sm md:grid-cols-4">
                    <div>
                        <p className="text-xs text-slate-500">Type</p>
                        <p className="font-semibold">{evaluation.type}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Niveau</p>
                        <p className="font-semibold">
                            {evaluation.niveau?.libelle ?? "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Matière</p>
                        <p className="font-semibold">
                            {evaluation.matiere?.libelle ?? "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Statut</p>
                        <p className="font-semibold uppercase text-blue-700">
                            {evaluation.statut}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="font-semibold">
                            {evaluation.date_evaluation
                                ? new Date(
                                      evaluation.date_evaluation,
                                  ).toLocaleDateString("fr-FR")
                                : "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Horaire</p>
                        <p className="font-semibold">
                            {evaluation.heure_debut && evaluation.heure_fin
                                ? `${evaluation.heure_debut} - ${evaluation.heure_fin}`
                                : "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Barème</p>
                        <p className="font-semibold">/{evaluation.bareme}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Coefficient</p>
                        <p className="font-semibold">
                            {evaluation.coefficient}
                        </p>
                    </div>
                </section>
                <section className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <h2 className="border-b p-5 text-lg font-semibold">
                        Classes concernées
                    </h2>
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                <th className="p-4">Classe</th>
                                <th className="p-4">Enseignant</th>
                                <th className="p-4">Élèves</th>
                                <th className="p-4">Saisie</th>
                                <th className="p-4">Progression</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((classe) => (
                                <tr key={classe.id} className="border-t">
                                    <td className="p-4 font-medium">
                                        {classe.libelle}
                                    </td>
                                    <td className="p-4">
                                        {classe.enseignant ? (
                                            `${classe.enseignant.nom ?? ""} ${classe.enseignant.prenoms ?? ""}`.trim()
                                        ) : (
                                            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                                À affecter
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {classe.eleves_count}
                                    </td>
                                    <td className="p-4">
                                        {classe.notes_count} /{" "}
                                        {classe.eleves_count}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-40 rounded-full bg-slate-200">
                                                <div
                                                    className="h-2 rounded-full bg-emerald-500"
                                                    style={{
                                                        width: `${classe.progression}%`,
                                                    }}
                                                />
                                            </div>
                                            <span>{classe.progression}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </AdminLayout>
    );
}
