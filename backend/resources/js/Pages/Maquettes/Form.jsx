import {
    FormCard,
    PageHeader,
    TextField,
    SelectField,
    PrimaryButton,
} from "@/Components";

import { Link, useForm } from "@inertiajs/react";

export default function Form({
    etablissements,
    annees,
    cycles,
    niveaux,
    series,
}) {
    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: "",
        annee_scolaire_id: "",
        cycle_id: "",
        niveau_id: "",
        serie_id: "",
        libelle: "",
    });
    const submit = (e) => {
        e.preventDefault();

        console.log("SUBMIT OK");
        console.log("Route :", route("maquettes.store"));
        console.log("Données :", data);

        post(route("maquettes.store"));
    };
    return (
        <div className="space-y-6">
            <PageHeader
                title="Nouvelle maquette"
                subtitle="Créer une maquette pédagogique"
            />

            <FormCard>
                <form onSubmit={submit}>
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField
                            label="Établissement"
                            value={data.etablissement_id}
                            onChange={(e) =>
                                setData("etablissement_id", e.target.value)
                            }
                        >
                            <option value="">Choisir...</option>
                            {etablissements?.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.nom}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Année scolaire"
                            value={data.annee_scolaire_id}
                            onChange={(e) =>
                                setData("annee_scolaire_id", e.target.value)
                            }
                        >
                            <option value="">Choisir...</option>
                            {annees?.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.libelle}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Cycle"
                            value={data.cycle_id}
                            onChange={(e) =>
                                setData("cycle_id", e.target.value)
                            }
                        >
                            <option value="">Choisir...</option>
                            {cycles?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.libelle}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Niveau"
                            value={data.niveau_id}
                            onChange={(e) =>
                                setData("niveau_id", e.target.value)
                            }
                        >
                            <option value="">Choisir...</option>
                            {niveaux?.map((n) => (
                                <option key={n.id} value={n.id}>
                                    {n.libelle}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Série"
                            value={data.serie_id}
                            onChange={(e) =>
                                setData("serie_id", e.target.value)
                            }
                        >
                            <option value="">Choisir...</option>
                            {series?.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.libelle}
                                </option>
                            ))}
                        </SelectField>

                        <TextField
                            label="Libellé"
                            placeholder="Ex : Sixième"
                            value={data.libelle}
                            onChange={(e) => setData("libelle", e.target.value)}
                        />
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <Link
                            href={route("maquettes.index")}
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </Link>

                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? "Enregistrement..." : "Enregistrer"}
                        </PrimaryButton>
                    </div>
                </form>
            </FormCard>
        </div>
    );
}
