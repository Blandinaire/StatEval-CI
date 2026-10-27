from pathlib import Path
import sys
root = Path.cwd()
cp = root/'backend/app/Http/Controllers/UserController.php'
fp = root/'backend/resources/js/Pages/Utilisateurs/Create.jsx'
if not cp.exists() or not fp.exists():
    sys.exit('Lance ce script depuis la racine du dépôt StatEval-CI (dossier contenant backend).')
c, f = cp.read_text(encoding='utf-8'), fp.read_text(encoding='utf-8')
def rep(s, old, new, label, n=1):
    count=s.count(old)
    if count != n: raise ValueError(f'{label}: attendu {n} occurrence(s), trouvé {count}. Aucun fichier modifié.')
    return s.replace(old,new)
# Controller
c=rep(c,'use App\\Models\\EtablissementResponsable;\nuse App\\Models\\User;','use App\\Models\\EtablissementResponsable;\nuse App\\Models\\AutrePersonnel;\nuse App\\Models\\User;','Import modèle')
c=rep(c,"                'Educateur',\n            ])->orderBy('name')->get(),","                'Educateur',\n                'AutrePersonnel',\n            ])->orderBy('name')->get(),",'Rôles liste utilisateurs')
c=rep(c,"                'Educateur',\n            ])\n                ->orderBy('name')","                'Educateur',\n                'AutrePersonnel',\n            ])\n                ->orderBy('name')",'Rôles formulaire création')
c=rep(c,"'in:Administrateur,Direction,Professeur,Educateur',","'in:Administrateur,Direction,Professeur,Educateur,AutrePersonnel',",'Validation rôle',2)
c=rep(c,"        } else {\n            $personnes = EtablissementResponsable::query()", "        } elseif ($role === 'AutrePersonnel') {\n            $personnes = AutrePersonnel::query()\n                ->where('etablissement_id', $etablissementId)\n                ->where('actif', true)\n                ->whereNull('user_id')\n                ->with('fonction:id,libelle')\n                ->orderBy('nom')\n                ->orderBy('prenoms')\n                ->get([\n                    'id', 'etablissement_id', 'matricule', 'nom', 'prenoms',\n                    'email', 'fonction_personnel_id',\n                ])\n                ->map(function ($personne) {\n                    $personne->fonction_libelle = $personne->fonction?->libelle;\n                    return $personne;\n                });\n        } else {\n            $personnes = EtablissementResponsable::query()",'Options AutrePersonnel')
c=rep(c,"            'etablissement_responsable_id' => [\n                'nullable',\n                'integer',\n                'exists:etablissement_responsables,id',\n            ],","            'etablissement_responsable_id' => [\n                'nullable',\n                'integer',\n                'exists:etablissement_responsables,id',\n            ],\n            'autre_personnel_id' => [\n                'nullable', 'integer', 'exists:autres_personnels,id',\n            ],",'Validation ID AutrePersonnel')
marker="        /*\n         * ---------------------------------------------------------\n         * ADMINISTRATEUR / DIRECTION\n         * ---------------------------------------------------------\n         */"
branch="""        /*
         * ---------------------------------------------------------
         * AUTRE PERSONNEL
         * ---------------------------------------------------------
         */
        if ($role === 'AutrePersonnel') {
            abort_unless(!empty($validated['autre_personnel_id']), 422,
                'Veuillez sélectionner un membre du personnel.');
            $personne = AutrePersonnel::query()
                ->where('id', $validated['autre_personnel_id'])
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)->whereNull('user_id')
                ->with('fonction')->firstOrFail();
            $name = trim($personne->nom . ' ' . $personne->prenoms);
            $email = $personne->email;
            abort_if(empty($email), 422,
                'Renseignez une adresse e-mail sur la fiche du personnel avant de créer son compte.');
            abort_if(User::where('email', $email)->exists(), 422,
                'Cette adresse e-mail est déjà utilisée par un compte.');
            $initialPassword = $this->generateInitialPassword();
            $user = User::create([
                'name' => $name, 'email' => $email,
                'password' => $initialPassword, 'initial_password' => $initialPassword,
                'fonction' => $personne->fonction?->libelle ?? 'Autre personnel',
                'etablissement_id' => $etablissementId,
                'enseignant_id' => null, 'educateur_id' => null,
                'etablissement_responsable_id' => null,
                'actif' => $validated['actif'] ?? true,
                'must_change_password' => true,
            ]);
            $user->syncRoles(['AutrePersonnel']);
            $personne->user()->associate($user);
            $personne->save();
            return redirect()->route('users.index')
                ->with('success', 'Compte autre personnel créé avec succès.')
                ->with('initial_password', $initialPassword)
                ->with('created_user', $name);
        }

"""
c=rep(c,marker,branch+marker,'Branche création AutrePersonnel')
# Frontend
f=rep(f,'        etablissement_responsable_id: "",\n        actif: true,','        etablissement_responsable_id: "",\n        autre_personnel_id: "",\n        actif: true,','Champ ID autre personnel')
f=rep(f,'    const isAdministrateur = data.role === "Administrateur";\n\n    const isResponsable = isDirection || isAdministrateur;','    const isAdministrateur = data.role === "Administrateur";\n    const isAutrePersonnel = data.role === "AutrePersonnel";\n\n    const isResponsable = isDirection || isAdministrateur;','Constante rôle')
f=rep(f,'          : isResponsable\n            ? "responsable"\n            : null;','          : isResponsable\n            ? "responsable"\n            : isAutrePersonnel\n              ? "autre_personnel"\n              : null;','Type de personnel')
# add role-specific reset before Direction
f=rep(f,'        if (data.role === "Direction") {\n            setData("fonction", "");','        if (data.role === "AutrePersonnel") {\n            setData("fonction", "");\n            setData("enseignant_id", "");\n            setData("educateur_id", "");\n            setData("etablissement_responsable_id", "");\n            setData("autre_personnel_id", "");\n            setData("name", "");\n            setData("email", "");\n            setData("etablissement_id", "");\n            return;\n        }\n\n        if (data.role === "Direction") {\n            setData("fonction", "");','Réinitialisation rôle')
f=rep(f,'        setData("etablissement_responsable_id", "");\n\n        const personne = personnes.find(','        setData("etablissement_responsable_id", "");\n        setData("autre_personnel_id", "");\n\n        const personne = personnes.find(','Réinitialisation sélection')
f=rep(f,'        if (personnelType === "responsable") {\n            setData("etablissement_responsable_id", personne.id);\n            setData("fonction", personne.fonction ?? "");\n        }','        if (personnelType === "responsable") {\n            setData("etablissement_responsable_id", personne.id);\n            setData("fonction", personne.fonction ?? "");\n        }\n\n        if (personnelType === "autre_personnel") {\n            setData("autre_personnel_id", personne.id);\n            setData("fonction", personne.fonction_libelle ?? "");\n        }','Sélection AutrePersonnel')
f=rep(f,'                                                "Educateur",\n                                            ].includes(role.name),','                                                "Educateur",\n                                                "AutrePersonnel",\n                                            ].includes(role.name),','Option rôle')
f=rep(f,'(isProfesseur || isEducateur || isResponsable) && (','(isProfesseur || isEducateur || isResponsable || isAutrePersonnel) && (','Affichage sélecteur')
f=rep(f,'                                    {isProfesseur\n                                        ? "Enseignant"\n                                        : isEducateur\n                                          ? "Éducateur"\n                                          : "Responsable"}','                                    {isProfesseur\n                                        ? "Enseignant"\n                                        : isEducateur\n                                          ? "Éducateur"\n                                          : isAutrePersonnel\n                                            ? "Autre personnel"\n                                            : "Responsable"}','Libellé sélecteur')
f=rep(f,'                                        isProfesseur\n                                            ? data.enseignant_id\n                                            : isEducateur\n                                              ? data.educateur_id\n                                              : data.etablissement_responsable_id','                                        isProfesseur\n                                            ? data.enseignant_id\n                                            : isEducateur\n                                              ? data.educateur_id\n                                              : isAutrePersonnel\n                                                ? data.autre_personnel_id\n                                                : data.etablissement_responsable_id','Valeur sélecteur')
f=rep(f,'                                            {personne.fonction\n                                                ? ` — ${personne.fonction}`\n                                                : ""}','                                            {(personne.fonction_libelle || personne.fonction)\n                                                ? ` — ${personne.fonction_libelle || personne.fonction}`\n                                                : ""}','Affichage fonction')
f=rep(f,'                                {errors.etablissement_responsable_id && (\n                                    <p className="mt-2 text-sm text-red-600">\n                                        {errors.etablissement_responsable_id}\n                                    </p>\n                                )}','                                {errors.etablissement_responsable_id && (\n                                    <p className="mt-2 text-sm text-red-600">\n                                        {errors.etablissement_responsable_id}\n                                    </p>\n                                )}\n                                {errors.autre_personnel_id && (\n                                    <p className="mt-2 text-sm text-red-600">\n                                        {errors.autre_personnel_id}\n                                    </p>\n                                )}','Erreur validation')
# Lock name/email for AutrePersonnel too
f=f.replace('                                        isEducateur ||\n                                        isResponsable\n                                    }','                                        isEducateur ||\n                                        isResponsable ||\n                                        isAutrePersonnel\n                                    }')
f=f.replace('                                        isEducateur ||\n                                        isResponsable\n                                            ? "cursor-not-allowed','                                        isEducateur ||\n                                        isResponsable ||\n                                        isAutrePersonnel\n                                            ? "cursor-not-allowed')
f=f.replace('                                    {(isProfesseur ||\n                                        isEducateur ||\n                                        isResponsable) && (','                                    {(isProfesseur ||\n                                        isEducateur ||\n                                        isResponsable ||\n                                        isAutrePersonnel) && (')
# Only write after all replacements passed
for p in (cp,fp):
    p.with_suffix(p.suffix+'.bak').write_text(p.read_text(encoding='utf-8'),encoding='utf-8')
cp.write_text(c,encoding='utf-8'); fp.write_text(f,encoding='utf-8')
print('Modifications appliquées. Sauvegardes .bak créées pour les deux fichiers.')
print('Vérifications à lancer depuis backend :')
print('  php -l app/Http/Controllers/UserController.php')
print('  npm run build')
