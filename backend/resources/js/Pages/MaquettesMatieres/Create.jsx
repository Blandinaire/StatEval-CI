import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    maquette,
    matieres,
}) {

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({

        maquette_id: maquette.id,

        matiere_id: "",

        coefficient: "",

        volume_horaire: "",

        ordre: 1,

        obligatoire: true,

        prise_en_compte_moyenne: true,

        note_sur: 20,

        active: true,

    });

    function submit(e) {

        e.preventDefault();

        post(
            route(
                "maquettes.matieres.store",
                maquette.id
            )
        );

    }

    return (

        <AdminLayout>

            <Head title="Ajouter une matière" />

            <Form
                maquette={maquette}
                matieres={matieres}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                submit={submit}
                submitLabel="Créer"
            />

        </AdminLayout>

    );

}