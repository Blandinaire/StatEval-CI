import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";
import Form from "./Form";

export default function Create({
    etablissements,
    anneesScolaires,
    educateurs,
    isSuperAdmin,
    etablissementId,
}) {
    const [classes, setClasses] = useState([]);
    const [eleves, setEleves] = useState([]);
    const [chargementClasses, setChargementClasses] = useState(false);
    const [chargementEleves, setChargementEleves] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: isSuperAdmin ? "" : (etablissementId ?? ""),
        annee_scolaire_id: "",
        classe_id: "",
        educateur_id: "",
        periode: "",
        notes: [],
    });

    /**
     * Charge les classes selon :
     * établissement + année scolaire.
     */
    async function chargerClasses(etablissementIdSelectionne, anneeScolaireId) {
        if (!anneeScolaireId) {
            setClasses([]);
            setEleves([]);
            setData("classe_id", "");
            setData("notes", []);
            return;
        }

        if (isSuperAdmin && !etablissementIdSelectionne) {
            setClasses([]);
            setEleves([]);
            setData("classe_id", "");
            setData("notes", []);
            return;
        }

        try {
            setChargementClasses(true);

            const response = await axios.get(route("api.conduites.classes"), {
                params: {
                    etablissement_id: etablissementIdSelectionne,
                    annee_scolaire_id: anneeScolaireId,
                },
            });

            setClasses(response.data);

            setData("classe_id", "");
            setEleves([]);
            setData("notes", []);
        } catch (error) {
            console.error("Erreur lors du chargement des classes :", error);

            setClasses([]);
        } finally {
            setChargementClasses(false);
        }
    }

    /**
     * Changement établissement.
     */
    function changerEtablissement(value) {
        setData("etablissement_id", value);

        setData("classe_id", "");
        setData("notes", []);

        setClasses([]);
        setEleves([]);

        if (data.annee_scolaire_id) {
            chargerClasses(value, data.annee_scolaire_id);
        }
    }

    /**
     * Changement année scolaire.
     */
    function changerAnneeScolaire(value) {
        setData("annee_scolaire_id", value);

        setData("classe_id", "");
        setData("notes", []);

        setClasses([]);
        setEleves([]);

        const etablissementActuel = isSuperAdmin
            ? data.etablissement_id
            : etablissementId;

        if (etablissementActuel) {
            chargerClasses(etablissementActuel, value);
        }
    }

    /**
     * Charge les élèves de la classe sélectionnée.
     */
    async function changerClasse(classeId) {
        setData("classe_id", classeId);

        setEleves([]);
        setData("notes", []);

        if (!classeId) {
            return;
        }

        try {
            setChargementEleves(true);

            const response = await axios.get(
                route("api.conduites.eleves", classeId),
            );

            const listeEleves = response.data;

            setEleves(listeEleves);

            const notesInitiales = listeEleves.map((eleve) => ({
                eleve_id: eleve.id,
                note: "",
                observation: "",
            }));

            setData("notes", notesInitiales);
        } catch (error) {
            console.error("Erreur lors du chargement des élèves :", error);

            setEleves([]);
        } finally {
            setChargementEleves(false);
        }
    }

    /**
     * Modification d'une note.
     */
    function modifierNote(index, champ, valeur) {
        const nouvellesNotes = [...data.notes];

        let observation = nouvellesNotes[index]?.observation ?? "";

        /*
    |--------------------------------------------------------------
    | Génération automatique de l'observation selon la note
    |--------------------------------------------------------------
    */

        if (champ === "note") {
            const note = parseFloat(valeur);

            if (valeur === "" || isNaN(note)) {
                observation = "";
            } else if (note >= 18) {
                observation = "Excellente conduite";
            } else if (note >= 16) {
                observation = "Très bonne conduite";
            } else if (note >= 14) {
                observation = "Bonne conduite";
            } else if (note >= 12) {
                observation = "Assez bonne conduite";
            } else if (note >= 10) {
                observation = "Conduite passable";
            } else if (note >= 5) {
                observation = "Mauvaise conduite";
            } else {
                observation = "Très mauvaise conduite";
            }
        }

        nouvellesNotes[index] = {
            ...nouvellesNotes[index],
            [champ]: valeur,
            observation,
        };

        setData("notes", nouvellesNotes);
    }

    /**
     * Enregistrement.
     */
    function submit(e) {
        e.preventDefault();

        post(route("conduites.store.groupe"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle note de conduite" />

            <div className="mx-auto max-w-7xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-2 text-3xl font-bold">
                        Nouvelle note de conduite
                    </h1>

                    <p className="mb-8 text-gray-500">
                        Sélectionnez l'établissement, l'année scolaire, la
                        classe et la période, puis attribuez une note de
                        conduite à chaque élève.
                    </p>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        anneesScolaires={anneesScolaires}
                        classes={classes}
                        eleves={eleves}
                        educateurs={educateurs}
                        isSuperAdmin={isSuperAdmin}
                        chargementClasses={chargementClasses}
                        chargementEleves={chargementEleves}
                        changerEtablissement={changerEtablissement}
                        changerAnneeScolaire={changerAnneeScolaire}
                        changerClasse={changerClasse}
                        modifierNote={modifierNote}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
