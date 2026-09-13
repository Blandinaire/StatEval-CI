import { useForm } from "@inertiajs/react";
import { PrimaryButton } from "@/Components";

export default function Form({ serie = null, cycles = [] }) {
    const { data, setData, post, put, processing, errors } = useForm({
        cycle_id: serie?.cycle_id ?? "",
        code: serie?.code ?? "",
        libelle: serie?.libelle ?? "",
        ordre: serie?.ordre ?? "",
        actif: serie?.actif ?? true,
    });

    function submit(e) {
        e.preventDefault();

        if (serie) {
            put(route("series.update", serie.id));
            return;
        }

        post(route("series.store"));
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* CYCLE */}
            <div>
                <label
                    htmlFor="cycle_id"
                    className="block text-sm font-medium text-gray-700"
                >
                    Cycle
                </label>

                <select
                    id="cycle_id"
                    value={data.cycle_id}
                    onChange={(e) =>
                        setData("cycle_id", e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                    <option value="">
                        Sélectionnez un cycle
                    </option>

                    {cycles.map((cycle) => (
                        <option
                            key={cycle.id}
                            value={cycle.id}
                        >
                            {cycle.libelle}
                        </option>
                    ))}
                </select>

                {errors.cycle_id && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.cycle_id}
                    </p>
                )}
            </div>

            {/* CODE */}
            <div>
                <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700"
                >
                    Code de la série
                </label>

                <input
                    id="code"
                    type="text"
                    value={data.code}
                    onChange={(e) =>
                        setData(
                            "code",
                            e.target.value.toUpperCase()
                        )
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Exemple : A"
                    maxLength="20"
                />

                {errors.code && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.code}
                    </p>
                )}
            </div>

            {/* LIBELLÉ */}
            <div>
                <label
                    htmlFor="libelle"
                    className="block text-sm font-medium text-gray-700"
                >
                    Libellé de la série
                </label>

                <input
                    id="libelle"
                    type="text"
                    value={data.libelle}
                    onChange={(e) =>
                        setData("libelle", e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Exemple : Série A"
                />

                {errors.libelle && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.libelle}
                    </p>
                )}
            </div>

            {/* ORDRE */}
            <div>
                <label
                    htmlFor="ordre"
                    className="block text-sm font-medium text-gray-700"
                >
                    Ordre d'affichage
                </label>

                <input
                    id="ordre"
                    type="number"
                    min="1"
                    value={data.ordre}
                    onChange={(e) =>
                        setData("ordre", e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Exemple : 1"
                />

                {errors.ordre && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.ordre}
                    </p>
                )}
            </div>

            {/* STATUT */}
            <div>
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={data.actif}
                        onChange={(e) =>
                            setData("actif", e.target.checked)
                        }
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div>
                        <p className="font-medium text-gray-700">
                            Série active
                        </p>

                        <p className="text-sm text-gray-500">
                            Cette série pourra être utilisée dans les
                            maquettes pédagogiques.
                        </p>
                    </div>
                </label>

                {errors.actif && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.actif}
                    </p>
                )}
            </div>

            {/* BOUTON */}
            <div className="flex justify-end border-t pt-6">
                <PrimaryButton
                    type="submit"
                    disabled={processing}
                >
                    {processing
                        ? "Enregistrement..."
                        : serie
                            ? "Mettre à jour"
                            : "Créer la série"}
                </PrimaryButton>
            </div>
        </form>
    );
}