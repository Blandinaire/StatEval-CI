<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">

    <title>Billet de retard</title>

    <style>
        @page {
            margin: 35px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1f2937;
            font-size: 13px;
            line-height: 1.5;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .school-name {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
        }

        .document-title {
            margin-top: 8px;
            font-size: 18px;
            font-weight: bold;
        }

        .document-number {
            margin-top: 5px;
            font-size: 12px;
            color: #6b7280;
        }

        .section {
            margin-top: 18px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
        }

        .section-title {
            background: #eff6ff;
            padding: 9px 12px;
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 1px solid #d1d5db;
        }

        .section-content {
            padding: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            padding: 7px 5px;
            vertical-align: top;
        }

        .label {
            width: 35%;
            font-weight: bold;
            color: #6b7280;
        }

        .value {
            font-weight: bold;
        }

        .retard-important {
            text-align: center;
            margin: 20px 0;
            padding: 14px;
            border: 2px solid #dc2626;
            background: #fef2f2;
            color: #991b1b;
            font-size: 18px;
            font-weight: bold;
        }

        .observation {
            min-height: 60px;
        }

        .signatures {
            margin-top: 50px;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            height: 90px;
        }

        .signature-title {
            font-weight: bold;
        }

        .footer {
            position: fixed;
            bottom: -10px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
        }
    </style>
</head>

<body>

    <div class="header">

        <div class="school-name">
            {{ config('app.name', 'StatEval-CI') }}
        </div>

        <div class="document-title">
            BILLET DE RETARD
        </div>

        <div class="document-number">
            N° {{ $retard->numero_billet ?? '-' }}
        </div>

    </div>

    <div class="section">

        <div class="section-title">
            IDENTIFICATION DE L'ÉLÈVE
        </div>

        <div class="section-content">

            <table>

                <tr>
                    <td class="label">
                        Nom et prénoms :
                    </td>

                    <td class="value">
                        {{ $retard->eleve?->nom }}
                        {{ $retard->eleve?->prenoms }}
                    </td>
                </tr>

                <tr>
                    <td class="label">
                        Classe :
                    </td>

                    <td class="value">
                        {{ $retard->classe?->libelle ?? '-' }}
                    </td>
                </tr>

                <tr>
                    <td class="label">
                        Année scolaire :
                    </td>

                    <td class="value">
                        {{ $retard->anneeScolaire?->libelle ?? '-' }}
                    </td>
                </tr>

            </table>

        </div>

    </div>

    <div class="section">

        <div class="section-title">
            INFORMATIONS SUR LE RETARD
        </div>

        <div class="section-content">

            <table>

                <tr>
                    <td class="label">
                        Date :
                    </td>

                    <td class="value">
                        {{ $retard->date_retard?->format('d/m/Y') ?? '-' }}
                    </td>
                </tr>

                <tr>
                    <td class="label">
                        Heure prévue :
                    </td>

                    <td class="value">
                        {{ $retard->heure_prevue
                            ? substr($retard->heure_prevue, 0, 5)
                            : '-' }}
                    </td>
                </tr>

                <tr>
                    <td class="label">
                        Heure d'arrivée :
                    </td>

                    <td class="value">
                        {{ $retard->heure_arrivee
                            ? substr($retard->heure_arrivee, 0, 5)
                            : '-' }}
                    </td>
                </tr>

                <tr>
                    <td class="label">
                        Durée du retard :
                    </td>

                    <td class="value">
                        {{ $retard->duree_minutes }} minute(s)
                    </td>
                </tr>

                <tr>
                    <td class="label">
                        Motif :
                    </td>

                    <td class="value">
                        {{ $retard->motif ?? '-' }}
                    </td>
                </tr>

            </table>

        </div>

    </div>

    <div class="retard-important">

        RETARD DE {{ $retard->duree_minutes }} MINUTE(S)

    </div>

    <div class="section">

        <div class="section-title">
            OBSERVATION
        </div>

        <div class="section-content observation">

            {{ $retard->observation ?? 'Aucune observation.' }}

        </div>

    </div>

    <div class="section">

        <div class="section-title">
            ENREGISTREMENT
        </div>

        <div class="section-content">

            <table>

                <tr>
                    <td class="label">
                        Éducateur :
                    </td>

                    <td class="value">
                        {{ $retard->educateur
                            ? $retard->educateur->nom . ' ' .
                              $retard->educateur->prenoms
                            : '-' }}
                    </td>
                </tr>

                <tr>
                    <td class="label">
                        Date d'édition :
                    </td>

                    <td class="value">
                        {{ $retard->billet_edite_le
                            ? $retard->billet_edite_le->format('d/m/Y à H:i')
                            : now()->format('d/m/Y à H:i') }}
                    </td>
                </tr>

            </table>

        </div>

    </div>

    <div class="signatures">

        <table class="signature-table">

            <tr>

                <td>
                    <div class="signature-title">
                        Signature de l'éducateur
                    </div>
                    <br><br>
                    __________________________
                </td>

                <td>
                    <div class="signature-title">
                        Signature du responsable
                    </div>
                    <br><br>
                    __________________________
                </td>

            </tr>

        </table>

    </div>

    <div class="footer">
        Billet de retard généré par {{ config('app.name', 'StatEval-CI') }}
    </div>

</body>

</html>