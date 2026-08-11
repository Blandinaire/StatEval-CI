import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({ eleve, etablissements, annees, classes }) {
    console.log("=== DONNÉES ÉLÈVE REÇUES PAR EDIT ===");
    console.log(eleve);

    console.log("=== ÉTABLISSEMENTS ===");
    console.log(etablissements);

    console.log("=== ANNÉES ===");
    console.log(annees);

    console.log("=== CLASSES ===");
    console.log(classes);

    const { data, setData, put, processing, errors } = useForm({
        etablissement_id: eleve.etablissement_id ?? "",
        annee_scolaire_id: eleve.annee_scolaire_id ?? "",
        classe_id: eleve.classe_id ?? "",

        matricule: eleve.matricule ?? "",

        nom: eleve.nom ?? "",
        prenoms: eleve.prenoms ?? "",
        sexe: eleve.sexe ?? "",
        date_naissance: eleve.date_naissance
            ? eleve.date_naissance.substring(0, 10)
            : "",
        lieu_naissance: eleve.lieu_naissance ?? "",
        nationalite: eleve.nationalite ?? "Ivoirienne",
        photo: eleve.photo ?? "",

        adresse: eleve.adresse ?? "",
        telephone: eleve.telephone ?? "",
        email: eleve.email ?? "",

        redoublant: Boolean(eleve.redoublant),
        boursier: Boolean(eleve.boursier),

        regime: eleve.regime ?? "Externe",
        statut: eleve.statut ?? "Actif",

        responsable_nom: eleve.responsable_nom ?? "",
        responsable_prenoms: eleve.responsable_prenoms ?? "",
        responsable_telephone: eleve.responsable_telephone ?? "",
        responsable_email: eleve.responsable_email ?? "",
        responsable_profession: eleve.responsable_profession ?? "",
        responsable_adresse: eleve.responsable_adresse ?? "",

        groupe_sanguin: eleve.groupe_sanguin ?? "",
        allergies: eleve.allergies ?? "",
        observations_medicales: eleve.observations_medicales ?? "",
        contact_urgence_nom: eleve.contact_urgence_nom ?? "",
        contact_urgence_telephone: eleve.contact_urgence_telephone ?? "",

        actif: Boolean(eleve.actif),
    });

    function submit(e) {
        e.preventDefault();

        put(route("eleves.update", eleve.id));
    }

    return (
        <AdminLayout>
            <Head title={`Modifier l'élève - ${eleve.nom} ${eleve.prenoms}`} />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Modifier l'élève</h1>

                        <p className="mt-2 text-gray-500">
                            Modification de la fiche de{" "}
                            <span className="font-semibold text-gray-700">
                                {eleve.nom} {eleve.prenoms}
                            </span>
                        </p>

                        {eleve.code_eleve && (
                            <p className="mt-1 text-sm text-gray-500">
                                Code interne :{" "}
                                <span className="font-semibold">
                                    {eleve.code_eleve}
                                </span>
                            </p>
                        )}
                    </div>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        annees={annees}
                        classes={classes}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Enregistrer les modifications"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
