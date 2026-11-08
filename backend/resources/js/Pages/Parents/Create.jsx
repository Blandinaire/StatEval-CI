import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Create({
    etablissements,
    etablissementId,
    isSuperAdmin,
    eleves,
}) {
    const [rechercheEleve, setRechercheEleve] = useState("");

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        telephone: "",
        email: "",
        etablissement_id: etablissementId || "",
        eleves: [],
    });

    const elevesFiltres = useMemo(() => {
        const terme = rechercheEleve.trim().toLowerCase();

        if (!terme) return eleves;

        return eleves.filter((eleve) => {
            const texte = [
                eleve.matricule,
                eleve.code_eleve,
                eleve.nom,
                eleve.prenoms,
                eleve.classe?.libelle,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return texte.includes(terme);
        });
    }, [eleves, rechercheEleve]);

    const estSelectionne = (eleveId) =>
        data.eleves.some((item) => Number(item.id) === Number(eleveId));

    const changerSelection = (eleve, coche) => {
        if (coche) {
            setData("eleves", [
                ...data.eleves,
                {
                    id: eleve.id,
                    lien: "Responsable légal",
                },
            ]);
        } else {
            setData(
                "eleves",
                data.eleves.filter(
                    (item) => Number(item.id) !== Number(eleve.id),
                ),
            );
        }
    };

    const modifierLien = (eleveId, lien) => {
        setData(
            "eleves",
            data.eleves.map((item) =>
                Number(item.id) === Number(eleveId)
                    ? { ...item, lien }
                    : item,
            ),
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("parents.store"));
    };

    const changerEtablissement = (id) => {
        router.get(
            route("parents.create"),
            { etablissement_id: id },
            { preserveState: false, preserveScroll: true },
        );
    };

    return (
        <AdminLayout>
            <Head title="Créer un compte parent" />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Créer un compte parent
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Créer un accès individuel et l'associer à un ou
                            plusieurs élèves.
                        </p>
                    </div>

                    <Link
                        href={route("parents.index")}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Retour à la liste
                    </Link>
                </div>

                {isSuperAdmin && (
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Établissement de rattachement *
                        </label>

                        <select
                            value={etablissementId || ""}
                            onChange={(e) =>
                                changerEtablissement(e.target.value)
                            }
                            className="w-full max-w-xl rounded-lg border-gray-300"
                        >
                            <option value="">
                                Sélectionner un établissement
                            </option>

                            {etablissements.map((etablissement) => (
                                <option
                                    key={etablissement.id}
                                    value={etablissement.id}
                                >
                                    {etablissement.nom}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {!isSuperAdmin || etablissementId ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-5 font-bold text-gray-800">
                                Informations du parent
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Nom et prénoms *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Téléphone *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.telephone}
                                        onChange={(e) =>
                                            setData("telephone", e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300"
                                        required
                                    />
                                    {errors.telephone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.telephone}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Adresse e-mail
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-bold text-gray-800">
                                        Associer les élèves
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Sélectionnez un ou plusieurs élèves de
                                        l'établissement.
                                    </p>
                                </div>

                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                                    {data.eleves.length} sélectionné(s)
                                </span>
                            </div>

                            <div className="mt-4">
                                <input
                                    type="search"
                                    value={rechercheEleve}
                                    onChange={(e) =>
                                        setRechercheEleve(e.target.value)
                                    }
                                    placeholder="Rechercher par matricule, nom, prénoms ou classe..."
                                    className="w-full rounded-lg border-gray-300"
                                />
                            </div>

                            {errors.eleves && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.eleves}
                                </p>
                            )}

                            <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border">
                                {elevesFiltres.length === 0 ? (
                                    <p className="p-6 text-center text-sm text-gray-500">
                                        Aucun élève correspondant.
                                    </p>
                                ) : (
                                    elevesFiltres.map((eleve) => (
                                        <label
                                            key={eleve.id}
                                            className="flex cursor-pointer items-center gap-3 border-b p-3 last:border-b-0 hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={estSelectionne(eleve.id)}
                                                onChange={(e) =>
                                                    changerSelection(
                                                        eleve,
                                                        e.target.checked,
                                                    )
                                                }
                                                className="rounded border-gray-300 text-blue-600"
                                            />

                                            <span className="min-w-0 flex-1">
                                                <span className="block font-semibold text-gray-800">
                                                    {eleve.nom} {eleve.prenoms}
                                                </span>
                                                <span className="block text-xs text-gray-500">
                                                    {eleve.matricule ||
                                                        eleve.code_eleve ||
                                                        "Sans matricule"}
                                                    {" — "}
                                                    {eleve.classe?.libelle ||
                                                        "Sans classe"}
                                                </span>
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>

                            {data.eleves.length > 0 && (
                                <div className="mt-5 space-y-3">
                                    <h3 className="font-semibold text-gray-800">
                                        Lien avec chaque élève
                                    </h3>

                                    {data.eleves.map((association) => {
                                        const eleve = eleves.find(
                                            (item) =>
                                                Number(item.id) ===
                                                Number(association.id),
                                        );

                                        return (
                                            <div
                                                key={association.id}
                                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
                                            >
                                                <span className="text-sm font-medium text-gray-700">
                                                    {eleve
                                                        ? `${eleve.nom} ${eleve.prenoms}`
                                                        : `Élève #${association.id}`}
                                                </span>

                                                <select
                                                    value={association.lien}
                                                    onChange={(e) =>
                                                        modifierLien(
                                                            association.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="rounded-lg border-gray-300 text-sm"
                                                >
                                                    <option value="Père">Père</option>
                                                    <option value="Mère">Mère</option>
                                                    <option value="Tuteur">Tuteur</option>
                                                    <option value="Responsable légal">
                                                        Responsable légal
                                                    </option>
                                                    <option value="Autre">Autre</option>
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-3">
                            <Link
                                href={route("parents.index")}
                                className="rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.name.trim() ||
                                    !data.telephone.trim() ||
                                    data.eleves.length === 0
                                }
                                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? "Création en cours..."
                                    : "Créer le compte parent"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                        Sélectionnez un établissement pour afficher ses élèves.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
