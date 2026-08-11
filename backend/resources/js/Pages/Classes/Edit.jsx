import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    classe,
    etablissements,
    annees,
    cycles,
    niveaux,
    series,
    maquettes,
}) {
    const { data, setData, put, processing, errors } = useForm({

        etablissement_id: classe.etablissement_id,
        annee_scolaire_id: classe.annee_scolaire_id,
        cycle_id: classe.cycle_id,
        niveau_id: classe.niveau_id,
        serie_id: classe.serie_id ?? "",
        maquette_id: classe.maquette_id,

        libelle: classe.libelle,
        capacite: classe.capacite,
        active: classe.active,
    });

    function submit(e) {
        e.preventDefault();

        put(route("classes.update", classe.id));
    }

    return (
        <AdminLayout>

            <Head title="Modifier une classe" />

            <div className="mx-auto max-w-4xl">

                <div className="rounded-xl bg-white p-8 shadow">

                    <h1 className="mb-8 text-3xl font-bold">
                        Modifier la classe
                    </h1>

                    <Form
                        data={data}
                        setData={setData}

                        etablissements={etablissements}
                        annees={annees}
                        cycles={cycles}
                        niveaux={niveaux}
                        series={series}
                        maquettes={maquettes}

                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Mettre à jour"
                    />

                </div>

            </div>

        </AdminLayout>
    );
}