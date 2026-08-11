import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ evaluation, eleves, notes }) {
    /*
    |--------------------------------------------------------------------------
    | Notes existantes
    |--------------------------------------------------------------------------
    */

    const notesExistantes = notes || {};

    /*
    |--------------------------------------------------------------------------
    | Déterminer automatiquement l'appréciation
    |--------------------------------------------------------------------------
    |
    | La note est toujours normalisée sur 20.
    |
    | 18 à 20      → Excellent
    | 16 à <18     → Très bien
    | 14 à <16     → Bien
    | 12 à <14     → Assez bien
    | 11 à <12     → Moyen
    | 10 à <11     → Passable
    | 8 à <10      → Insuffisant
    | 5 à <8       → Très insuffisant
    | 0 à <5       → Faible
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

        if (Number.isNaN(valeur) || Number.isNaN(bareme) || bareme <= 0) {
            return "";
        }

        /*
        | Normalisation de la note sur 20.
        |
        | Exemple :
        | 15/20 = 15/20
        | 24/30 = 16/20
        | 45/50 = 18/20
        */

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
    | Préparation des lignes
    |--------------------------------------------------------------------------
    */

    const initialNotes = eleves.map((eleve) => {
        const noteExistante = notesExistantes[eleve.id];

        const note = noteExistante?.note ?? "";
        const absent = Boolean(noteExistante?.absent ?? false);

        return {
            eleve_id: eleve.id,
            note: note,
            absent: absent,

            /*
            | L'appréciation est recalculée automatiquement.
            */

            appreciation: calculerAppreciation(note, absent),

            observation: noteExistante?.observation ?? "",
        };
    });

    const { data, setData, post, processing, errors } = useForm({
        notes: initialNotes,
    });

    /*
|--------------------------------------------------------------------------
| Génération automatique de l'appréciation
|--------------------------------------------------------------------------
*/

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

        if (field === "absent" && value === true) {
            nouvellesNotes[index].note = "";
            nouvellesNotes[index].appreciation = "";
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
    | Vérification côté interface
    |--------------------------------------------------------------------------
    */

    const noteMax = Number(evaluation.bareme);

    function noteInvalide(note) {
        if (note === "" || note === null || note === undefined) {
            return false;
        }

        return Number(note) < 0 || Number(note) > noteMax;
    }

    /*
    |--------------------------------------------------------------------------
    | Note normalisée sur 20
    |--------------------------------------------------------------------------
    */

    function noteSur20(note) {
        if (note === "" || note === null || note === undefined) {
            return "";
        }

        const valeur = Number(note);
        const bareme = Number(evaluation.bareme);

        if (Number.isNaN(valeur) || Number.isNaN(bareme) || bareme <= 0) {
            return "";
        }

        return ((valeur / bareme) * 20).toFixed(2);
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
                            href={route("evaluations.show", evaluation.id)}
                            className="rounded-lg border px-5 py-3 text-center hover:bg-gray-50"
                        >
                            ← Retour à l'évaluation
                        </Link>
                    </div>

                    {/* =================================================
                        INFORMATIONS ÉVALUATION
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
                                {evaluation.anneeScolaire?.libelle ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-500">Classe</p>

                            <p className="mt-1 font-semibold">
                                {evaluation.classe?.libelle ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-gray-500">Barème</p>

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
                        Les appréciations sont calculées automatiquement sur la
                        base d'une note normalisée sur 20.
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
                                    <td className="px-4 py-2">18 à 20</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Excellent
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">16 à &lt;18</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Très bien
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">14 à &lt;16</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Bien
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">12 à &lt;14</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Assez bien
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">11 à &lt;12</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Moyen
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">10 à &lt;11</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Passable
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">8 à &lt;10</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Insuffisant
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">5 à &lt;8</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Très insuffisant
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2">0 à &lt;5</td>
                                    <td className="px-4 py-2 font-semibold">
                                        Faible
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* =====================================================
                    SAISIE DES NOTES
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
                                            const ligne = data.notes[index];

                                            const invalide = noteInvalide(
                                                ligne.note,
                                            );

                                            const appreciation =
                                                calculerAppreciation(
                                                    ligne.note,
                                                    ligne.absent,
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
                                                                    e.target
                                                                        .value,
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

                                                    {/* Note normalisée */}

                                                    <td className="px-4 py-4 text-center">
                                                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-2 font-semibold text-gray-700">
                                                            {ligne.absent
                                                                ? "—"
                                                                : noteSur20(
                                                                      ligne.note,
                                                                  ) || "—"}
                                                        </span>
                                                    </td>

                                                    {/* Appréciation automatique */}

                                                    <td className="px-4 py-4 text-center">
    <span
        className={`inline-flex min-w-[150px] justify-center rounded-lg px-3 py-2 font-semibold ${
            appreciation === "Excellent"
                ? "bg-green-100 text-green-700"
                : appreciation === "Très bien"
                  ? "bg-emerald-100 text-emerald-700"
                  : appreciation === "Bien"
                    ? "bg-blue-100 text-blue-700"
                    : appreciation === "Assez bien"
                      ? "bg-cyan-100 text-cyan-700"
                      : appreciation === "Moyen"
                        ? "bg-yellow-100 text-yellow-700"
                        : appreciation === "Passable"
                          ? "bg-orange-100 text-orange-700"
                          : appreciation === "Absent"
                            ? "bg-gray-200 text-gray-600"
                            : appreciation === "Insuffisant"
                              ? "bg-red-100 text-red-700"
                              : appreciation === "Très insuffisant"
                                ? "bg-red-100 text-red-700"
                                : appreciation === "Faible"
                                  ? "bg-red-200 text-red-800"
                                  : "bg-gray-100 text-gray-500"
        }`}
    >
        {appreciation || "—"}
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
                                                                    e.target
                                                                        .checked,
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
                                                                    e.target
                                                                        .value,
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

                        {/* =================================================
                            ERREURS GÉNÉRALES
                        ================================================= */}

                        {errors.notes && (
                            <div className="mx-6 mt-4 rounded-lg bg-red-50 p-4 text-red-700">
                                {errors.notes}
                            </div>
                        )}

                        {/* =================================================
                            BOUTONS
                        ================================================= */}

                        <div className="flex justify-end gap-4 border-t p-6">
                            <Link
                                href={route("evaluations.show", evaluation.id)}
                                className="rounded-lg border px-6 py-3 hover:bg-gray-50"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={processing || eleves.length === 0}
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
