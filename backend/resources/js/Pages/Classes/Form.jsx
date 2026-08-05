import { Link } from "@inertiajs/react";

export default function Form({
    data,
    setData,
    niveaux,
    annees,
    errors,
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {
    return (
        <form onSubmit={submit} className="space-y-6">

            {/* Libellé */}
            <div>
                <label className="block font-semibold mb-2">
                    Libellé
                </label>

                <input
                    type="text"
                    value={data.libelle}
                    onChange={(e) => setData("libelle", e.target.value)}
                    className="w-full border rounded-lg p-3"
                    placeholder="Ex : 6ème A"
                />

                {errors.libelle && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.libelle}
                    </p>
                )}
            </div>

            {/* Niveau */}
            <div>
                <label className="block font-semibold mb-2">
                    Niveau
                </label>

                <select
                    value={data.niveau_id}
                    onChange={(e) => setData("niveau_id", e.target.value)}
                    className="w-full border rounded-lg p-3"
                >
                    <option value="">
                        -- Sélectionner un niveau --
                    </option>

                    {niveaux.map((niveau) => (
                        <option
                            key={niveau.id}
                            value={niveau.id}
                        >
                            {niveau.libelle}
                        </option>
                    ))}
                </select>

                {errors.niveau_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.niveau_id}
                    </p>
                )}
            </div>

            {/* Année scolaire */}
            <div>
                <label className="block font-semibold mb-2">
                    Année scolaire
                </label>

                <select
                    value={data.annee_scolaire_id}
                    onChange={(e) =>
                        setData("annee_scolaire_id", e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                >
                    <option value="">
                        -- Sélectionner une année --
                    </option>

                    {annees.map((annee) => (
                        <option
                            key={annee.id}
                            value={annee.id}
                        >
                            {annee.libelle}
                        </option>
                    ))}
                </select>

                {errors.annee_scolaire_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.annee_scolaire_id}
                    </p>
                )}
            </div>

            {/* Capacité */}
            <div>
                <label className="block font-semibold mb-2">
                    Capacité
                </label>

                <input
                    type="number"
                    value={data.capacite}
                    onChange={(e) => setData("capacite", e.target.value)}
                    className="w-full border rounded-lg p-3"
                />

                {errors.capacite && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.capacite}
                    </p>
                )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4">

                <Link
                    href={route("classes.index")}
                    className="border rounded-lg px-6 py-3"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3"
                >
                    {submitLabel}
                </button>

            </div>

        </form>
    );
}