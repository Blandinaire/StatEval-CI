import { useEffect, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({
    personnel,
    fonctions = [],
    etablissements = [],
    etablissementId = null,
    isSuperAdmin = false,
    comptesDisponibles = [],
}) {
    const [comptes, setComptes] = useState(comptesDisponibles);

    const { data, setData, put, processing, errors } = useForm({
        etablissement_id: personnel.etablissement_id ?? etablissementId ?? "",
        fonction_personnel_id: personnel.fonction_personnel_id ?? "",
        user_id: personnel.user_id ?? "",
        matricule: personnel.matricule ?? "",
        nom: personnel.nom ?? "",
        prenoms: personnel.prenoms ?? "",
        sexe: personnel.sexe ?? "",
        date_naissance: personnel.date_naissance
            ? String(personnel.date_naissance).slice(0, 10)
            : "",
        lieu_naissance: personnel.lieu_naissance ?? "",
        nationalite: personnel.nationalite ?? "Ivoirienne",
        telephone: personnel.telephone ?? "",
        email: personnel.email ?? "",
        adresse: personnel.adresse ?? "",
        type: personnel.type ?? "Contractuel",
        grade: personnel.grade ?? "",
        date_embauche: personnel.date_embauche
            ? String(personnel.date_embauche).slice(0, 10)
            : "",
        date_prise_service: personnel.date_prise_service
            ? String(personnel.date_prise_service).slice(0, 10)
            : "",
        statut: personnel.statut ?? "Actif",
        actif: personnel.actif ?? true,
        observations: personnel.observations ?? "",
    });

    useEffect(() => {
        if (!isSuperAdmin) {
            setComptes(comptesDisponibles);
            return;
        }

        if (!data.etablissement_id) {
            setComptes([]);
            return;
        }

        const controller = new AbortController();

        fetch(
            route(
                "autres-personnels.comptes-disponibles",
                data.etablissement_id,
            ),
            {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                signal: controller.signal,
            },
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Impossible de charger les comptes.");
                }

                return response.json();
            })
            .then((result) => {
                setComptes(result);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setComptes([]);
                    console.error(error);
                }
            });

        return () => controller.abort();
    }, [data.etablissement_id, isSuperAdmin, personnel.id]);

    const submit = (e) => {
        e.preventDefault();

        put(route("autres-personnels.update", personnel.id));
    };

    const champ = (nom, label, type = "text", obligatoire = false) => (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {obligatoire && <span className="text-red-600"> *</span>}
            </label>

            <input
                type={type}
                name={nom}
                value={data[nom] ?? ""}
                onChange={(e) => setData(nom, e.target.value)}
                required={obligatoire}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />

            {errors[nom] && (
                <p className="mt-1 text-sm text-red-600">{errors[nom]}</p>
            )}
        </div>
    );

    return (
        <AdminLayout>
            <Head title={`Modifier ${personnel.nom} ${personnel.prenoms}`} />

            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Modifier le personnel
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Modification de la fiche de {personnel.nom}{" "}
                        {personnel.prenoms}.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl bg-white p-6 shadow"
                >
                    {isSuperAdmin && (
                        <section className="space-y-4">
                            <h2 className="border-b pb-2 text-lg font-semibold">
                                Établissement
                            </h2>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Établissement *
                                </label>

                                <select
                                    value={data.etablissement_id}
                                    onChange={(e) => {
                                        setData(
                                            "etablissement_id",
                                            e.target.value,
                                        );
                                        setData("user_id", "");
                                    }}
                                    required
                                    className="w-full rounded-lg border-gray-300"
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

                                {errors.etablissement_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.etablissement_id}
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    <section className="space-y-4">
                        <h2 className="border-b pb-2 text-lg font-semibold">
                            Informations professionnelles
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Fonction *
                                </label>

                                <select
                                    value={data.fonction_personnel_id}
                                    onChange={(e) =>
                                        setData(
                                            "fonction_personnel_id",
                                            e.target.value,
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="">
                                        Sélectionner une fonction
                                    </option>

                                    {fonctions.map((fonction) => (
                                        <option
                                            key={fonction.id}
                                            value={fonction.id}
                                        >
                                            {fonction.libelle}
                                        </option>
                                    ))}
                                </select>

                                {errors.fonction_personnel_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.fonction_personnel_id}
                                    </p>
                                )}
                            </div>

                            {champ("matricule", "Matricule")}
                            {champ("date_embauche", "Date d'embauche", "date")}
                            {champ(
                                "date_prise_service",
                                "Date de prise de service",
                                "date",
                            )}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Type de personnel *
                                </label>

                                <select
                                    value={data.type}
                                    onChange={(e) =>
                                        setData("type", e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="Fonctionnaire">
                                        Fonctionnaire
                                    </option>
                                    <option value="Contractuel">
                                        Contractuel
                                    </option>
                                    <option value="Prestataire">
                                        Prestataire
                                    </option>
                                    <option value="Autre">Autre</option>
                                </select>

                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            {champ("grade", "Grade ou qualification")}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Statut *
                                </label>

                                <select
                                    value={data.statut}
                                    onChange={(e) =>
                                        setData("statut", e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="Actif">Actif</option>
                                    <option value="Suspendu">Suspendu</option>
                                    <option value="En congé">En congé</option>
                                    <option value="Parti">Parti</option>
                                </select>

                                {errors.statut && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.statut}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="border-b pb-2 text-lg font-semibold">
                            Identité
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {champ("nom", "Nom", "text", true)}
                            {champ("prenoms", "Prénoms", "text", true)}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Sexe *
                                </label>

                                <select
                                    value={data.sexe}
                                    onChange={(e) =>
                                        setData("sexe", e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="Masculin">Masculin</option>
                                    <option value="Féminin">Féminin</option>
                                </select>

                                {errors.sexe && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.sexe}
                                    </p>
                                )}
                            </div>

                            {champ(
                                "date_naissance",
                                "Date de naissance",
                                "date",
                            )}
                            {champ("lieu_naissance", "Lieu de naissance")}
                            {champ("nationalite", "Nationalité")}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="border-b pb-2 text-lg font-semibold">
                            Coordonnées
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {champ("telephone", "Téléphone", "tel")}
                            {champ("email", "Adresse e-mail", "email")}

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">
                                    Adresse
                                </label>

                                <textarea
                                    value={data.adresse}
                                    onChange={(e) =>
                                        setData("adresse", e.target.value)
                                    }
                                    rows={2}
                                    className="w-full rounded-lg border-gray-300"
                                />

                                {errors.adresse && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.adresse}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="border-b pb-2 text-lg font-semibold">
                            Compte utilisateur associé (facultatif)
                        </h2>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Compte existant
                            </label>

                            <select
                                value={data.user_id}
                                onChange={(e) =>
                                    setData("user_id", e.target.value)
                                }
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Aucun compte associé</option>

                                {comptes.map((compte) => (
                                    <option key={compte.id} value={compte.id}>
                                        {compte.name} — {compte.email}
                                    </option>
                                ))}

                                {data.user_id &&
                                    !comptes.some(
                                        (compte) =>
                                            String(compte.id) ===
                                            String(data.user_id),
                                    ) && (
                                        <option value={data.user_id}>
                                            Compte actuellement associé
                                        </option>
                                    )}
                            </select>

                            <p className="mt-1 text-sm text-gray-500">
                                Sélectionnez un compte de cet établissement ou
                                choisissez « Aucun compte associé ».
                            </p>

                            {errors.user_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.user_id}
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="border-b pb-2 text-lg font-semibold">
                            Observations
                        </h2>

                        <textarea
                            value={data.observations}
                            onChange={(e) =>
                                setData("observations", e.target.value)
                            }
                            rows={3}
                            className="w-full rounded-lg border-gray-300"
                            placeholder="Informations complémentaires..."
                        />

                        {errors.observations && (
                            <p className="text-sm text-red-600">
                                {errors.observations}
                            </p>
                        )}
                    </section>

                    <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                        <Link
                            href={route("autres-personnels.index")}
                            className="rounded-lg border px-5 py-3 hover:bg-gray-50"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? "Enregistrement..."
                                : "Enregistrer les modifications"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
