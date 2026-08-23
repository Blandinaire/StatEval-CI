import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    eleves,
    educateurs,
    anneesScolaires,
    classes,
    evaluations,
}) {
    const { data, setData, post, processing, errors } = useForm({
        eleve_id: "",
        educateur_id: "",
        annee_scolaire_id: "",
        classe_id: "",
        evaluation_id: "",
        note: "",
        observation: "",
    });

    function submit(e) {
        e.preventDefault();

        post(route("conduites.store"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle note de conduite" />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-2 text-3xl font-bold">
                        Nouvelle note de conduite
                    </h1>

                    <p className="mb-8 text-gray-500">
                        Enregistrer la note de conduite d'un élève pour une
                        évaluation.
                    </p>

                    <Form
                        data={data}
                        setData={setData}
                        eleves={eleves}
                        educateurs={educateurs}
                        anneesScolaires={anneesScolaires}
                        classes={classes}
                        evaluations={evaluations}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Enregistrer la note"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}