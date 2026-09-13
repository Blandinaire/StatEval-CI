import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Show({ retard }) {
    return (
        <AdminLayout>
            <Head title="Détails du retard" />

            <div className="mx-auto max-w-5xl space-y-6">

                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold">
                            Détails du retard
                        </h1>

                        <p className="text-gray-500">
                            Informations complètes concernant le retard
                        </p>
                    </div>

                    <div className="flex gap-3">

                        <Link
                            href={route("retards.edit", retard.id)}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                        >
                            Modifier
                        </Link>

                        <a
                            href={route(
                                "retards.billet.pdf",
                                retard.id
                            )}
                            className="rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
                        >
                            Télécharger le billet PDF
                        </a>

                    </div>
                </div>

                {/* Élève */}

                <div className="rounded-xl border bg-white shadow-sm">

                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">
                            Élève
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                        <div>
                            <p className="text-sm text-gray-500">
                                Nom et prénoms
                            </p>

                            <p className="font-semibold">
                                {retard.eleve?.nom}{" "}
                                {retard.eleve?.prenoms}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Classe
                            </p>

                            <p className="font-semibold">
                                {retard.classe?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Année scolaire
                            </p>

                            <p className="font-semibold">
                                {retard.annee_scolaire?.libelle ??
                                    retard.anneeScolaire?.libelle ??
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Éducateur
                            </p>

                            <p className="font-semibold">
                                {retard.educateur
                                    ? `${retard.educateur.nom} ${retard.educateur.prenoms}`
                                    : "-"}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Retard */}

                <div className="rounded-xl border bg-white shadow-sm">

                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">
                            Informations sur le retard
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                        <div>
                            <p className="text-sm text-gray-500">
                                Date
                            </p>

                            <p className="font-semibold">
                                {retard.date_retard
                                    ? new Date(
                                          retard.date_retard
                                      ).toLocaleDateString("fr-FR")
                                    : "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Durée
                            </p>

                            <p className="font-semibold">
                                {retard.duree_minutes ?? 0} minute(s)
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Heure prévue
                            </p>

                            <p className="font-semibold">
                                {retard.heure_prevue ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Heure d'arrivée
                            </p>

                            <p className="font-semibold">
                                {retard.heure_arrivee ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Motif
                            </p>

                            <p className="font-semibold">
                                {retard.motif ?? "-"}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Billet */}

                <div className="rounded-xl border bg-white shadow-sm">

                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">
                            Billet de retard
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                        <div>
                            <p className="text-sm text-gray-500">
                                Numéro du billet
                            </p>

                            <p className="text-lg font-bold text-blue-700">
                                {retard.numero_billet ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Statut
                            </p>

                            <span
                                className={
                                    retard.billet_edite
                                        ? "inline-block rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                                        : "inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700"
                                }
                            >
                                {retard.billet_edite
                                    ? "Édité"
                                    : "Non édité"}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Date d'édition
                            </p>

                            <p className="font-semibold">
                                {retard.billet_edite_le
                                    ? new Date(
                                          retard.billet_edite_le
                                      ).toLocaleString("fr-FR")
                                    : "-"}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Observation */}

                <div className="rounded-xl border bg-white shadow-sm">

                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">
                            Observation
                        </h2>
                    </div>

                    <div className="p-6">

                        <p className="whitespace-pre-wrap">
                            {retard.observation ??
                                "Aucune observation."}
                        </p>

                    </div>

                </div>

                <div>

                    <Link
                        href={route("retards.index")}
                        className="rounded-lg border px-5 py-3 hover:bg-gray-50"
                    >
                        ← Retour aux retards
                    </Link>

                </div>

            </div>
        </AdminLayout>
    );
}