import {
    FormCard,
    PageHeader,
    TextField,
    SelectField,
    PrimaryButton,
} from "@/Components";

export default function Form({
    maquette,
    matieres,
    data,
    setData,
    errors,
    processing,
    submit,
    submitLabel,
}) {
    return (
        <div className="space-y-6">

            <PageHeader
                title={
                    submitLabel === "Créer"
                        ? "Ajouter une matière"
                        : "Modifier une matière"
                }
                subtitle={maquette.libelle}
            />

            <FormCard>

                <form onSubmit={submit} className="space-y-5">

                    <SelectField
                        label="Matière"
                        value={data.matiere_id}
                        error={errors.matiere_id}
                        onChange={(e) =>
                            setData("matiere_id", e.target.value)
                        }
                    >
                        <option value="">
                            Choisir une matière
                        </option>

                        {matieres.map((matiere) => (
                            <option
                                key={matiere.id}
                                value={matiere.id}
                            >
                                {matiere.libelle}
                            </option>
                        ))}
                    </SelectField>

                    <div className="grid grid-cols-2 gap-4">

                        <TextField
                            label="Coefficient"
                            type="number"
                            step="0.5"
                            value={data.coefficient}
                            error={errors.coefficient}
                            onChange={(e) =>
                                setData(
                                    "coefficient",
                                    e.target.value
                                )
                            }
                        />

                        <TextField
                            label="Volume horaire"
                            type="number"
                            step="0.5"
                            value={data.volume_horaire}
                            error={errors.volume_horaire}
                            onChange={(e) =>
                                setData(
                                    "volume_horaire",
                                    e.target.value
                                )
                            }
                        />

                        
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        <label className="flex items-center gap-2">

                            <input
                                type="checkbox"
                                checked={data.obligatoire}
                                onChange={(e) =>
                                    setData(
                                        "obligatoire",
                                        e.target.checked
                                    )
                                }
                            />

                            Obligatoire

                        </label>

                        <label className="flex items-center gap-2">

                            <input
                                type="checkbox"
                                checked={data.prise_en_compte_moyenne}
                                onChange={(e) =>
                                    setData(
                                        "prise_en_compte_moyenne",
                                        e.target.checked
                                    )
                                }
                            />

                            Compter dans la moyenne

                        </label>

                    </div>

                    <TextField
                        label="Note sur"
                        type="number"
                        value={data.note_sur}
                        error={errors.note_sur}
                        onChange={(e) =>
                            setData(
                                "note_sur",
                                e.target.value
                            )
                        }
                    />

                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                    >
                        {processing
                            ? "Enregistrement..."
                            : submitLabel}
                    </PrimaryButton>

                </form>

            </FormCard>

        </div>
    );
}