import React, { useEffect, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

const configurationParDefaut = {
    format: "a4",
    afficher_appreciations: true,
    afficher_professeurs: true,
    afficher_rang: true,
    afficher_absences_retards: true,
    afficher_conduite: true,
    afficher_observations: true,
    afficher_directeur: true,
    afficher_signatures: true,
};

export default function Index({
    etablissements = [],
    etablissementSelectionne,
    isSuperAdmin = false,
    classes = [],
    classeSelectionnee,
    periodes = [],
    periodeSelectionnee,
    eleves = [],
    eleveSelectionne,
    bulletin = null,
    bulletins = [],
    modeClasse = false,
    configuration = null,
}) {
    const config = {
        ...configurationParDefaut,
        ...(configuration ?? {}),
    };

    const choisir = (nom, valeur) => {
        const params = {};

        if (etablissementSelectionne) {
            params.etablissement_id = etablissementSelectionne;
        }

        if (classeSelectionnee) {
            params.classe_id = classeSelectionnee;
        }

        if (periodeSelectionnee) {
            params.periode_id = periodeSelectionnee;
        }

        if (modeClasse) {
            params.toute_classe = 1;
        } else if (eleveSelectionne) {
            params.eleve_id = eleveSelectionne;
        }

        if (nom === "etablissement_id") {
            if (valeur) params.etablissement_id = valeur;
            else delete params.etablissement_id;

            delete params.classe_id;
            delete params.periode_id;
            delete params.eleve_id;
        } else if (nom === "classe_id") {
            if (valeur) params.classe_id = valeur;
            else delete params.classe_id;

            delete params.periode_id;
            delete params.eleve_id;
        } else if (nom === "periode_id") {
            if (valeur) params.periode_id = valeur;
            else delete params.periode_id;

            delete params.eleve_id;
        } else if (nom === "eleve_id") {
            delete params.toute_classe;

            if (valeur === "tous") {
                delete params.eleve_id;
                params.toute_classe = 1;
            } else if (valeur) {
                params.eleve_id = valeur;
            } else {
                delete params.eleve_id;
            }
        }

        router.get(route("bulletins.index"), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const afficherNote = (valeur) =>
        valeur === null || valeur === undefined || valeur === ""
            ? "—"
            : `${Number(valeur).toFixed(2)} / 20`;

    const bulletinsAffiches = bulletins.length
        ? bulletins
        : bulletin
          ? [bulletin]
          : [];

    const detailsBulletins = new Map(
        bulletinsAffiches.map((item) => {
            const lignesBulletin = [];
            const indexGroupes = new Map();

            item.matieres.forEach((matiere) => {
                if (!matiere.groupe) {
                    lignesBulletin.push({ type: "matiere", matiere });
                    return;
                }

                let groupe = indexGroupes.get(matiere.groupe);

                if (!groupe) {
                    groupe = {
                        type: "groupe",
                        libelle: matiere.groupe,
                        matieres: [],
                    };
                    indexGroupes.set(matiere.groupe, groupe);
                    lignesBulletin.push(groupe);
                }

                groupe.matieres.push(matiere);
            });

            lignesBulletin.forEach((ligne) => {
                if (ligne.type !== "groupe") {
                    return;
                }

                const comptabilisees = ligne.matieres.filter(
                    (matiere) =>
                        matiere.active &&
                        matiere.prise_en_compte_moyenne &&
                        matiere.moyenne !== null,
                );
                ligne.coefficient = comptabilisees.reduce(
                    (total, matiere) =>
                        total + Number(matiere.coefficient || 0),
                    0,
                );
                ligne.total = comptabilisees.reduce(
                    (total, matiere) =>
                        total + Number(matiere.moyenne_ponderee || 0),
                    0,
                );
                ligne.moyenne =
                    ligne.coefficient > 0
                        ? ligne.total / ligne.coefficient
                        : null;
            });

            const moyenne = item.moyenne_generale;
            const mentionMoyenne =
                moyenne === null || moyenne === undefined
                    ? "Non évalué"
                    : moyenne >= 16
                      ? "Très bien"
                      : moyenne >= 14
                        ? "Bien"
                        : moyenne >= 12
                          ? "Assez bien"
                          : moyenne >= 10
                            ? "Passable"
                            : "Insuffisant";

            return [
                String(item.eleve.id),
                { lignesBulletin, mentionMoyenne },
            ];
        }),
    );

    const afficherRang = (rang) =>
        rang
            ? `${rang}${rang === 1 ? "er" : "e"}`
            : "—";

    const photoUrl = (chemin) =>
        !chemin
            ? null
            : chemin.startsWith("http")
              ? chemin
              : `/storage/${chemin.replace(/^\/+/, "")}`;

    const [zoomManuel, setZoomManuel] = useState(null);
    const [largeurApercu, setLargeurApercu] = useState(0);
    const apercuRef = useRef(null);

    useEffect(() => {
        const element = apercuRef.current;

        if (!element) {
            return undefined;
        }

        const mesurer = () => setLargeurApercu(element.clientWidth);

        mesurer();

        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(mesurer);
            observer.observe(element);

            return () => observer.disconnect();
        }

        window.addEventListener("resize", mesurer);
        return () => window.removeEventListener("resize", mesurer);
    }, [bulletinsAffiches.length]);

    const largeurPagePx = (210 / 25.4) * 96;
    const zoomAdapte = largeurApercu
        ? Math.min(1, Math.max(0.35, (largeurApercu - 32) / largeurPagePx))
        : 1;
    const zoomAffiche = zoomManuel ?? zoomAdapte;

    function changerZoom(delta) {
        setZoomManuel(
            Math.min(1.5, Math.max(0.35, (zoomManuel ?? zoomAdapte) + delta)),
        );
    }

    const imprimer = () => window.print();

    return (
        <>
            <Head title="Bulletins scolaires" />

            <AdminLayout>
                <div className="space-y-6 p-4 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Bulletins scolaires
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Préparation et impression des bulletins
                                scolaires.
                            </p>
                        </div>

                        {bulletinsAffiches.length > 0 && (
                            <button
                                type="button"
                                onClick={imprimer}
                                className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
                            >
                                Imprimer{" "}
                                {modeClasse ? "les bulletins" : "le bulletin"}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-4 md:grid-cols-2 lg:grid-cols-4 print:hidden">
                        {isSuperAdmin && (
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Établissement
                                </label>
                                <select
                                    className="w-full rounded-lg border-slate-300"
                                    value={etablissementSelectionne ?? ""}
                                    onChange={(e) =>
                                        choisir(
                                            "etablissement_id",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Tous les établissements
                                    </option>
                                    {etablissements.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Classe
                            </label>
                            <select
                                className="w-full rounded-lg border-slate-300"
                                value={classeSelectionnee ?? ""}
                                onChange={(e) =>
                                    choisir("classe_id", e.target.value)
                                }
                            >
                                <option value="">
                                    Sélectionner une classe
                                </option>
                                {classes.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Période
                            </label>
                            <select
                                className="w-full rounded-lg border-slate-300"
                                value={periodeSelectionnee ?? ""}
                                onChange={(e) =>
                                    choisir("periode_id", e.target.value)
                                }
                                disabled={!classeSelectionnee}
                            >
                                <option value="">
                                    Sélectionner une période
                                </option>

                                {periodes.map((periode) => (
                                    <option key={periode.id} value={periode.id}>
                                        {periode.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Élève
                            </label>
                            <select
                                className="w-full rounded-lg border-slate-300"
                                value={modeClasse ? "tous" : eleveSelectionne ?? ""}
                                onChange={(e) =>
                                    choisir("eleve_id", e.target.value)
                                }
                                disabled={
                                    !classeSelectionnee || !periodeSelectionnee
                                }
                            >
                                <option value="">Sélectionner un élève</option>
                                <option value="tous">Toute la classe</option>
                                {eleves.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nom} {item.prenoms}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {bulletinsAffiches.length > 0 ? (
                        <>
                            <div className="flex items-center justify-end gap-2 print:hidden">
                                <span className="mr-2 text-sm text-slate-600">
                                    Zoom {Math.round(zoomAffiche * 100)} %
                                </span>
                                <button
                                    type="button"
                                    onClick={() => changerZoom(-0.1)}
                                    disabled={zoomAffiche <= 0.35}
                                    className="rounded border bg-white px-3 py-1.5 disabled:opacity-40"
                                    aria-label="Réduire le zoom"
                                >
                                    −
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changerZoom(0.1)}
                                    disabled={zoomAffiche >= 1.5}
                                    className="rounded border bg-white px-3 py-1.5 disabled:opacity-40"
                                    aria-label="Augmenter le zoom"
                                >
                                    +
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoomManuel(null)}
                                    className="rounded border bg-white px-3 py-1.5"
                                >
                                    Ajuster
                                </button>
                            </div>
                            <div className="bulletin-preview" ref={apercuRef}>
                                {bulletinsAffiches.map((bulletin) => {
                                    const details = detailsBulletins.get(
                                        String(bulletin.eleve.id),
                                    );
                                    const { lignesBulletin, mentionMoyenne } =
                                        details;

                                    return (
                                        <div
                                            key={bulletin.eleve.id}
                                            className="bulletin-scaled"
                                            style={{
                                                "--bulletin-zoom": zoomAffiche,
                                            }}
                                        >
                                            <div
                                                className="bulletin-print bulletin-document border border-slate-300 bg-white shadow-lg"
                                                style={{
                                                    transform: `scale(${zoomAffiche})`,
                                                }}
                                            >
                              <header className="bulletin-header border border-slate-800">
                                  <div className="grid grid-cols-3 items-center border-b border-slate-800 text-center text-[9px] font-semibold uppercase leading-tight">
                                      <div className="p-2">
                                          <p>
                                              Ministère de l’Éducation
                                              nationale
                                          </p>
                                          <p>
                                              {bulletin.etablissement
                                                  ?.direction_regionale ||
                                                  "Enseignement et formation"}
                                          </p>
                                      </div>
                                      <div className="border-x border-slate-800 p-2">
                                          <h2 className="text-sm font-bold">
                                              BULLETIN DE NOTES
                                          </h2>
                                          <p className="normal-case">
                                              {bulletin.periode}
                                          </p>
                                      </div>
                                      <div className="p-2">
                                          <p>République de Côte d’Ivoire</p>
                                          <p>Union - Discipline - Travail</p>
                                          <p className="mt-1">
                                              Année scolaire{" "}
                                              {bulletin.annee_scolaire || "—"}
                                          </p>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-800 p-2">
                                      {bulletin.etablissement?.logo ? (
                                          <img
                                              src={photoUrl(
                                                  bulletin.etablissement.logo,
                                              )}
                                              alt="Logo de l'établissement"
                                              className="h-14 w-14 object-contain"
                                          />
                                      ) : (
                                          <div className="h-14 w-14" />
                                      )}

                                      <div className="min-w-0 text-center text-[10px]">
                                          <h3 className="text-xs font-bold uppercase">
                                              {bulletin.etablissement?.nom ||
                                                  "Établissement scolaire"}
                                          </h3>
                                          {bulletin.etablissement?.sigle && (
                                              <p className="font-semibold">
                                                  {bulletin.etablissement.sigle}
                                              </p>
                                          )}
                                          <p>
                                              {[
                                                  bulletin.etablissement
                                                      ?.adresse,
                                                  bulletin.etablissement
                                                      ?.ville,
                                              ]
                                                  .filter(Boolean)
                                                  .join(", ") || "Adresse"}
                                          </p>
                                          <p>
                                              {bulletin.etablissement
                                                  ?.telephone &&
                                                  `Tél. : ${bulletin.etablissement.telephone}`}
                                              {bulletin.etablissement?.email &&
                                                  `  •  ${bulletin.etablissement.email}`}
                                          </p>
                                      </div>

                                      <div className="min-w-32 border-l border-slate-800 pl-3 text-[9px]">
                                          <p>
                                              Code :{" "}
                                              {bulletin.etablissement?.code ||
                                                  "—"}
                                          </p>
                                          <p>
                                              Statut :{" "}
                                              {bulletin.etablissement?.type ||
                                                  "—"}
                                          </p>
                                      </div>
                                  </div>
                              </header>

                              <section className="grid grid-cols-[1fr_auto] gap-3 border-x border-b border-slate-800 p-2 text-[10px]">
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                      <p className="col-span-2 text-sm font-bold uppercase">
                                          {bulletin.eleve.nom}{" "}
                                          {bulletin.eleve.prenoms}
                                      </p>
                                      <p>
                                          <strong>Matricule :</strong>{" "}
                                          {bulletin.eleve.matricule || "—"}
                                      </p>
                                      <p>
                                          <strong>Sexe :</strong>{" "}
                                          {bulletin.eleve.sexe || "—"}
                                      </p>
                                      <p>
                                          <strong>Classe :</strong>{" "}
                                          {bulletin.classe}
                                      </p>
                                      <p>
                                          <strong>Né(e) le :</strong>{" "}
                                          {bulletin.eleve.date_naissance
                                              ? new Date(
                                                    `${bulletin.eleve.date_naissance}T00:00:00`,
                                                ).toLocaleDateString("fr-FR")
                                              : "—"}
                                      </p>
                                      <p>
                                          <strong>Lieu de naissance :</strong>{" "}
                                          {bulletin.eleve.lieu_naissance ||
                                              "—"}
                                      </p>
                                      <p>
                                          <strong>Nationalité :</strong>{" "}
                                          {bulletin.eleve.nationalite || "—"}
                                      </p>
                                      <p>
                                          <strong>Redoublant :</strong>{" "}
                                          {bulletin.eleve.redoublant
                                              ? "Oui"
                                              : "Non"}
                                      </p>
                                      <p>
                                          <strong>Régime :</strong>{" "}
                                          {bulletin.eleve.regime || "—"}
                                      </p>
                                      {config.afficher_rang && (
                                          <p>
                                              <strong>Rang :</strong>{" "}
                                              {bulletin.rang
                                                  ? `${afficherRang(bulletin.rang)} / ${bulletin.effectif_classe}`
                                                  : "Non classé"}
                                          </p>
                                      )}
                                  </div>

                                  {bulletin.eleve.photo ? (
                                      <img
                                          src={photoUrl(bulletin.eleve.photo)}
                                          alt={`Photo de ${bulletin.eleve.prenoms} ${bulletin.eleve.nom}`}
                                          className="h-24 w-20 border border-slate-400 object-cover"
                                      />
                                  ) : (
                                      <div className="flex h-24 w-20 items-center justify-center border border-dashed border-slate-400 text-center text-[8px] text-slate-500">
                                          Photo de l’élève
                                      </div>
                                  )}
                              </section>

                            <table className="bulletin-table mt-2 w-full border-collapse text-[9px]">
                                <thead>
                                    <tr className="bg-slate-200 uppercase">
                                        <th className="border border-slate-500 p-1 text-left">
                                            Disciplines
                                        </th>
                                        <th className="border border-slate-500 p-1 text-center">
                                            Moy. / 20
                                        </th>
                                        <th className="border border-slate-500 p-1 text-center">
                                            Coef.
                                        </th>
                                        <th className="border border-slate-500 p-1 text-center">
                                            Moy. coef.
                                        </th>
                                        {config.afficher_rang && (
                                            <th className="border border-slate-500 p-1 text-center">
                                                Rang
                                            </th>
                                        )}
                                        {config.afficher_appreciations && (
                                            <th className="border border-slate-500 p-1 text-left">
                                                Appréciation
                                            </th>
                                        )}
                                        {config.afficher_professeurs && (
                                            <th className="border border-slate-500 p-1 text-left">
                                                Professeur
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lignesBulletin.map((ligne) =>
                                        ligne.type === "groupe" ? (
                                            <React.Fragment
                                                key={`groupe-${ligne.libelle}`}
                                            >
                                                <tr className="bg-slate-300 font-bold uppercase">
                                                    <td className="border border-slate-500 p-1">
                                                        Bilan {ligne.libelle}
                                                    </td>
                                                    <td className="border border-slate-500 p-1 text-center">
                                                        {afficherNote(
                                                            ligne.moyenne,
                                                        )}
                                                    </td>
                                                    <td className="border border-slate-500 p-1 text-center">
                                                        {ligne.coefficient || "—"}
                                                    </td>
                                                    <td className="border border-slate-500 p-1 text-center">
                                                        {ligne.coefficient
                                                            ? Number(
                                                                  ligne.total,
                                                              ).toFixed(2)
                                                            : "—"}
                                                    </td>
                                                    {config.afficher_rang && (
                                                        <td className="border border-slate-500 p-1" />
                                                    )}
                                                    {config.afficher_appreciations && (
                                                        <td className="border border-slate-500 p-1" />
                                                    )}
                                                    {config.afficher_professeurs && (
                                                        <td className="border border-slate-500 p-1" />
                                                    )}
                                                </tr>
                                                {ligne.matieres.map(
                                                    (matiere) => (
                                                        <tr
                                                            key={
                                                                matiere.matiere_id
                                                            }
                                                        >
                                                            <td className="border border-slate-500 p-1 pl-3">
                                                                {matiere.matiere}
                                                            </td>
                                                            <td className="border border-slate-500 p-1 text-center">
                                                                {afficherNote(
                                                                    matiere.moyenne,
                                                                )}
                                                            </td>
                                                            <td className="border border-slate-500 p-1 text-center">
                                                                {matiere.coefficient}
                                                            </td>
                                                            <td className="border border-slate-500 p-1 text-center">
                                                                {matiere.moyenne_ponderee ===
                                                                null
                                                                    ? "—"
                                                                    : Number(
                                                                          matiere.moyenne_ponderee,
                                                                      ).toFixed(
                                                                          2,
                                                                      )}
                                                            </td>
                                                            {config.afficher_rang && (
                                                                <td className="border border-slate-500 p-1 text-center">
                                                                    {afficherRang(
                                                                        matiere.rang,
                                                                    )}
                                                                </td>
                                                            )}
                                                            {config.afficher_appreciations && (
                                                                <td className="border border-slate-500 p-1">
                                                                    {matiere.appreciation ||
                                                                        "—"}
                                                                </td>
                                                            )}
                                                            {config.afficher_professeurs && (
                                                                <td className="border border-slate-500 p-1">
                                                                    {matiere.professeur ||
                                                                        "—"}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                            </React.Fragment>
                                        ) : (
                                            <tr
                                                key={
                                                    ligne.matiere.matiere_id
                                                }
                                            >
                                                <td className="border border-slate-500 p-1">
                                                    {ligne.matiere.matiere}
                                                </td>
                                                <td className="border border-slate-500 p-1 text-center">
                                                    {afficherNote(
                                                        ligne.matiere.moyenne,
                                                    )}
                                                </td>
                                                <td className="border border-slate-500 p-1 text-center">
                                                    {ligne.matiere.coefficient}
                                                </td>
                                                <td className="border border-slate-500 p-1 text-center">
                                                    {ligne.matiere.moyenne_ponderee ===
                                                    null
                                                        ? "—"
                                                        : Number(
                                                              ligne.matiere
                                                                  .moyenne_ponderee,
                                                          ).toFixed(2)}
                                                </td>
                                                {config.afficher_rang && (
                                                    <td className="border border-slate-500 p-1 text-center">
                                                        {afficherRang(
                                                            ligne.matiere.rang,
                                                        )}
                                                    </td>
                                                )}
                                                {config.afficher_appreciations && (
                                                    <td className="border border-slate-500 p-1">
                                                        {ligne.matiere
                                                            .appreciation ||
                                                            "—"}
                                                    </td>
                                                )}
                                                {config.afficher_professeurs && (
                                                    <td className="border border-slate-500 p-1">
                                                        {ligne.matiere
                                                            .professeur ||
                                                            "—"}
                                                    </td>
                                                )}
                                            </tr>
                                        ),
                                    )}
                                    {config.afficher_conduite && (
                                        <tr>
                                            <td className="border border-slate-500 p-1 font-semibold">
                                                Conduite (hors moyenne)
                                            </td>
                                            <td className="border border-slate-500 p-1 text-center">
                                                {afficherNote(
                                                    bulletin.conduite,
                                                )}
                                            </td>
                                            <td className="border border-slate-500 p-1 text-center">
                                                —
                                            </td>
                                            <td className="border border-slate-500 p-1 text-center">
                                                —
                                            </td>
                                            {config.afficher_rang && (
                                                <td className="border border-slate-500 p-1" />
                                            )}
                                            {config.afficher_appreciations && (
                                                <td className="border border-slate-500 p-1">
                                                    {bulletin.observation_conduite ||
                                                        "—"}
                                                </td>
                                            )}
                                            {config.afficher_professeurs && (
                                                <td className="border border-slate-500 p-1">
                                                    —
                                                </td>
                                            )}
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-300 font-bold uppercase">
                                        <td className="border border-slate-500 p-1 text-right">
                                            Totaux
                                        </td>
                                        <td className="border border-slate-500 p-1" />
                                        <td className="border border-slate-500 p-1 text-center">
                                            {Number(
                                                bulletin.total_coefficients ||
                                                    0,
                                            ).toFixed(2)}
                                        </td>
                                        <td className="border border-slate-500 p-1 text-center">
                                            {Number(
                                                bulletin.total_points || 0,
                                            ).toFixed(2)}
                                        </td>
                                        {config.afficher_rang && (
                                            <td className="border border-slate-500 p-1" />
                                        )}
                                        {config.afficher_appreciations && (
                                            <td className="border border-slate-500 p-1" />
                                        )}
                                        {config.afficher_professeurs && (
                                            <td className="border border-slate-500 p-1" />
                                        )}
                                    </tr>
                                </tfoot>
                            </table>

                            <section className="bulletin-resultats mt-2 grid grid-cols-3 border border-slate-800 text-[9px]">
                                <div className="border-r border-slate-800 p-2">
                                    <h3 className="mb-1 text-center font-bold uppercase">
                                        Assiduité
                                    </h3>
                                    {config.afficher_absences_retards ? (
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                            <p>Total d’heures d’absence</p>
                                            <p className="text-right font-bold">
                                                {Number(
                                                    bulletin.absences?.heures ??
                                                        0,
                                                ).toFixed(2)}
                                            </p>
                                            <p>Absences justifiées</p>
                                            <p className="text-right font-bold">
                                                {bulletin.absences
                                                    ?.justifiees ?? 0}
                                            </p>
                                            <p>Absences non justifiées</p>
                                            <p className="text-right font-bold">
                                                {bulletin.absences
                                                    ?.non_justifiees ?? 0}
                                            </p>
                                            <p>Retards</p>
                                            <p className="text-right font-bold">
                                                {bulletin.retards?.nombre ?? 0}{" "}
                                                ({bulletin.retards?.minutes ??
                                                    0}{" "}
                                                min)
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-center">—</p>
                                    )}
                                    <p className="mt-1 text-center text-[8px]">
                                        Cumul de l’année scolaire
                                    </p>
                                </div>

                                <div className="flex flex-col items-center justify-center border-r border-slate-800 p-2 text-center">
                                    <p className="font-bold">
                                        Moyenne trimestrielle
                                    </p>
                                    <p className="mt-1 text-lg font-bold">
                                        {afficherNote(
                                            bulletin.moyenne_generale,
                                        )}
                                    </p>
                                    {config.afficher_rang && (
                                        <p>
                                            Rang :{" "}
                                            {bulletin.rang
                                                ? `${afficherRang(bulletin.rang)} sur ${bulletin.effectif_classe}`
                                                : "Non classé"}
                                        </p>
                                    )}
                                    <p className="font-semibold">
                                        {mentionMoyenne}
                                    </p>
                                </div>

                                <div className="p-2">
                                    <h3 className="mb-1 text-center font-bold uppercase">
                                        Résultats de la classe
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                        <p>Effectif</p>
                                        <p className="text-right font-bold">
                                            {bulletin.effectif_classe}
                                        </p>
                                        <p>Moyenne de la classe</p>
                                        <p className="text-right font-bold">
                                            {afficherNote(
                                                bulletin.moyenne_classe,
                                            )}
                                        </p>
                                        <p>Moyenne la plus basse</p>
                                        <p className="text-right font-bold">
                                            {afficherNote(
                                                bulletin.moyenne_minimale,
                                            )}
                                        </p>
                                        <p>Moyenne la plus élevée</p>
                                        <p className="text-right font-bold">
                                            {afficherNote(
                                                bulletin.moyenne_maximale,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="bulletin-decisions mt-2 grid grid-cols-3 border border-slate-800 text-[9px]">
                                <div className="border-r border-slate-800 p-2">
                                    <h3 className="mb-1 text-center font-bold uppercase">
                                        Décisions du conseil de classe
                                    </h3>
                                    <p className="font-semibold">
                                        Distinctions
                                    </p>
                                    <p className="min-h-5 border-b border-dotted border-slate-500" />
                                    <p className="mt-1 font-semibold">
                                        Sanctions
                                    </p>
                                    <p className="min-h-5 border-b border-dotted border-slate-500" />
                                </div>

                                <div className="border-r border-slate-800 p-2">
                                    <h3 className="mb-1 text-center font-bold uppercase">
                                        Appréciation générale
                                    </h3>
                                    <p className="min-h-16 whitespace-pre-wrap">
                                        {config.afficher_observations
                                            ? bulletin.observation_conduite ||
                                              ""
                                            : ""}
                                    </p>
                                    {config.afficher_signatures && (
                                        <p className="mt-2 border-t border-slate-500 pt-1 text-center">
                                            {bulletin.professeur_principal ||
                                                "Professeur principal non désigné"}
                                            <br />
                                            Signature du professeur principal
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col p-2 text-center">
                                    <p>
                                        Fait à{" "}
                                        {bulletin.etablissement?.ville ||
                                            "________________"}
                                        , le{" "}
                                        {new Date().toLocaleDateString("fr-FR")}
                                    </p>
                                    {config.afficher_directeur && (
                                        <p className="mt-2 font-bold uppercase">
                                            {bulletin.etablissement
                                                ?.directeur
                                                ? `Le directeur : ${bulletin.etablissement.directeur}`
                                                : "Le directeur"}
                                        </p>
                                    )}
                                    {config.afficher_signatures && (
                                        <div className="mt-auto min-h-16 pt-8 font-bold uppercase">
                                            Signature et cachet
                                        </div>
                                    )}
                                </div>
                            </section>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-500 print:hidden">
                            Sélectionne une classe, une période et un élève pour
                            afficher un bulletin ou ceux de toute la classe.
                        </div>
                    )}
                </div>
            </AdminLayout>

            <style>{`
                .bulletin-preview {
                    overflow-x: auto;
                    padding: 1rem 0;
                }

                .bulletin-scaled {
                    width: calc(210mm * var(--bulletin-zoom));
                    min-height: calc(297mm * var(--bulletin-zoom));
                    margin: 0 auto 1rem;
                }

                .bulletin-document {
                    box-sizing: border-box;
                    width: 210mm;
                    min-height: 297mm;
                    transform-origin: top center;
                    padding: 7mm;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }

                    body {
                        background: white !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .bulletin-print,
                    .bulletin-print * {
                        visibility: visible;
                    }

                    .bulletin-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        overflow: visible;
                        padding: 0;
                    }

                    .bulletin-scaled {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0;
                        page-break-after: always;
                        break-after: page;
                    }

                    .bulletin-scaled:last-child {
                        page-break-after: auto;
                        break-after: auto;
                    }

                    .bulletin-document {
                        position: relative;
                        left: 0;
                        top: 0;
                        transform: none !important;
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0;
                        padding: 7mm !important;
                        border: none !important;
                        box-shadow: none !important;
                    }

                    .bulletin-print {
                        color: black !important;
                        font-size: 8pt !important;
                        line-height: 1.15 !important;
                    }

                    .bulletin-header,
                    .bulletin-resultats,
                    .bulletin-decisions {
                        break-inside: avoid;
                    }

                    .bulletin-table {
                        table-layout: fixed;
                        font-size: 7pt !important;
                    }

                    .bulletin-table th,
                    .bulletin-table td {
                        padding: 2px 3px !important;
                        overflow-wrap: anywhere;
                    }

                    .bulletin-table tr {
                        break-inside: avoid;
                    }

                    .bulletin-document img {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </>
    );
}
