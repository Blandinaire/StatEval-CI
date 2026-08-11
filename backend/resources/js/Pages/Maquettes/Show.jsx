import AdminLayout from "@/Layouts/AdminLayout";
import {
    PageHeader,
    FormCard,
    Badge,
} from "@/Components";

export default function Show({ maquette }) {
    return (
        <AdminLayout>

            <div className="space-y-6">

                <PageHeader
                    title={maquette.libelle}
                    subtitle="Détail de la maquette pédagogique"
                />

                <FormCard>

                    <div className="grid grid-cols-2 gap-6">

                        <div>
                            <p className="text-sm text-gray-500">Établissement</p>
                            <p className="font-semibold">
                                {maquette.etablissement?.libelle}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Année scolaire</p>
                            <p className="font-semibold">
                                {maquette.annee_scolaire?.libelle}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Cycle</p>
                            <p className="font-semibold">
                                {maquette.cycle?.libelle}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Niveau</p>
                            <p className="font-semibold">
                                {maquette.niveau?.libelle}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Série</p>
                            <p className="font-semibold">
                                {maquette.serie?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Version</p>

                            <Badge color="blue">
                                V{maquette.version}
                            </Badge>

                        </div>

                    </div>

                </FormCard>

            </div>

        </AdminLayout>
    );
}