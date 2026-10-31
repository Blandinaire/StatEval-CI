import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

function getObservation(note) {
    if (note === "" || note === null || note === undefined) {
        return "";
    }

    const valeur = parseFloat(note);

    if (isNaN(valeur)) {
        return "";
    }

    if (valeur >= 18) {
        return "Excellente conduite";
    }

    if (valeur >= 16) {
        return "Très bonne conduite";
    }

    if (valeur >= 14) {
        return "Bonne conduite";
    }

    if (valeur >= 12) {
        return "Assez bonne conduite";
    }

    if (valeur >= 10) {
        return "Conduite passable";
    }

    return "Mauvaise conduite";
}

export default function Edit({
    conduite,
    eleves,
    educateurs,
    anneesScolaires,
    classes,
}) {
    const { data, setData, put, processing, errors } = useForm({
        note: conduite.note ?? "",
        observation: conduite.observation ?? "",
    });

    function submit(e) {
        e.preventDefault();

        put(route("conduites.update", conduite.id));
    }

    return (
        <AdminLayout>
            <Head title="Modifier une note de conduite" />

            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            Modifier une note de conduite
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Modifiez les informations de la note de conduite de
                            l'élève.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* ============================================= */}
                        {/* INFORMATIONS SCOLAIRES */}
                        {/* ============================================= */}

                        <div className="rounded-xl border bg-white shadow-sm">
                            <div className="border-b bg-slate-50 px-6 py-4">
                                <h2 className="text-xl font-bold">
                                    Informations scolaires
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Élève
                                    </label>
                                    <input
                                        type="text"
                                        value={`${conduite.eleve?.nom ?? ""} ${conduite.eleve?.prenoms ?? ""}`}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 p-3"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Éducateur responsable
                                    </label>
                                    <input
                                        type="text"
                                        value={`${conduite.educateur?.nom ?? ""} ${conduite.educateur?.prenoms ?? ""}`}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 p-3"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Année scolaire
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            conduite.annee_scolaire?.libelle ??
                                            ""
                                        }
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 p-3"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Classe
                                    </label>
                                    <input
                                        type="text"
                                        value={conduite.classe?.libelle ?? ""}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 p-3"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Période scolaire
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            conduite.periode_scolaire
                                                ?.libelle ??
                                            conduite.periode ??
                                            "Période non renseignée"
                                        }
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 p-3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ============================================= */}
                        {/* NOTE */}
                        {/* ============================================= */}

                        <div className="rounded-xl border bg-white shadow-sm">
                            <div className="border-b bg-slate-50 px-6 py-4">
                                <h2 className="text-xl font-bold">
                                    Note de conduite
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                                {/* NOTE */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Note /20
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        step="0.01"
                                        value={data.note}
                                        onChange={(e) => {
                                            const nouvelleNote = e.target.value;

                                            setData("note", nouvelleNote);
                                            setData(
                                                "observation",
                                                getObservation(nouvelleNote),
                                            );
                                        }}
                                        className="w-full rounded-lg border p-3 text-center text-lg font-semibold"
                                    />

                                    {errors.note && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.note}
                                        </p>
                                    )}
                                </div>

                                {/* OBSERVATION */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Observation
                                    </label>

                                    <input
                                        type="text"
                                        value={data.observation}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 p-3"
                                    />

                                    <p className="mt-1 text-xs text-gray-500">
                                        Observation générée automatiquement
                                        selon la note.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ============================================= */}
                        {/* ACTIONS */}
                        {/* ============================================= */}

                        <div className="flex justify-end gap-4">
                            <Link
                                href={route("conduites.index")}
                                className="rounded-lg border px-6 py-3"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing
                                    ? "Mise à jour..."
                                    : "Mettre à jour"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
