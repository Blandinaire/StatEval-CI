import AdminLayout from "@/Layouts/AdminLayout";

import {
    FormCard,
    PageHeader,
    TextField,
    SelectField,
    SearchInput,
    PrimaryButton,
    DataTable,
    Badge,
} from "@/Components";

export default function Dashboard({ stats }) {
    return (
    <AdminLayout>

        <div className="space-y-6">

            <PageHeader
                title="Test des composants"
                subtitle="Bibliothèque UI de StatEval-CI"
            >
                <PrimaryButton>
                    Nouveau
                </PrimaryButton>
            </PageHeader>

            <div className="flex gap-3">

    <Badge color="green">
        Actif
    </Badge>

    <Badge color="red">
        Inactif
    </Badge>

    <Badge color="yellow">
        En attente
    </Badge>

    <Badge color="blue">
        Information
    </Badge>

</div>

            <FormCard>

                <DataTable
    columns={[
        { key: "nom", label: "Nom" },
        { key: "prenom", label: "Prénom" },
        { key: "classe", label: "Classe" },
    ]}
    data={[]}
/>

                <div className="space-y-4">

                    <SearchInput />

                    <TextField
                        label="Nom"
                        placeholder="Saisissez votre nom"
                    />

                    <SelectField label="Cycle">

                        <option>Choisir...</option>

                        <option>Premier cycle</option>

                        <option>Second cycle</option>

                    </SelectField>

                    <PrimaryButton>
                        Enregistrer
                    </PrimaryButton>

                </div>

            </FormCard>

        </div>

    </AdminLayout>
);
}