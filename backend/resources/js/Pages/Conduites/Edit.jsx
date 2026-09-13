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
        eleve_id: conduite.eleve_id ?? "",
        educateur_id: conduite.educateur_id ?? "",
        annee_scolaire_id: conduite.annee_scolaire_id ?? "",
        classe_id: conduite.classe_id ?? "",
        periode: conduite.periode ?? "",
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
                                {/* ÉLÈVE */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Élève
                                    </label>

                                    <select
                                        value={data.eleve_id}
                                        onChange={(e) => {
                                            const nouvelleNote = e.target.value;

                                            setData("note", nouvelleNote);

                                            setData(
                                                "observation",
                                                getObservation(nouvelleNote),
                                            );
                                        }}
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner un élève...
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

                                {/* ÉDUCATEUR */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Éducateur responsable
                                    </label>

                                    <select
                                        value={data.educateur_id}
                                        onChange={(e) =>
                                            setData(
                                                "educateur_id",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
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

                                {/* ANNÉE SCOLAIRE */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Année scolaire
                                    </label>

                                    <select
                                        value={data.annee_scolaire_id}
                                        onChange={(e) =>
                                            setData(
                                                "annee_scolaire_id",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
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

                                {/* CLASSE */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Classe
                                    </label>

                                    <select
                                        value={data.classe_id}
                                        onChange={(e) =>
                                            setData("classe_id", e.target.value)
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
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

                                {/* PÉRIODE */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Période
                                    </label>

                                    <select
                                        value={data.periode}
                                        onChange={(e) =>
                                            setData("periode", e.target.value)
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        <option value="Trimestre 1">
                                            Trimestre 1
                                        </option>

                                        <option value="Trimestre 2">
                                            Trimestre 2
                                        </option>

                                        <option value="Trimestre 3">
                                            Trimestre 3
                                        </option>

                                        <option value="Semestre 1">
                                            Semestre 1
                                        </option>

                                        <option value="Semestre 2">
                                            Semestre 2
                                        </option>
                                    </select>

                                    {errors.periode && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.periode}
                                        </p>
                                    )}
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
                                        onChange={(e) =>
                                            setData("note", e.target.value)
                                        }
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
