import AdminLayout from "@/Layouts/AdminLayout";
import { Link } from "@inertiajs/react";
import {
    PageHeader,
    FormCard,
    Badge,
    PrimaryButton,
} from "@/Components";
import {
    ArrowLeft,
    BookOpen,
    Plus,
} from "lucide-react";

export default function Show({ maquette }) {
    return (
        <AdminLayout>
            <div className="space-y-6">

                <div className="flex items-start justify-between gap-4">
                    <PageHeader
                        title={maquette.libelle}
                        subtitle="Détail de la maquette pédagogique"
                    />

                    <div className="flex items-center gap-3">

                        <Link
                            href={route("maquettes.index")}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft size={18} />
                            Retour
                        </Link>

                        <Link
                            href={route(
                                "maquettes.matieres.index",
                                maquette.id
                            )}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <BookOpen size={18} />
                            Gérer les matières
                        </Link>

                    </div>
                </div>

                <FormCard>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                        <div>
                            <p className="text-sm text-gray-500">
                                Établissement
                            </p>

                            <p className="font-semibold text-gray-900">
                                {maquette.etablissement?.nom ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Année scolaire
                            </p>

                            <p className="font-semibold text-gray-900">
                                {maquette.annee_scolaire?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Cycle
                            </p>

                            <p className="font-semibold text-gray-900">
                                {maquette.cycle?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Niveau
                            </p>

                            <p className="font-semibold text-gray-900">
                                {maquette.niveau?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Série
                            </p>

                            <p className="font-semibold text-gray-900">
                                {maquette.serie?.libelle ?? "Aucune"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Version
                            </p>

                            <div className="mt-1">
                                <Badge color="blue">
                                    V{maquette.version}
                                </Badge>
                            </div>
                        </div>

                    </div>
                </FormCard>

                <div className="rounded-xl bg-white p-6 shadow">

                    <div className="flex items-center justify-between gap-4">

                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Matières de la maquette
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Configurez les matières, coefficients et volumes horaires
                                de cette maquette pédagogique.
                            </p>
                        </div>

                        <Link
                            href={route(
                                "maquettes.matieres.create",
                                maquette.id
                            )}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            Ajouter une matière
                        </Link>

                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}