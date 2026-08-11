import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    etablissements,
    annees,
    cycles,
    niveaux,
    series,
    maquettes,
}) {
    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: "",
        annee_scolaire_id: "",
        cycle_id: "",
        niveau_id: "",
        serie_id: "",
        maquette_id: "",

        libelle: "",
        capacite: 60,
        active: true,
    });

    function submit(e) {
        e.preventDefault();

        post(route("classes.store"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle classe" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow p-8">
                    <h1 className="text-3xl font-bold mb-8">Nouvelle classe</h1>

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
                        submitLabel="Créer"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
