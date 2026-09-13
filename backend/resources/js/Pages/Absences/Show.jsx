import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Show({ absence }) {
    return (
        <AdminLayout>
            <Head title="Détails de l'absence" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Détails de l'absence
                        </h1>

                        <p className="text-gray-500">
                            Informations complètes concernant l'absence
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={route("absences.edit", absence.id)}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                        >
                            Modifier
                        </Link>

                        <a
                            href={route("absences.billet.pdf", absence.id)}
                            className="rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
                        >
                            Télécharger le billet PDF
                        </a>
                    </div>
                </div>

                {/* Élève */}

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">Élève</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">
                                Nom et prénoms
                            </p>

                            <p className="font-semibold">
                                {absence.eleve?.nom} {absence.eleve?.prenoms}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Classe</p>

                            <p className="font-semibold">
                                {absence.classe?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Année scolaire
                            </p>

                            <p className="font-semibold">
                                {absence.annee_scolaire?.libelle ??
                                    absence.anneeScolaire?.libelle ??
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Éducateur</p>

                            <p className="font-semibold">
                                {absence.educateur
                                    ? `${absence.educateur.nom} ${absence.educateur.prenoms}`
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Absence */}

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">
                            Informations sur l'absence
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">Date</p>

                            <p className="font-semibold">
                                {absence.date_absence
                                    ? new Date(
                                          absence.date_absence,
                                      ).toLocaleDateString("fr-FR")
                                    : "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Durée</p>

                            <p className="font-semibold">
                                {absence.duree_heures
                                    ? `${absence.duree_heures} heure(s)`
                                    : "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Heure de début
                            </p>

                            <p className="font-semibold">
                                {absence.heure_debut ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Heure de fin
                            </p>

                            <p className="font-semibold">
                                {absence.heure_fin ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Justification
                            </p>

                            <span
                                className={
                                    absence.justifiee
                                        ? "inline-block rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                                        : "inline-block rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700"
                                }
                            >
                                {absence.justifiee
                                    ? "Justifiée"
                                    : "Non justifiée"}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Motif</p>

                            <p className="font-semibold">
                                {absence.motif ?? "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Billet */}

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">Billet d'absence</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">
                                Numéro du billet
                            </p>

                            <p className="text-lg font-bold text-blue-700">
                                {absence.numero_billet ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Statut</p>

                            <span
                                className={
                                    absence.billet_edite
                                        ? "inline-block rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                                        : "inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700"
                                }
                            >
                                {absence.billet_edite ? "Édité" : "Non édité"}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Date d'édition
                            </p>

                            <p className="font-semibold">
                                {absence.billet_edite_le
                                    ? new Date(
                                          absence.billet_edite_le,
                                      ).toLocaleString("fr-FR")
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Observation */}

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">Observation</h2>
                    </div>

                    <div className="p-6">
                        <p className="whitespace-pre-wrap">
                            {absence.observation ?? "Aucune observation."}
                        </p>
                    </div>
                </div>

                <div>
                    <Link
                        href={route("absences.index")}
                        className="rounded-lg border px-5 py-3 hover:bg-gray-50"
                    >
                        ← Retour aux absences
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}
