import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    maquette,
    ligne,
    matieres,
}) {

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({

        maquette_id: maquette.id,

        matiere_id: ligne.matiere_id,

        coefficient: ligne.coefficient,

        volume_horaire: ligne.volume_horaire,

        obligatoire: ligne.obligatoire,

        prise_en_compte_moyenne:
            ligne.prise_en_compte_moyenne,

        note_sur: ligne.note_sur,

        active: ligne.active,

    });

    function submit(e) {

        e.preventDefault();

        put(
            route(
                "maquettes.matieres.update",
                [
                    maquette.id,
                    ligne.id,
                ]
            )
        );

    }

    return (

        <AdminLayout>

            <Head title="Modifier une matière" />

            <Form
                maquette={maquette}
                matieres={matieres}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                submit={submit}
                submitLabel="Mettre à jour"
            />

        </AdminLayout>

    );

}