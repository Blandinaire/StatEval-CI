import AdminLayout from "@/Layouts/AdminLayout";
import Card from "@/Components/Card";
import { Head } from "@inertiajs/react";

export default function Dashboard({ stats }) {
    return (
        <AdminLayout>
            <Head title="Tableau de bord" />

            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Bienvenue sur StatEval-CI
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Système de gestion des statistiques scolaires
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <Card title="Établissements" value={stats.etablissements} />
                    <Card title="Élèves" value={stats.eleves} />
                    <Card title="Enseignants" value={stats.enseignants} />
                    <Card title="Classes" value={stats.classes} />
                </div>

                <div className="bg-white rounded-xl shadow p-8">
                    <h2 className="text-xl font-bold mb-4">
                        Bienvenue
                    </h2>

                    <p>
                        Cette application permettra de gérer les établissements,
                        les années scolaires, les classes, les élèves, les enseignants,
                        les notes, les bulletins et les statistiques scolaires.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}