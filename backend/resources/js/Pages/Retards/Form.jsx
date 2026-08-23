export default function Form({
    data,
    setData,
    eleves,
    educateurs,
    anneesScolaires,
    classes,
    errors,
    processing,
    submit,
    submitLabel,
}) {
    function calculerDuree() {
        if (!data.heure_prevue || !data.heure_arrivee) {
            return 0;
        }

        const [heurePrevue, minutePrevue] =
            data.heure_prevue.split(":").map(Number);

        const [heureArrivee, minuteArrivee] =
            data.heure_arrivee.split(":").map(Number);

        const minutesPrevues =
            heurePrevue * 60 + minutePrevue;

        const minutesArrivee =
            heureArrivee * 60 + minuteArrivee;

        return Math.max(
            0,
            minutesArrivee - minutesPrevues
        );
    }

    const dureeCalculee = calculerDuree();

    function handleHeurePrevue(value) {
        setData("heure_prevue", value);

        if (value && data.heure_arrivee) {
            const [h1, m1] = value.split(":").map(Number);
            const [h2, m2] =
                data.heure_arrivee.split(":").map(Number);

            const duree = Math.max(
                0,
                h2 * 60 + m2 - (h1 * 60 + m1)
            );

            setData("duree_minutes", duree);
        }
    }

    function handleHeureArrivee(value) {
        setData("heure_arrivee", value);

        if (value && data.heure_prevue) {
            const [h1, m1] =
                data.heure_prevue.split(":").map(Number);

            const [h2, m2] = value.split(":").map(Number);

            const duree = Math.max(
                0,
                h2 * 60 + m2 - (h1 * 60 + m1)
            );

            setData("duree_minutes", duree);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-6">

            <div className="grid gap-6 md:grid-cols-2">

                {/* Élève */}
                <div>
                    <label className="mb-2 block font-medium">
                        Élève *
                    </label>

                    <select
                        value={data.eleve_id}
                        onChange={(e) =>
                            setData("eleve_id", e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300"
                    >
                        <option value="">
                            Sélectionner un élève
                        </option>

                        {eleves.map((eleve) => (
                            <option
                                key={eleve.id}
                                value={eleve.id}
                            >
                                {eleve.nom} {eleve.prenoms}
                            </option>
                        ))}
                    </select>

                    {errors.eleve_id && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.eleve_id}
                        </p>
                    )}
                </div>

                {/* Éducateur */}
                <div>
                    <label className="mb-2 block font-medium">
                        Éducateur
                    </label>

                    <select
                        value={data.educateur_id}
                        onChange={(e) =>
                            setData(
                                "educateur_id",
                                e.target.value
                            )
                        }
                        className="w-full rounded-lg border-gray-300"
                    >
                        <option value="">
                            Sélectionner un éducateur
                        </option>

                        {educateurs.map((educateur) => (
                            <option
                                key={educateur.id}
                                value={educateur.id}
                            >
                                {educateur.nom}{" "}
                                {educateur.prenoms}
                            </option>
                        ))}
                    </select>

                    {errors.educateur_id && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.educateur_id}
                        </p>
                    )}
                </div>

                {/* Année scolaire */}
                <div>
                    <label className="mb-2 block font-medium">
                        Année scolaire *
                    </label>

                    <select
                        value={data.annee_scolaire_id}
                        onChange={(e) =>
                            setData(
                                "annee_scolaire_id",
                                e.target.value
                            )
                        }
                        className="w-full rounded-lg border-gray-300"
                    >
                        <option value="">
                            Sélectionner une année scolaire
                        </option>

                        {anneesScolaires.map((annee) => (
                            <option
                                key={annee.id}
                                value={annee.id}
                            >
                                {annee.libelle}
                            </option>
                        ))}
                    </select>

                    {errors.annee_scolaire_id && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.annee_scolaire_id}
                        </p>
                    )}
                </div>

                {/* Classe */}
                <div>
                    <label className="mb-2 block font-medium">
                        Classe
                    </label>

                    <select
                        value={data.classe_id}
                        onChange={(e) =>
                            setData(
                                "classe_id",
                                e.target.value
                            )
                        }
                        className="w-full rounded-lg border-gray-300"
                    >
                        <option value="">
                            Sélectionner une classe
                        </option>

                        {classes.map((classe) => (
                            <option
                                key={classe.id}
                                value={classe.id}
                            >
                                {classe.libelle}
                            </option>
                        ))}
                    </select>

                    {errors.classe_id && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.classe_id}
                        </p>
                    )}
                </div>

                {/* Date */}
                <div>
                    <label className="mb-2 block font-medium">
                        Date du retard *
                    </label>

                    <input
                        type="date"
                        value={data.date_retard}
                        onChange={(e) =>
                            setData(
                                "date_retard",
                                e.target.value
                            )
                        }
                        className="w-full rounded-lg border-gray-300"
                    />

                    {errors.date_retard && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.date_retard}
                        </p>
                    )}
                </div>

                {/* Heure prévue */}
                <div>
                    <label className="mb-2 block font-medium">
                        Heure prévue
                    </label>

                    <input
                        type="time"
                        value={data.heure_prevue}
                        onChange={(e) =>
                            handleHeurePrevue(e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300"
                    />

                    {errors.heure_prevue && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.heure_prevue}
                        </p>
                    )}
                </div>

                {/* Heure d'arrivée */}
                <div>
                    <label className="mb-2 block font-medium">
                        Heure d'arrivée
                    </label>

                    <input
                        type="time"
                        value={data.heure_arrivee}
                        onChange={(e) =>
                            handleHeureArrivee(e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300"
                    />

                    {errors.heure_arrivee && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.heure_arrivee}
                        </p>
                    )}
                </div>

                {/* Durée */}
                <div>
                    <label className="mb-2 block font-medium">
                        Durée du retard
                    </label>

                    <div className="rounded-lg border bg-gray-50 px-4 py-3">
                        <span className="font-bold text-orange-600">
                            {dureeCalculee} minute
                            {dureeCalculee > 1 ? "s" : ""}
                        </span>
                    </div>

                    <input
                        type="hidden"
                        value={data.duree_minutes}
                        readOnly
                    />
                </div>

                {/* Billet édité */}
                <div>
                    <label className="mb-2 block font-medium">
                        Billet de retard
                    </label>

                    <select
                        value={data.billet_edite}
                        onChange={(e) =>
                            setData(
                                "billet_edite",
                                e.target.value === "true"
                            )
                        }
                        className="w-full rounded-lg border-gray-300"
                    >
                        <option value={false}>
                            Non édité
                        </option>

                        <option value={true}>
                            Édité
                        </option>
                    </select>

                    {errors.billet_edite && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.billet_edite}
                        </p>
                    )}
                </div>

                {/* Numéro du billet */}
                <div>
                    <label className="mb-2 block font-medium">
                        Numéro du billet
                    </label>

                    <input
                        type="text"
                        value={data.numero_billet}
                        onChange={(e) =>
                            setData(
                                "numero_billet",
                                e.target.value
                            )
                        }
                        className="w-full rounded-lg border-gray-300"
                        placeholder="Ex. RET-2026-0001"
                    />

                    {errors.numero_billet && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.numero_billet}
                        </p>
                    )}
                </div>

            </div>

            {/* Motif */}
            <div>
                <label className="mb-2 block font-medium">
                    Motif
                </label>

                <textarea
                    value={data.motif}
                    onChange={(e) =>
                        setData("motif", e.target.value)
                    }
                    rows="3"
                    className="w-full rounded-lg border-gray-300"
                    placeholder="Indiquer éventuellement le motif du retard..."
                />

                {errors.motif && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.motif}
                    </p>
                )}
            </div>

            {/* Observation */}
            <div>
                <label className="mb-2 block font-medium">
                    Observation
                </label>

                <textarea
                    value={data.observation}
                    onChange={(e) =>
                        setData("observation", e.target.value)
                    }
                    rows="3"
                    className="w-full rounded-lg border-gray-300"
                    placeholder="Observation complémentaire..."
                />

                {errors.observation && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.observation}
                    </p>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing
                        ? "Enregistrement..."
                        : submitLabel}
                </button>
            </div>

        </form>
    );
}