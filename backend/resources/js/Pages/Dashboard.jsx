import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";

import {
    School,
    GraduationCap,
    Users,
    UserRoundCheck,
    BookOpen,
    ClipboardCheck,
    UserX,
    Clock3,
    CalendarX,
    Timer,
} from "lucide-react";

function StatCard({ title, value, icon: Icon, description }) {
    return (
    <div className="w-full min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">{title}</p>

                    <p className="mt-2 text-3xl font-bold text-gray-800">
                        {value ?? 0}
                    </p>

                    {description && (
                        <p className="mt-2 text-xs text-gray-400">
                            {description}
                        </p>
                    )}
                </div>

                <div className="rounded-lg bg-blue-50 p-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ stats, activitesRecentes = [] }) {
    return (
        <AdminLayout>
            <Head title="Tableau de bord" />

            <div className="w-full min-w-0 space-y-8">
                {/* En-tête */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tableau de bord
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Vue d'ensemble de la gestion scolaire
                    </p>
                </div>

                {/* Statistiques générales */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-700">
                        Données générales
                    </h2>

                    <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <StatCard
                            title="Établissements"
                            value={stats?.etablissements}
                            icon={School}
                            description="Établissements enregistrés"
                        />

                        <StatCard
                            title="Élèves"
                            value={stats?.eleves}
                            icon={GraduationCap}
                            description="Effectif total"
                        />

                        <StatCard
                            title="Enseignants"
                            value={stats?.enseignants}
                            icon={Users}
                            description="Personnel enseignant"
                        />

                        <StatCard
                            title="Éducateurs"
                            value={stats?.educateurs}
                            icon={UserRoundCheck}
                            description="Personnel d'encadrement"
                        />

                        <StatCard
                            title="Classes"
                            value={stats?.classes}
                            icon={BookOpen}
                            description="Classes créées"
                        />
                    </div>
                </section>

                {/* Vie scolaire */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-700">
                        Vie scolaire
                    </h2>

                    <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
                        <StatCard
                            title="Notes de conduite"
                            value={stats?.conduites}
                            icon={ClipboardCheck}
                            description="Notes enregistrées"
                        />

                        <StatCard
                            title="Absences"
                            value={stats?.absences}
                            icon={UserX}
                            description="Absences enregistrées"
                        />

                        <StatCard
                            title="Retards"
                            value={stats?.retards}
                            icon={Clock3}
                            description="Retards enregistrés"
                        />
                    </div>
                </section>

                {/* Activité du jour */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-700">
                        Activité du jour
                    </h2>

                    <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                        <StatCard
                            title="Absences aujourd'hui"
                            value={stats?.absences_aujourdhui}
                            icon={CalendarX}
                            description="Enregistrées aujourd'hui"
                        />

                        <StatCard
                            title="Retards aujourd'hui"
                            value={stats?.retards_aujourdhui}
                            icon={Timer}
                            description="Enregistrés aujourd'hui"
                        />
                    </div>
                </section>
                {/* Activités récentes */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">
                                Activités récentes
                            </h2>

                            <p className="text-sm text-gray-500">
                                Derniers événements enregistrés dans la vie
                                scolaire
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {activitesRecentes.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-gray-500">
                                    Aucune activité récente enregistrée.
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                    Les absences, retards et notes de conduite
                                    apparaîtront ici.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {activitesRecentes.map((activite) => (
                                    <div
                                        key={`${activite.type}-${activite.id}`}
                                        className="flex flex-col gap-3 p-5 transition hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        activite.type ===
                                                        "conduite"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : activite.type ===
                                                                "absence"
                                                              ? "bg-red-100 text-red-700"
                                                              : "bg-orange-100 text-orange-700"
                                                    }`}
                                                >
                                                    {activite.titre}
                                                </span>
                                            </div>

                                            <p className="mt-3 font-semibold text-gray-800">
                                                {activite.eleve}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Classe : {activite.classe}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-start gap-1 md:items-end">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {activite.valeur}
                                            </span>

                                            <span className="text-xs text-gray-400">
                                                {activite.date
                                                    ? new Date(
                                                          activite.date,
                                                      ).toLocaleDateString(
                                                          "fr-FR",
                                                      )
                                                    : "-"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
