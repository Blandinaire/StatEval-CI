import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";

const JOURS = [
    { key: "lundi", label: "Lundi" },
    { key: "mardi", label: "Mardi" },
    { key: "mercredi", label: "Mercredi" },
    { key: "jeudi", label: "Jeudi" },
    { key: "vendredi", label: "Vendredi" },
];

const nouvelleLigne = {
    jour: "lundi",
    creneau_horaire_id: "",
    classe_id: "",
    matiere_id: "",
    enseignant_id: "",
    salle: "",
};

const nouveauCreneau = {
    libelle: "Cours",
    type: "cours",
    heure_debut: "07:30",
    heure_fin: "08:30",
    ordre: "1",
};

export default function Index({
    annees = [],
    classes = [],
    creneaux = [],
    emploi = null,
    matieresParClasse = {},
    enseignantsParClasseMatiere = {},
    etablissements = [],
    etablissement = null,
    isSuperAdmin = false,
    filtres = {},
}) {
    const [jourActif, setJourActif] = useState("lundi");
    const [coursModal, setCoursModal] = useState(null);
    const [horairesOuverts, setHorairesOuverts] = useState(false);
    const [creneauModal, setCreneauModal] = useState(null);
    const [cours, setCours] = useState(nouvelleLigne);
    const [creneauForm, setCreneauForm] = useState(nouveauCreneau);
    const [erreur, setErreur] = useState("");

    const annee = annees.find(
        (item) => Number(item.id) === Number(filtres.annee_scolaire_id),
    );

    const grille = useMemo(() => {
        const result = new Map();

        (emploi?.lignes ?? []).forEach((ligne) => {
            result.set(
                `${ligne.jour}:${ligne.creneau_horaire_id}:${ligne.classe_id}`,
                ligne,
            );
        });

        return result;
    }, [emploi?.lignes]);

    const matieresClasse = matieresParClasse[coursModal?.classe?.id] ?? [];
    const enseignantsCours =
        enseignantsParClasseMatiere[cours.classe_id]?.[cours.matiere_id] ?? [];

    function deplacerClasse(index, direction) {
        const prochaineListe = [...classes];
        const cible = index + direction;
        if (cible < 0 || cible >= prochaineListe.length || !emploi?.id) return;

        [prochaineListe[index], prochaineListe[cible]] = [
            prochaineListe[cible],
            prochaineListe[index],
        ];

        router.patch(
            route("emplois-du-temps.classes.reordonner", emploi.id),
            { ordre_classes: prochaineListe.map((classe) => classe.id) },
            { preserveScroll: true },
        );
    }

    function filtrer(champ, valeur) {
        const params = {
            etablissement_id:
                champ === "etablissement_id"
                    ? valeur
                    : (filtres.etablissement_id ?? ""),
            annee_scolaire_id:
                champ === "annee_scolaire_id"
                    ? valeur
                    : (filtres.annee_scolaire_id ?? ""),
        };

        router.get(route("emplois-du-temps.index"), params, {
            preserveScroll: true,
            replace: true,
        });
    }

    function creerEmploi() {
        setErreur("");
        router.post(
            route("emplois-du-temps.creer"),
            {
                etablissement_id: filtres.etablissement_id,
                annee_scolaire_id: filtres.annee_scolaire_id,
            },
            {
                preserveScroll: true,
                onError: (errors) =>
                    setErreur(
                        Object.values(errors)[0] ?? "Création impossible.",
                    ),
            },
        );
    }

    function ouvrirCours(jour, creneau, classe, ligne = null) {
        setErreur("");
        setCours({
            jour,
            creneau_horaire_id: String(creneau.id),
            classe_id: String(classe.id),
            matiere_id: ligne?.matiere_id ? String(ligne.matiere_id) : "",
            enseignant_id: ligne?.enseignant_id
                ? String(ligne.enseignant_id)
                : "",
            salle: ligne?.salle ?? "",
        });
        setCoursModal({ jour, creneau, classe, ligne });
    }

    function enregistrerCours(event) {
        event.preventDefault();
        if (!emploi?.id) return;

        router.post(
            route("emplois-du-temps.ligne.enregistrer"),
            { emploi_du_temps_id: emploi.id, ...cours },
            {
                preserveScroll: true,
                onSuccess: () => setCoursModal(null),
                onError: (errors) =>
                    setErreur(
                        Object.values(errors)[0] ??
                            "Enregistrement impossible.",
                    ),
            },
        );
    }

    function supprimerCours(ligne) {
        if (!confirm("Supprimer ce cours de l’emploi du temps ?")) return;

        router.delete(route("emplois-du-temps.ligne.supprimer", ligne.id), {
            preserveScroll: true,
        });
    }

    function ouvrirCreneau(creneau = null) {
        setErreur("");
        setCreneauForm(
            creneau
                ? {
                      id: creneau.id,
                      libelle: creneau.libelle,
                      type:
                          creneau.type ??
                          (/pause|récré|recre/i.test(creneau.libelle ?? "")
                              ? "pause"
                              : "cours"),
                      heure_debut: creneau.heure_debut?.slice(0, 5) ?? "",
                      heure_fin: creneau.heure_fin?.slice(0, 5) ?? "",
                      ordre: String(creneau.ordre),
                  }
                : { ...nouveauCreneau, ordre: String(creneaux.length + 1) },
        );
        setCreneauModal(true);
    }

    function enregistrerCreneau(event) {
        event.preventDefault();
        const edition = Boolean(creneauForm.id);
        const options = {
            preserveScroll: true,
            onSuccess: () => setCreneauModal(null),
            onError: (errors) =>
                setErreur(
                    Object.values(errors)[0] ?? "Enregistrement impossible.",
                ),
        };
        const donnees = {
            ...creneauForm,
            etablissement_id: filtres.etablissement_id,
        };

        if (edition) {
            router.put(
                route("creneaux-horaires.update", creneauForm.id),
                donnees,
                options,
            );
        } else {
            router.post(route("creneaux-horaires.store"), donnees, options);
        }
    }

    function supprimerCreneau(creneau) {
        if (!confirm(`Supprimer le créneau « ${creneau.libelle} » ?`)) return;

        router.delete(route("creneaux-horaires.destroy", creneau.id), {
            preserveScroll: true,
        });
    }

    const selectionComplete = Boolean(
        filtres.etablissement_id && filtres.annee_scolaire_id,
    );
    const pause = (creneau) =>
        creneau.type === "pause" ||
        /pause|récré|recre/i.test(creneau.libelle ?? "");

    return (
        <AdminLayout>
            <Head title="Emploi du temps hebdomadaire" />

            <div className="mx-auto max-w-[1800px] space-y-5">
                <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase text-teal-700">
                            Organisation scolaire
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            Emploi du temps — Semaine
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {etablissement?.nom ??
                                "Sélectionnez un établissement"}
                            {annee?.libelle
                                ? ` · Année scolaire ${annee.libelle}`
                                : ""}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {selectionComplete && (
                            <button
                                type="button"
                                onClick={() =>
                                    setHorairesOuverts((value) => !value)
                                }
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                <Clock3 size={16} />
                                Horaires ({creneaux.length})
                            </button>
                        )}
                        {selectionComplete && !emploi && (
                            <button
                                type="button"
                                onClick={creerEmploi}
                                className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                            >
                                <Plus size={17} /> Créer le planning
                            </button>
                        )}
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {isSuperAdmin && (
                        <label className="text-sm font-semibold text-gray-700">
                            Établissement
                            <select
                                value={filtres.etablissement_id ?? ""}
                                onChange={(event) =>
                                    filtrer(
                                        "etablissement_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-sm"
                            >
                                <option value="">
                                    Choisir un établissement
                                </option>
                                {etablissements.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nom}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <label className="text-sm font-semibold text-gray-700">
                        Année scolaire
                        <select
                            value={filtres.annee_scolaire_id ?? ""}
                            onChange={(event) =>
                                filtrer("annee_scolaire_id", event.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-sm"
                        >
                            <option value="">Choisir une année</option>
                            {annees.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>
                    </label>
                </section>

                {horairesOuverts && selectionComplete && (
                    <section className="border-y border-gray-200 py-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-gray-900">
                                    Créneaux et pauses
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Définissez l’ordre et les heures affichées
                                    sur le planning mural.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => ouvrirCreneau()}
                                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-teal-700 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                            >
                                <Plus size={16} /> Ajouter
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100 border-y border-gray-200">
                            {creneaux.length === 0 ? (
                                <p className="py-5 text-sm text-gray-500">
                                    Aucun horaire défini. Ajoutez les périodes
                                    de cours et les pauses.
                                </p>
                            ) : (
                                creneaux.map((creneau) => (
                                    <div
                                        key={creneau.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                                    >
                                        <div>
                                            <span className="font-semibold text-gray-800">
                                                {creneau.libelle}
                                            </span>
                                            <span className="ml-3 text-sm tabular-nums text-gray-500">
                                                {creneau.heure_debut?.slice(
                                                    0,
                                                    5,
                                                )}
                                                –
                                                {creneau.heure_fin?.slice(0, 5)}
                                            </span>
                                            <span className="ml-3 text-xs text-gray-400">
                                                Ordre {creneau.ordre}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                title="Modifier l’horaire"
                                                onClick={() =>
                                                    ouvrirCreneau(creneau)
                                                }
                                                className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-teal-800"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                title="Supprimer l’horaire"
                                                onClick={() =>
                                                    supprimerCreneau(creneau)
                                                }
                                                className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {selectionComplete && (
                    <>
                        <nav
                            className="flex gap-1 overflow-x-auto border-b border-gray-200"
                            aria-label="Jours de la semaine"
                        >
                            {JOURS.map((jour) => (
                                <button
                                    key={jour.key}
                                    type="button"
                                    onClick={() => setJourActif(jour.key)}
                                    className={`min-w-24 border-b-2 px-4 py-3 text-sm font-semibold transition ${jourActif === jour.key ? "border-teal-700 text-teal-800" : "border-transparent text-gray-500 hover:text-gray-900"}`}
                                >
                                    {jour.label}
                                </button>
                            ))}
                        </nav>

                        {!emploi ? (
                            <div className="border-y border-dashed border-gray-300 py-12 text-center">
                                <CalendarDays
                                    className="mx-auto text-gray-400"
                                    size={28}
                                />
                                <p className="mt-3 font-semibold text-gray-800">
                                    Le planning de cette année n’est pas encore
                                    créé.
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Créez-le, puis ajoutez les créneaux et les
                                    cours par classe.
                                </p>
                            </div>
                        ) : classes.length === 0 ? (
                            <div className="border-y border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
                                Aucune classe n’est enregistrée pour cet
                                établissement et cette année.
                            </div>
                        ) : creneaux.length === 0 ? (
                            <div className="border-y border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
                                Ajoutez d’abord les horaires et pauses pour
                                construire le planning.
                            </div>
                        ) : (
                            <div className="overflow-hidden border-y border-gray-200 bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px] border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 text-xs font-bold uppercase text-gray-600">
                                                <th className="sticky left-0 z-20 w-40 min-w-40 border-b border-r border-gray-200 bg-gray-100 px-4 py-3 text-left">
                                                    Horaires
                                                </th>
                                                {classes.map((classe) => (
                                                    <th
                                                        key={classe.id}
                                                        className="min-w-44 border-b border-r border-gray-200 px-3 py-3 text-center last:border-r-0"
                                                    >
                                                        <span className="mb-1 flex justify-center gap-1">
                                                            <button
                                                                type="button"
                                                                title={`Déplacer ${classe.libelle} à gauche`}
                                                                aria-label={`Déplacer ${classe.libelle} à gauche`}
                                                                disabled={
                                                                    classes[0]
                                                                        ?.id ===
                                                                    classe.id
                                                                }
                                                                onClick={() =>
                                                                    deplacerClasse(
                                                                        classes.indexOf(
                                                                            classe,
                                                                        ),
                                                                        -1,
                                                                    )
                                                                }
                                                                className="rounded p-1 text-gray-500 hover:bg-white hover:text-teal-800 disabled:opacity-30"
                                                            >
                                                                <ChevronLeft
                                                                    size={15}
                                                                />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title={`Déplacer ${classe.libelle} à droite`}
                                                                aria-label={`Déplacer ${classe.libelle} à droite`}
                                                                disabled={
                                                                    classes[
                                                                        classes.length -
                                                                            1
                                                                    ]?.id ===
                                                                    classe.id
                                                                }
                                                                onClick={() =>
                                                                    deplacerClasse(
                                                                        classes.indexOf(
                                                                            classe,
                                                                        ),
                                                                        1,
                                                                    )
                                                                }
                                                                className="rounded p-1 text-gray-500 hover:bg-white hover:text-teal-800 disabled:opacity-30"
                                                            >
                                                                <ChevronRight
                                                                    size={15}
                                                                />
                                                            </button>
                                                        </span>
                                                        <span className="block text-sm font-bold normal-case text-gray-900">
                                                            {classe.libelle}
                                                        </span>
                                                        <span className="mt-0.5 block text-[10px] font-medium normal-case text-gray-500">
                                                            {classe.niveau
                                                                ?.libelle ??
                                                                "Classe"}
                                                        </span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {creneaux.map((creneau) => (
                                                <tr key={creneau.id}>
                                                    <th className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left align-middle">
                                                        <span className="block text-xs font-bold uppercase text-gray-700">
                                                            {creneau.libelle}
                                                        </span>
                                                        <span className="mt-1 block text-sm font-semibold tabular-nums text-gray-900">
                                                            {creneau.heure_debut?.slice(
                                                                0,
                                                                5,
                                                            )}
                                                            –
                                                            {creneau.heure_fin?.slice(
                                                                0,
                                                                5,
                                                            )}
                                                        </span>
                                                    </th>
                                                    {pause(creneau) ? (
                                                        <td
                                                            colSpan={
                                                                classes.length
                                                            }
                                                            className="border-b border-gray-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-800"
                                                        >
                                                            {creneau.libelle ||
                                                                "Récréation / Pause"}
                                                        </td>
                                                    ) : (
                                                        classes.map(
                                                            (classe) => {
                                                                const ligne =
                                                                    grille.get(
                                                                        `${jourActif}:${creneau.id}:${classe.id}`,
                                                                    );

                                                                return (
                                                                    <td
                                                                        key={
                                                                            classe.id
                                                                        }
                                                                        className="h-24 border-b border-r border-gray-200 p-1.5 align-top last:border-r-0"
                                                                    >
                                                                        {ligne ? (
                                                                            <article
                                                                                className="group relative h-full min-h-20 border-l-4 p-2.5"
                                                                                style={{
                                                                                    borderLeftColor:
                                                                                        /^#[\da-f]{6}$/i.test(
                                                                                            ligne
                                                                                                .matiere
                                                                                                ?.couleur ??
                                                                                                "",
                                                                                        )
                                                                                            ? ligne
                                                                                                  .matiere
                                                                                                  .couleur
                                                                                            : "#0f766e",
                                                                                    backgroundColor: `color-mix(in srgb, ${/^#[\da-f]{6}$/i.test(ligne.matiere?.couleur ?? "") ? ligne.matiere.couleur : "#0f766e"} 13%, white)`,
                                                                                }}
                                                                            >
                                                                                <h3 className="pr-12 text-sm font-bold leading-snug text-gray-900">
                                                                                    {ligne
                                                                                        .matiere
                                                                                        ?.libelle ??
                                                                                        "Matière"}
                                                                                </h3>
                                                                                {ligne.enseignant && (
                                                                                    <p className="mt-1 text-xs text-gray-600">
                                                                                        {
                                                                                            ligne
                                                                                                .enseignant
                                                                                                .nom
                                                                                        }{" "}
                                                                                        {
                                                                                            ligne
                                                                                                .enseignant
                                                                                                .prenoms
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                                {ligne.salle && (
                                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                                        Salle{" "}
                                                                                        {
                                                                                            ligne.salle
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                                <div className="absolute right-1 top-1 flex opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                                                                                    <button
                                                                                        type="button"
                                                                                        title="Modifier le cours"
                                                                                        onClick={() =>
                                                                                            ouvrirCours(
                                                                                                jourActif,
                                                                                                creneau,
                                                                                                classe,
                                                                                                ligne,
                                                                                            )
                                                                                        }
                                                                                        className="rounded p-1.5 text-gray-600 hover:bg-white hover:text-teal-800"
                                                                                    >
                                                                                        <Pencil
                                                                                            size={
                                                                                                14
                                                                                            }
                                                                                        />
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        title="Supprimer le cours"
                                                                                        onClick={() =>
                                                                                            supprimerCours(
                                                                                                ligne,
                                                                                            )
                                                                                        }
                                                                                        className="rounded p-1.5 text-gray-600 hover:bg-white hover:text-red-700"
                                                                                    >
                                                                                        <Trash2
                                                                                            size={
                                                                                                14
                                                                                            }
                                                                                        />
                                                                                    </button>
                                                                                </div>
                                                                            </article>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    ouvrirCours(
                                                                                        jourActif,
                                                                                        creneau,
                                                                                        classe,
                                                                                    )
                                                                                }
                                                                                className="flex h-full min-h-20 w-full items-center justify-center border border-dashed border-gray-200 text-gray-300 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                                                                                title={`Ajouter un cours pour ${classe.libelle}`}
                                                                            >
                                                                                <Plus
                                                                                    size={
                                                                                        18
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                );
                                                            },
                                                        )
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!selectionComplete && (
                    <div className="border-y border-dashed border-gray-300 py-12 text-center">
                        <CalendarDays
                            className="mx-auto text-gray-400"
                            size={28}
                        />
                        <p className="mt-3 font-semibold text-gray-800">
                            Sélectionnez l’établissement et l’année scolaire.
                        </p>
                    </div>
                )}

                {coursModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"
                        role="presentation"
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="cours-titre"
                            className="w-full max-w-lg bg-white shadow-2xl"
                        >
                            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                                <div>
                                    <p className="text-xs font-bold uppercase text-teal-700">
                                        {coursModal.classe.libelle} ·{" "}
                                        {coursModal.jour}
                                    </p>
                                    <h2
                                        id="cours-titre"
                                        className="mt-1 text-xl font-bold text-gray-900"
                                    >
                                        {coursModal.ligne
                                            ? "Modifier le cours"
                                            : "Ajouter un cours"}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {coursModal.creneau.libelle} ·{" "}
                                        {coursModal.creneau.heure_debut?.slice(
                                            0,
                                            5,
                                        )}
                                        –
                                        {coursModal.creneau.heure_fin?.slice(
                                            0,
                                            5,
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCoursModal(null)}
                                    title="Fermer"
                                    className="rounded p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    <X size={19} />
                                </button>
                            </div>
                            <form
                                onSubmit={enregistrerCours}
                                className="space-y-4 p-5"
                            >
                                <label className="block text-sm font-semibold text-gray-700">
                                    Matière
                                    <select
                                        required
                                        disabled={matieresClasse.length === 0}
                                        value={cours.matiere_id}
                                        onChange={(event) =>
                                            setCours({
                                                ...cours,
                                                matiere_id: event.target.value,
                                                enseignant_id: "",
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="">
                                            {matieresClasse.length
                                                ? "Choisir une matière de la maquette"
                                                : "Aucune matière configurée dans la maquette"}
                                        </option>
                                        {matieresClasse.map((matiere) => (
                                            <option
                                                key={matiere.id}
                                                value={matiere.id}
                                            >
                                                {matiere.libelle}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Enseignant
                                    <select
                                        value={cours.enseignant_id}
                                        disabled={!cours.matiere_id}
                                        onChange={(event) =>
                                            setCours({
                                                ...cours,
                                                enseignant_id:
                                                    event.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="">
                                            {cours.matiere_id
                                                ? "Choisir un enseignant affecté"
                                                : "Choisissez d’abord une matière"}
                                        </option>
                                        {enseignantsCours.map((enseignant) => (
                                            <option
                                                key={enseignant.id}
                                                value={enseignant.id}
                                            >
                                                {enseignant.nom}{" "}
                                                {enseignant.prenoms}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Salle
                                    <input
                                        value={cours.salle}
                                        onChange={(event) =>
                                            setCours({
                                                ...cours,
                                                salle: event.target.value,
                                            })
                                        }
                                        maxLength={80}
                                        placeholder="Ex. Salle 4"
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    />
                                </label>
                                {erreur && (
                                    <p
                                        role="alert"
                                        className="text-sm font-medium text-red-700"
                                    >
                                        {erreur}
                                    </p>
                                )}
                                <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCoursModal(null)}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {creneauModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"
                        role="presentation"
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="creneau-titre"
                            className="w-full max-w-lg bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                                <h2
                                    id="creneau-titre"
                                    className="text-xl font-bold text-gray-900"
                                >
                                    {creneauForm.id
                                        ? "Modifier l’horaire"
                                        : "Ajouter un horaire ou une pause"}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setCreneauModal(false)}
                                    title="Fermer"
                                    className="rounded p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    <X size={19} />
                                </button>
                            </div>
                            <form
                                onSubmit={enregistrerCreneau}
                                className="space-y-4 p-5"
                            >
                                <label className="block text-sm font-semibold text-gray-700">
                                    Libellé
                                    <input
                                        required
                                        value={creneauForm.libelle}
                                        onChange={(event) =>
                                            setCreneauForm({
                                                ...creneauForm,
                                                libelle: event.target.value,
                                            })
                                        }
                                        maxLength={100}
                                        placeholder="Cours ou Récréation / Pause"
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Type
                                    <select
                                        required
                                        value={creneauForm.type}
                                        onChange={(event) =>
                                            setCreneauForm({
                                                ...creneauForm,
                                                type: event.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="cours">Cours</option>
                                        <option value="pause">
                                            Pause / récréation
                                        </option>
                                    </select>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Début
                                        <input
                                            required
                                            type="time"
                                            value={creneauForm.heure_debut}
                                            onChange={(event) =>
                                                setCreneauForm({
                                                    ...creneauForm,
                                                    heure_debut:
                                                        event.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </label>
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Fin
                                        <input
                                            required
                                            type="time"
                                            value={creneauForm.heure_fin}
                                            onChange={(event) =>
                                                setCreneauForm({
                                                    ...creneauForm,
                                                    heure_fin:
                                                        event.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </label>
                                </div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Ordre d’affichage
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={creneauForm.ordre}
                                        onChange={(event) =>
                                            setCreneauForm({
                                                ...creneauForm,
                                                ordre: event.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                    />
                                </label>
                                {erreur && (
                                    <p
                                        role="alert"
                                        className="text-sm font-medium text-red-700"
                                    >
                                        {erreur}
                                    </p>
                                )}
                                <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCreneauModal(false)}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
