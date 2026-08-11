import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ evaluation, eleves, notes }) {
    const notesExistantes = notes || {};

    /*
    |--------------------------------------------------------------------------
    | Calcul de l'appréciation
    |--------------------------------------------------------------------------
    |
    | Toutes les notes sont converties sur 20 avant de déterminer
    | l'appréciation.
    |
    */

    function calculerAppreciation(note, absent = false) {
        if (absent) {
            return "Absent";
        }

        if (note === "" || note === null || note === undefined) {
            return "";
        }

        const valeur = Number(note);
        const bareme = Number(evaluation.bareme);

        if (
            Number.isNaN(valeur) ||
            Number.isNaN(bareme) ||
            bareme <= 0
        ) {
            return "";
        }

        const noteSur20 = (valeur / bareme) * 20;

        if (noteSur20 >= 18) {
            return "Excellent";
        }

        if (noteSur20 >= 16) {
            return "Très bien";
        }

        if (noteSur20 >= 14) {
            return "Bien";
        }

        if (noteSur20 >= 12) {
            return "Assez bien";
        }

        if (noteSur20 >= 11) {
            return "Moyen";
        }

        if (noteSur20 >= 10) {
            return "Passable";
        }

        if (noteSur20 >= 8) {
            return "Insuffisant";
        }

        if (noteSur20 >= 5) {
            return "Très insuffisant";
        }

        return "Faible";
    }

    /*
    |--------------------------------------------------------------------------
    | Conversion de la note sur 20
    |--------------------------------------------------------------------------
    */

    function calculerNoteSur20(note) {
        if (note === "" || note === null || note === undefined) {
            return "";
        }

        const valeur = Number(note);
        const bareme = Number(evaluation.bareme);

        if (
            Number.isNaN(valeur) ||
            Number.isNaN(bareme) ||
            bareme <= 0
        ) {
            return "";
        }

        return ((valeur / bareme) * 20).toFixed(2);
    }

    /*
    |--------------------------------------------------------------------------
    | Préparation des notes existantes
    |--------------------------------------------------------------------------
    */

    const initialNotes = eleves.map((eleve) => {
        const noteExistante = notesExistantes[eleve.id] || null;

        const note =
            noteExistante?.note !== null &&
            noteExistante?.note !== undefined
                ? String(noteExistante.note)
                : "";

        const absent = Boolean(noteExistante?.absent ?? false);

        return {
            id: noteExistante?.id ?? null,
            eleve_id: eleve.id,
            note,
            absent,

            // Toujours recalculée automatiquement
            appreciation: calculerAppreciation(note, absent),

            observation: noteExistante?.observation ?? "",
        };
    });

    const { data, setData, post, processing, errors } = useForm({
        notes: initialNotes,
    });

    /*
    |--------------------------------------------------------------------------
    | Modification d'une ligne
    |--------------------------------------------------------------------------
    */

    function updateNote(index, field, value) {
        const nouvellesNotes = [...data.notes];

        nouvellesNotes[index] = {
            ...nouvellesNotes[index],
            [field]: value,
        };

        /*
        |--------------------------------------------------------------------------
        | Élève absent
        |--------------------------------------------------------------------------
        */

        if (field === "absent") {
            if (value === true) {
                nouvellesNotes[index].note = "";
                nouvellesNotes[index].appreciation = "Absent";
            } else {
                nouvellesNotes[index].appreciation =
                    calculerAppreciation(
                        nouvellesNotes[index].note,
                        false
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Modification de la note
        |--------------------------------------------------------------------------
        */

        if (field === "note") {
            nouvellesNotes[index].appreciation =
                calculerAppreciation(
                    value,
                    nouvellesNotes[index].absent
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Modification de l'observation
        |--------------------------------------------------------------------------
        */

        if (field === "observation") {
            nouvellesNotes[index].observation = value;
        }

        setData("notes", nouvellesNotes);
    }

    /*
    |--------------------------------------------------------------------------
    | Enregistrement
    |--------------------------------------------------------------------------
    */

    function submit(e) {
        e.preventDefault();

        post(route("notes.store", evaluation.id));
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification de la note
    |--------------------------------------------------------------------------
    */

    const noteMax = Number(evaluation.bareme);

    function noteInvalide(note) {
        if (note === "" || note === null || note === undefined) {
            return false;
        }

        const valeur = Number(note);

        return Number.isNaN(valeur) || valeur < 0 || valeur > noteMax;
    }

    /*
    |--------------------------------------------------------------------------
    | Couleur de l'appréciation
    |--------------------------------------------------------------------------
    */

    function classeAppreciation(appreciation) {
        switch (appreciation) {
            case "Excellent":
                return "bg-green-100 text-green-700";

            case "Très bien":
                return "bg-emerald-100 text-emerald-700";

            case "Bien":
                return "bg-blue-100 text-blue-700";

            case "Assez bien":
                return "bg-cyan-100 text-cyan-700";

            case "Moyen":
                return "bg-yellow-100 text-yellow-700";

            case "Passable":
                return "bg-orange-100 text-orange-700";

            case "Insuffisant":
                return "bg-red-100 text-red-700";

            case "Très insuffisant":
                return "bg-red-200 text-red-800";

            case "Faible":
                return "bg-red-300 text-red-900";

            case "Absent":
                return "bg-gray-200 text-gray-600";

            default:
                return "bg-gray-100 text-gray-500";
        }
    }

    return (
        <AdminLayout>
            <Head title={`Saisie des notes - ${evaluation.libelle}`} />

            <div className="mx-auto max-w-7xl space-y-6">

                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="rounded-xl bg-white p-8 shadow">

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Saisie des notes
                            </h1>

                            <p className="mt-2 text-gray-500">
                                {evaluation.libelle}
                            </p>
                        </div>

                        <Link
                            href={route(
                                "evaluations.show",
                                evaluation.id
                            )}
                            className="rounded-lg border px-5 py-3 text-center hover:bg-gray-50"
                        >
                            ← Retour à l'évaluation
                        </Link>

                    </div>

                    {/* =================================================
                        INFORMATIONS
                    ================================================= */}

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-500">
                                Établissement
                            </p>

                            <p className="mt-1 font-semibold">
                                {evaluation.etablissement?.nom ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-500">
                                Année scolaire
                            </p>

                            <p className="mt-1 font-semibold">
                                {evaluation.annee_scolaire?.libelle ??
                                    evaluation.anneeScolaire?.libelle ??
                                    "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-500">
                                Classe
                            </p>

                            <p className="mt-1 font-semibold">
                                {evaluation.classe?.libelle ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-gray-500">
                                Barème
                            </p>

                            <p className="mt-1 text-2xl font-bold text-blue-600">
                                /{evaluation.bareme}
                            </p>
                        </div>

                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div>
                            <span className="text-sm text-gray-500">
                                Matière
                            </span>

                            <p className="font-semibold">
                                {evaluation.matiere?.libelle ?? "—"}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                Enseignant
                            </span>

                            <p className="font-semibold">
                                {evaluation.enseignant
                                    ? `${evaluation.enseignant.nom ?? ""} ${evaluation.enseignant.prenoms ?? ""}`
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                Période
                            </span>

                            <p className="font-semibold">
                                {evaluation.periode ?? "—"}
                            </p>
                        </div>

                    </div>

                </div>

                {/* =====================================================
                    GRILLE DES APPRÉCIATIONS
                ===================================================== */}

                <div className="rounded-xl bg-white p-6 shadow">

                    <h2 className="text-xl font-bold text-gray-800">
                        Grille des appréciations
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Les appréciations sont calculées automatiquement
                        à partir de la note normalisée sur 20.
                    </p>

                    <div className="mt-5 overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="bg-gray-100">

                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Note /20
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Appréciation
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        18 à 20
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Excellent
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        16 à &lt;18
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Très bien
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        14 à &lt;16
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Bien
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        12 à &lt;14
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Assez bien
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        11 à &lt;12
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Moyen
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        10 à &lt;11
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Passable
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        8 à &lt;10
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Insuffisant
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        5 à &lt;8
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Très insuffisant
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">
                                        0 à &lt;5
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        Faible
                                    </td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* =====================================================
                    NOTES DES ÉLÈVES
                ===================================================== */}

                <div className="rounded-xl bg-white shadow">

                    <div className="border-b bg-slate-50 px-6 py-5">

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                            <div>
                                <h2 className="text-xl font-bold">
                                    Notes des élèves
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {eleves.length} élève
                                    {eleves.length > 1 ? "s" : ""} dans cette
                                    classe
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-700">
                                Note maximale : {evaluation.bareme}
                            </div>

                        </div>

                    </div>

                    <form onSubmit={submit}>

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-100">

                                    <tr>

                                        <th className="px-4 py-4 text-left">
                                            #
                                        </th>

                                        <th className="px-4 py-4 text-left">
                                            Élève
                                        </th>

                                        <th className="px-4 py-4 text-center">
                                            Note /{evaluation.bareme}
                                        </th>

                                        <th className="px-4 py-4 text-center">
                                            Note /20
                                        </th>

                                        <th className="px-4 py-4 text-center">
                                            Appréciation
                                        </th>

                                        <th className="px-4 py-4 text-center">
                                            Absent
                                        </th>

                                        <th className="px-4 py-4 text-left">
                                            Observation
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {eleves.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="px-6 py-10 text-center text-gray-500"
                                            >
                                                Aucun élève actif dans cette
                                                classe.
                                            </td>

                                        </tr>

                                    ) : (

                                        eleves.map((eleve, index) => {

                                            const ligne =
                                                data.notes[index];

                                            const invalide =
                                                noteInvalide(
                                                    ligne.note
                                                );

                                            const noteSur20 =
                                                calculerNoteSur20(
                                                    ligne.note
                                                );

                                            return (

                                                <tr
                                                    key={eleve.id}
                                                    className="border-t hover:bg-gray-50"
                                                >

                                                    {/* Numéro */}

                                                    <td className="px-4 py-4 font-semibold text-gray-500">
                                                        {index + 1}
                                                    </td>

                                                    {/* Élève */}

                                                    <td className="px-4 py-4">

                                                        <div className="font-semibold text-gray-800">
                                                            {eleve.nom}{" "}
                                                            {eleve.prenoms}
                                                        </div>

                                                        <div className="text-sm text-gray-500">
                                                            {eleve.code_eleve}
                                                        </div>

                                                    </td>

                                                    {/* Note */}

                                                    <td className="px-4 py-4 text-center">

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={
                                                                evaluation.bareme
                                                            }
                                                            step="0.01"
                                                            value={ligne.note}
                                                            disabled={
                                                                ligne.absent
                                                            }
                                                            onChange={(e) =>
                                                                updateNote(
                                                                    index,
                                                                    "note",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className={`w-28 rounded-lg border p-3 text-center font-semibold ${
                                                                ligne.absent
                                                                    ? "bg-gray-100"
                                                                    : invalide
                                                                      ? "border-red-500 bg-red-50"
                                                                      : ""
                                                            }`}
                                                        />

                                                        {invalide && (

                                                            <p className="mt-1 text-xs text-red-600">
                                                                Maximum :{" "}
                                                                {
                                                                    evaluation.bareme
                                                                }
                                                            </p>

                                                        )}

                                                        {errors[
                                                            `notes.${index}.note`
                                                        ] && (

                                                            <p className="mt-1 text-xs text-red-600">
                                                                {
                                                                    errors[
                                                                        `notes.${index}.note`
                                                                    ]
                                                                }
                                                            </p>

                                                        )}

                                                    </td>

                                                    {/* Note /20 */}

                                                    <td className="px-4 py-4 text-center">

                                                        <span className="inline-flex min-w-[70px] justify-center rounded-lg bg-slate-100 px-3 py-2 font-semibold text-gray-700">
                                                            {ligne.absent
                                                                ? "—"
                                                                : noteSur20 ||
                                                                  "—"}
                                                        </span>

                                                    </td>

                                                    {/* Appréciation */}

                                                    <td className="px-4 py-4 text-center">

                                                        <span
                                                            className={`inline-flex min-w-[145px] justify-center rounded-lg px-3 py-2 font-semibold ${classeAppreciation(
                                                                ligne.appreciation
                                                            )}`}
                                                        >
                                                            {ligne.appreciation ||
                                                                "—"}
                                                        </span>

                                                    </td>

                                                    {/* Absent */}

                                                    <td className="px-4 py-4 text-center">

                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                ligne.absent
                                                            }
                                                            onChange={(e) =>
                                                                updateNote(
                                                                    index,
                                                                    "absent",
                                                                    e.target.checked
                                                                )
                                                            }
                                                            className="h-5 w-5"
                                                        />

                                                    </td>

                                                    {/* Observation */}

                                                    <td className="px-4 py-4">

                                                        <input
                                                            type="text"
                                                            value={
                                                                ligne.observation
                                                            }
                                                            onChange={(e) =>
                                                                updateNote(
                                                                    index,
                                                                    "observation",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Observation de l'enseignant..."
                                                            className="w-full min-w-[250px] rounded-lg border p-3"
                                                        />

                                                    </td>

                                                </tr>

                                            );
                                        })

                                    )}

                                </tbody>

                            </table>

                        </div>

                        {/* Erreurs générales */}

                        {errors.notes && (

                            <div className="mx-6 mt-4 rounded-lg bg-red-50 p-4 text-red-700">
                                {errors.notes}
                            </div>

                        )}

                        {/* Boutons */}

                        <div className="flex justify-end gap-4 border-t p-6">

                            <Link
                                href={route(
                                    "evaluations.show",
                                    evaluation.id
                                )}
                                className="rounded-lg border px-6 py-3 hover:bg-gray-50"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    eleves.length === 0
                                }
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? "Enregistrement..."
                                    : "💾 Enregistrer les notes"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </AdminLayout>
    );
}