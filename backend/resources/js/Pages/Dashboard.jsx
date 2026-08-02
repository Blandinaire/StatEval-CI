import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-blue-700">
                    Tableau de bord
                </h2>
            }
        >
            <Head title="Tableau de bord" />

            <div className="py-8 bg-gray-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Bienvenue sur StatEval-CI
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Système de gestion des statistiques scolaires
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-gray-500 text-sm uppercase">
                                Élèves
                            </h3>

                            <p className="text-4xl font-bold text-blue-700 mt-3">
                                0
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-gray-500 text-sm uppercase">
                                Enseignants
                            </h3>

                            <p className="text-4xl font-bold text-green-600 mt-3">
                                0
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-gray-500 text-sm uppercase">
                                Classes
                            </h3>

                            <p className="text-4xl font-bold text-orange-500 mt-3">
                                0
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-gray-500 text-sm uppercase">
                                Évaluations
                            </h3>

                            <p className="text-4xl font-bold text-red-600 mt-3">
                                0
                            </p>
                        </div>

                    </div>

                    <div className="mt-10 bg-white rounded-xl shadow p-8">

                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Bienvenue
                        </h2>

                        <p className="text-gray-600 leading-8">
                            Bienvenue dans <strong>StatEval-CI</strong>, votre
                            plateforme de gestion des statistiques scolaires.
                        </p>

                        <p className="mt-4 text-gray-600">
                            Les prochains modules permettront de gérer :
                        </p>

                        <ul className="list-disc ml-8 mt-4 space-y-2 text-gray-700">
                            <li>les utilisateurs</li>
                            <li>les établissements</li>
                            <li>les années scolaires</li>
                            <li>les classes</li>
                            <li>les matières</li>
                            <li>les enseignants</li>
                            <li>les élèves</li>
                            <li>les notes</li>
                            <li>les statistiques DECO</li>
                        </ul>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}