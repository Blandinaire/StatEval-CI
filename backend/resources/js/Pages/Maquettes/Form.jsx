import {
    FormCard,
    PageHeader,
    TextField,
    SelectField,
    PrimaryButton,
} from "@/Components";

import { Link, useForm } from "@inertiajs/react";

export default function Form({
    annees = [],
    cycles = [],
    niveaux = [],
    series = [],
}) {
    const { data, setData, post, processing, errors } = useForm({
        annee_scolaire_id: "",
        cycle_id: "",
        niveau_id: "",
        serie_id: "",
        libelle: "",
        nom_version: "Standard",
        description: "",
        active: true,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("maquettes.store"));
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Nouvelle maquette"
                subtitle="Créer la première version d'une maquette pédagogique"
            />

            <FormCard>
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SelectField
                            label="Année scolaire"
                            value={data.annee_scolaire_id}
                            onChange={(e) =>
                                setData(
                                    "annee_scolaire_id",
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">Choisir...</option>

                            {annees.map((annee) => (
                                <option
                                    key={annee.id}
                                    value={annee.id}
                                >
                                    {annee.libelle}
                                </option>
                            ))}
                        </SelectField>

                        {errors.annee_scolaire_id && (
                            <p className="text-sm text-red-600 md:col-span-2">
                                {errors.annee_scolaire_id}
                            </p>
                        )}

                        <SelectField
                            label="Cycle"
                            value={data.cycle_id}
                            onChange={(e) =>
                                setData(
                                    "cycle_id",
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">Choisir...</option>

                            {cycles.map((cycle) => (
                                <option
                                    key={cycle.id}
                                    value={cycle.id}
                                >
                                    {cycle.libelle}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Niveau"
                            value={data.niveau_id}
                            onChange={(e) =>
                                setData(
                                    "niveau_id",
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">Choisir...</option>

                            {niveaux.map((niveau) => (
                                <option
                                    key={niveau.id}
                                    value={niveau.id}
                                >
                                    {niveau.libelle}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Série"
                            value={data.serie_id}
                            onChange={(e) =>
                                setData(
                                    "serie_id",
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">
                                Aucune
                            </option>

                            {series.map((serie) => (
                                <option
                                    key={serie.id}
                                    value={serie.id}
                                >
                                    {serie.libelle}
                                </option>
                            ))}
                        </SelectField>

                        <TextField
                            label="Libellé de la maquette"
                            placeholder="Ex : Quatrième"
                            value={data.libelle}
                            onChange={(e) =>
                                setData(
                                    "libelle",
                                    e.target.value,
                                )
                            }
                        />

                        <TextField
                            label="Nom de la version"
                            placeholder="Ex : Standard"
                            value={data.nom_version}
                            onChange={(e) =>
                                setData(
                                    "nom_version",
                                    e.target.value,
                                )
                            }
                        />

                        <div className="md:col-span-2">
                            <label
                                htmlFor="description"
                                className="mb-1 block text-sm font-semibold text-gray-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="description"
                                rows="4"
                                value={data.description}
                                onChange={(e) =>
                                    setData(
                                        "description",
                                        e.target.value,
                                    )
                                }
                                placeholder="Décrivez le contenu ou la particularité de cette version..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />

                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 md:col-span-2">
                            <input
                                id="active"
                                type="checkbox"
                                checked={Boolean(data.active)}
                                onChange={(e) =>
                                    setData(
                                        "active",
                                        e.target.checked,
                                    )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                            />

                            <label
                                htmlFor="active"
                                className="text-sm font-medium text-gray-700"
                            >
                                Version active et disponible pour les
                                établissements
                            </label>
                        </div>
                    </div>

                    {errors.niveau_id && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.niveau_id}
                        </p>
                    )}

                    {errors.nom_version && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.nom_version}
                        </p>
                    )}

                    {errors.libelle && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.libelle}
                        </p>
                    )}

                    <div className="mt-6 flex items-center gap-3">
                        <Link
                            href={route("maquettes.index")}
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </Link>

                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                        >
                            {processing
                                ? "Enregistrement..."
                                : "Créer la maquette"}
                        </PrimaryButton>
                    </div>
                </form>
            </FormCard>
        </div>
    );
}