import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({ etablissements, annees, classes }) {
    const { data, setData, post, processing, errors } = useForm({
        /*
        |--------------------------------------------------------------------------
        | Scolarité
        |--------------------------------------------------------------------------
        */

        etablissement_id: "",
        annee_scolaire_id: "",
        classe_id: "",

        /*
        |--------------------------------------------------------------------------
        | Identification
        |--------------------------------------------------------------------------
        */

        matricule: "",
        nom: "",
        prenoms: "",
        sexe: "",
        date_naissance: "",
        lieu_naissance: "",
        nationalite: "Ivoirienne",
        photo: "",

        /*
        |--------------------------------------------------------------------------
        | Coordonnées
        |--------------------------------------------------------------------------
        */

        adresse: "",
        telephone: "",
        email: "",

        /*
        |--------------------------------------------------------------------------
        | Situation scolaire
        |--------------------------------------------------------------------------
        */

        redoublant: false,
        boursier: false,
        regime: "Externe",
        statut: "Actif",

        statut_affectation: "Non affecté",

        /*
        |--------------------------------------------------------------------------
        | Père
        |--------------------------------------------------------------------------
        */

        pere_nom: "",
        pere_prenoms: "",
        pere_telephone: "",
        pere_email: "",
        pere_profession: "",
        pere_adresse: "",

        /*
        |--------------------------------------------------------------------------
        | Mère
        |--------------------------------------------------------------------------
        */

        mere_nom: "",
        mere_prenoms: "",
        mere_telephone: "",
        mere_email: "",
        mere_profession: "",
        mere_adresse: "",

        /*
        |--------------------------------------------------------------------------
        | Tuteur légal
        |--------------------------------------------------------------------------
        */

        type_tuteur: "Père",

        responsable_nom: "",
        responsable_prenoms: "",
        responsable_telephone: "",
        responsable_email: "",
        responsable_profession: "",
        responsable_adresse: "",

        /*
        |--------------------------------------------------------------------------
        | Informations médicales
        |--------------------------------------------------------------------------
        */

        groupe_sanguin: "",
        allergies: "",
        observations_medicales: "",
        contact_urgence_nom: "",
        contact_urgence_telephone: "",

        /*
        |--------------------------------------------------------------------------
        | Statut système
        |--------------------------------------------------------------------------
        */

        actif: true,
    });

    function submit(e) {
        e.preventDefault();

        console.log("Données envoyées :", data);

        post(route("eleves.store"), {
            onSuccess: () => {
                console.log("Élève enregistré avec succès.");
            },

            onError: (errors) => {
                console.error("Erreurs de validation :", errors);
            },
        });
    }

    return (
        <AdminLayout>
            <Head title="Nouvel élève" />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-8 text-3xl font-bold">Nouvel élève</h1>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        annees={annees}
                        classes={classes}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Créer l'élève"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
