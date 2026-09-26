import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useRef } from "react";

export default function Programmer({
    etablissements = [],
    annees = [],
    classes = [],
    matieres = [],
    niveaux = [],
}) {
    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: etablissements[0]?.id ?? "",
        annee_scolaire_id: annees[0]?.id ?? "",
        niveau_id: "",
        classe_ids: [],
        matiere_id: "",
        libelle: "",
        type: "Devoir de niveau",
        numero: "",
        date_evaluation: "",
        heure_debut: "",
        heure_fin: "",
        bareme: 20,
        coefficient: 1,
        periode: "Trimestre 1",
        prise_en_compte_moyenne: true,
        notifier_professeurs: false,
        publier_eleves: false,
        publier_parents: false,
    });

    const classesDisponibles = classes.filter(
        (classe) =>
            String(classe.etablissement_id) === String(data.etablissement_id) &&
            String(classe.annee_scolaire_id) ===
                String(data.annee_scolaire_id) &&
            String(classe.niveau_id) === String(data.niveau_id),
    );

    const matieresDisponibles = matieres.filter((matiere) =>
        classesDisponibles.some((classe) =>
            classe.maquette?.matieres?.some(
                (item) => String(item.id) === String(matiere.id),
            ),
        ),
    );

    const intituleAutomatique = (() => {
        const matiere = matieres.find(
            (item) => String(item.id) === String(data.matiere_id),
        )?.libelle;
        const niveau = niveaux.find(
            (item) => String(item.id) === String(data.niveau_id),
        )?.libelle;
        const numero = data.numero ? ` n°${data.numero}` : "";

        return (
            [data.type, matiere, niveau].filter(Boolean).join(" - ") + numero
        );
    })();

    const dernierIntituleAutomatique = useRef("");

    function dureeSelonNiveau(libelle) {
        const niveau = String(libelle ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        if (["sixieme", "cinquieme", "quatrieme"].includes(niveau)) {
            return 1;
        }

        if (["troisieme", "seconde", "premiere"].includes(niveau)) {
            return 2;
        }

        if (niveau === "terminale") {
            return 4;
        }

        return null;
    }

    function heureFinProposee(heureDebut, niveauId) {
        if (!heureDebut) {
            return "";
        }

        const niveau = niveaux.find(
            (item) => String(item.id) === String(niveauId),
        );
        const duree = dureeSelonNiveau(niveau?.libelle);

        if (!duree) {
            return "";
        }

        const [heures, minutes] = heureDebut.split(":").map(Number);
        const totalMinutes = heures * 60 + minutes + duree * 60;
        const minutesFinales = totalMinutes % (24 * 60);
        const heuresFinales = Math.floor(minutesFinales / 60);
        const resteMinutes = minutesFinales % 60;

        return `${String(heuresFinales).padStart(2, "0")}:${String(
            resteMinutes,
        ).padStart(2, "0")}`;
    }

    useEffect(() => {
        if (
            !data.libelle ||
            data.libelle === dernierIntituleAutomatique.current
        ) {
            setData("libelle", intituleAutomatique);
            dernierIntituleAutomatique.current = intituleAutomatique;
        }
    }, [data.type, data.matiere_id, data.niveau_id, data.numero]);

    useEffect(() => {
        const heureFin = heureFinProposee(data.heure_debut, data.niveau_id);

        if (heureFin) {
            setData("heure_fin", heureFin);
        }
    }, [data.heure_debut, data.niveau_id]);

    function changerNiveau(value) {
        setData({ ...data, niveau_id: value, classe_ids: [], matiere_id: "" });
    }

    function selectionnerToutesLesClasses() {
        setData(
            "classe_ids",
            classesDisponibles.map((classe) => String(classe.id)),
        );
    }

    function toggleClasse(id) {
        const value = String(id);
        setData(
            "classe_ids",
            data.classe_ids.includes(value)
                ? data.classe_ids.filter((classeId) => classeId !== value)
                : [...data.classe_ids, value],
        );
    }

    function submit(event) {
        event.preventDefault();
        post(route("evaluations.programmer.store"));
    }

    return (
        <AdminLayout>
            <Head title="Programmer une évaluation" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Programmer une évaluation
                    </h1>
                    <p className="text-gray-500">
                        Évaluation officielle applicable à plusieurs classes.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl bg-white p-6 shadow"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-gray-700">
                            Établissement
                            <select
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.etablissement_id}
                                onChange={(e) =>
                                    setData("etablissement_id", e.target.value)
                                }
                            >
                                {etablissements.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nom}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Année scolaire
                            <select
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.annee_scolaire_id}
                                onChange={(e) =>
                                    setData("annee_scolaire_id", e.target.value)
                                }
                            >
                                {annees.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.libelle}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Type d'évaluation
                            <select
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.type}
                                onChange={(e) =>
                                    setData("type", e.target.value)
                                }
                            >
                                <option>Devoir de niveau</option>
                                <option>Composition trimestrielle</option>
                                <option>Examen blanc</option>
                                <option>Devoir commun</option>
                                <option>Évaluation commune</option>
                                <option>Test diagnostique</option>
                                <option>Examen</option>
                                <option>Autre</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Niveau
                            <select
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.niveau_id}
                                onChange={(e) => changerNiveau(e.target.value)}
                            >
                                <option value="">Choisir un niveau</option>
                                {niveaux.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.libelle}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Matière
                            <select
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.matiere_id}
                                onChange={(e) =>
                                    setData("matiere_id", e.target.value)
                                }
                            >
                                <option value="">Choisir une matière</option>
                                {matieresDisponibles.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.libelle}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700 md:col-span-2">
                            Intitulé proposé
                            <input
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.libelle}
                                onChange={(e) =>
                                    (() => {
                                        dernierIntituleAutomatique.current = "";
                                        setData("libelle", e.target.value);
                                    })()
                                }
                                placeholder="L'intitulé sera proposé automatiquement"
                            />
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Numéro
                            <input
                                type="number"
                                min="1"
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.numero}
                                onChange={(e) =>
                                    setData("numero", e.target.value)
                                }
                                placeholder="Ex. 1"
                            />
                        </label>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-gray-700">
                                Classes concernées
                            </p>
                            <button
                                type="button"
                                onClick={selectionnerToutesLesClasses}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                Sélectionner toutes les classes
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
                            {classesDisponibles.map((classe) => (
                                <label
                                    key={classe.id}
                                    className="flex items-center gap-2 rounded p-2 hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.classe_ids.includes(
                                            String(classe.id),
                                        )}
                                        onChange={() => toggleClasse(classe.id)}
                                    />
                                    <span>{classe.libelle}</span>
                                </label>
                            ))}
                            {classesDisponibles.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    Aucune classe disponible.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <label className="text-sm font-medium text-gray-700">
                            Date
                            <input
                                type="date"
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.date_evaluation}
                                onChange={(e) =>
                                    setData("date_evaluation", e.target.value)
                                }
                            />
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Heure de début
                            <input
                                type="time"
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.heure_debut}
                                onChange={(e) =>
                                    setData("heure_debut", e.target.value)
                                }
                            />
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Heure de fin proposée
                            <input
                                type="time"
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.heure_fin}
                                onChange={(e) =>
                                    setData("heure_fin", e.target.value)
                                }
                            />
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Barème
                            <input
                                type="number"
                                min="1"
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.bareme}
                                onChange={(e) =>
                                    setData("bareme", e.target.value)
                                }
                            />
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                            Période
                            <select
                                className="mt-1 w-full rounded-lg border p-3"
                                value={data.periode}
                                onChange={(e) =>
                                    setData("periode", e.target.value)
                                }
                            >
                                <option>Trimestre 1</option>
                                <option>Trimestre 2</option>
                                <option>Trimestre 3</option>
                            </select>
                        </label>
                    </div>

                    <label className="text-sm font-medium text-gray-700">
                        Coefficient
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            className="mt-1 w-full max-w-xs rounded-lg border p-3"
                            value={data.coefficient}
                            onChange={(e) =>
                                setData("coefficient", e.target.value)
                            }
                        />
                    </label>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                            [
                                "prise_en_compte_moyenne",
                                "Prise en compte dans la moyenne",
                            ],
                            [
                                "notifier_professeurs",
                                "Notifier les professeurs concernés",
                            ],
                            ["publier_eleves", "Publier aux élèves"],
                            ["publier_parents", "Publier aux parents"],
                        ].map(([key, label]) => (
                            <label
                                key={key}
                                className="flex items-center gap-2 text-sm text-gray-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={data[key]}
                                    onChange={(e) =>
                                        setData(key, e.target.checked)
                                    }
                                />
                                {label}
                            </label>
                        ))}
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-gray-700">
                        <h2 className="font-semibold text-gray-900">
                            Récapitulatif
                        </h2>
                        <p className="mt-2">
                            {data.libelle || data.type || "Évaluation"} du{" "}
                            {data.periode} ·{" "}
                            {niveaux.find(
                                (item) =>
                                    String(item.id) === String(data.niveau_id),
                            )?.libelle || "Niveau non sélectionné"}
                        </p>
                        <p>
                            {matieres.find(
                                (item) =>
                                    String(item.id) === String(data.matiere_id),
                            )?.libelle || "Matière non sélectionnée"}{" "}
                            · {data.classe_ids.length} classe(s)
                        </p>
                        <p>
                            {data.date_evaluation || "Date non définie"}
                            {data.heure_debut && data.heure_fin
                                ? ` · ${data.heure_debut} – ${data.heure_fin}`
                                : ""}{" "}
                            · Note sur {data.bareme} · Coefficient{" "}
                            {data.coefficient}
                        </p>
                    </div>

                    {Object.values(errors).map((error, index) => (
                        <p key={index} className="text-sm text-red-600">
                            {error}
                        </p>
                    ))}

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route("evaluations.index")}
                            className="rounded-lg border px-5 py-3"
                        >
                            Annuler
                        </Link>
                        <button
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            {processing ? "Programmation..." : "Programmer"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
