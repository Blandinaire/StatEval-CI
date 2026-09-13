<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">

    <title>Billet de retard - {{ $retard->numero_billet }}</title>

    <style>
        @page {
            size: A4 portrait;
            margin: 18mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, Arial, sans-serif;
            color: #111827;
            font-size: 12px;
        }

        .document {
            width: 100%;
        }

        .header {
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-left {
            width: 68%;
            vertical-align: top;
        }

        .header-right {
            width: 32%;
            text-align: right;
            vertical-align: top;
        }

        .school-name {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
        }

        .school-subtitle {
            margin-top: 4px;
            font-size: 10px;
            color: #6b7280;
        }

        .document-title {
            font-size: 20px;
            font-weight: bold;
            color: #111827;
            margin-top: 8px;
            text-transform: uppercase;
        }

        .document-number {
            display: inline-block;
            border: 1px solid #d1d5db;
            padding: 7px 10px;
            font-weight: bold;
            font-size: 11px;
            background: #f9fafb;
        }

        .section {
            margin-bottom: 14px;
        }

        .section-title {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 8px 10px;
            font-size: 13px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 0;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d1d5db;
        }

        .info-table td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            vertical-align: top;
        }

        .label {
            display: block;
            color: #6b7280;
            font-size: 9px;
            margin-bottom: 3px;
            text-transform: uppercase;
        }

        .value {
            font-size: 12px;
            font-weight: bold;
        }

        .duration {
            color: #b45309;
            font-size: 14px;
            font-weight: bold;
        }

        .motif {
            min-height: 45px;
            border: 1px solid #d1d5db;
            padding: 10px;
            font-size: 11px;
        }

        .observation {
            min-height: 55px;
            border: 1px solid #d1d5db;
            padding: 10px;
            font-size: 11px;
        }

        .notice {
            margin-top: 18px;
            padding: 10px;
            border: 1px solid #d1d5db;
            background: #f9fafb;
            font-size: 9px;
            line-height: 1.5;
        }

        .signatures {
            width: 100%;
            border-collapse: collapse;
            margin-top: 28px;
        }

        .signature-cell {
            width: 50%;
            text-align: center;
            vertical-align: top;
            height: 85px;
        }

        .signature-title {
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 35px;
        }

        .signature-line {
            border-top: 1px solid #374151;
            width: 75%;
            margin: auto;
        }

        .footer {
            margin-top: 20px;
            border-top: 1px solid #d1d5db;
            padding-top: 8px;
            text-align: center;
            color: #6b7280;
            font-size: 8px;
        }

        .text-center {
            text-align: center;
        }

        .uppercase {
            text-transform: uppercase;
        }
    </style>
</head>

<body>

<div class="document">

    {{-- EN-TÊTE --}}
    <div class="header">
        <table class="header-table">
            <tr>
                <td class="header-left">

                    <div class="school-name">
                        StatEval-CI
                    </div>

                    <div class="school-subtitle">
                        Gestion scolaire
                    </div>

                    <div class="document-title">
                        Billet de retard
                    </div>

                </td>

                <td class="header-right">

                    <div class="document-number">
                        N° {{ $retard->numero_billet ?? '---' }}
                    </div>

                </td>
            </tr>
        </table>
    </div>


    {{-- ÉLÈVE --}}
    <div class="section">

        <div class="section-title">
            Identification de l'élève
        </div>

        <table class="info-table">

            <tr>

                <td style="width: 60%;">
                    <span class="label">
                        Nom et prénoms
                    </span>

                    <span class="value uppercase">
                        {{ $retard->eleve?->nom ?? '' }}
                        {{ $retard->eleve?->prenoms ?? '' }}
                    </span>
                </td>

                <td style="width: 40%;">
                    <span class="label">
                        Classe
                    </span>

                    <span class="value">
                        {{ $retard->classe?->libelle ?? '---' }}
                    </span>
                </td>

            </tr>

            <tr>

                <td>
                    <span class="label">
                        Année scolaire
                    </span>

                    <span class="value">
                        {{ $retard->anneeScolaire?->libelle ?? '---' }}
                    </span>
                </td>

                <td>
                    <span class="label">
                        Éducateur
                    </span>

                    <span class="value">
                        {{ $retard->educateur
                            ? $retard->educateur->nom . ' ' . $retard->educateur->prenoms
                            : '---'
                        }}
                    </span>
                </td>

            </tr>

        </table>

    </div>


    {{-- INFORMATIONS DU RETARD --}}
    <div class="section">

        <div class="section-title">
            Informations sur le retard
        </div>

        <table class="info-table">

            <tr>

                <td style="width: 25%;">
                    <span class="label">
                        Date
                    </span>

                    <span class="value">
                        {{ $retard->date_retard
                            ? $retard->date_retard->format('d/m/Y')
                            : '---'
                        }}
                    </span>
                </td>

                <td style="width: 25%;">
                    <span class="label">
                        Heure prévue
                    </span>

                    <span class="value">
                        {{ $retard->heure_prevue
                            ? substr($retard->heure_prevue, 0, 5)
                            : '---'
                        }}
                    </span>
                </td>

                <td style="width: 25%;">
                    <span class="label">
                        Heure d'arrivée
                    </span>

                    <span class="value">
                        {{ $retard->heure_arrivee
                            ? substr($retard->heure_arrivee, 0, 5)
                            : '---'
                        }}
                    </span>
                </td>

                <td style="width: 25%;">
                    <span class="label">
                        Durée du retard
                    </span>

                    <span class="duration">
                        {{ $retard->duree_minutes ?? 0 }} minute(s)
                    </span>
                </td>

            </tr>

        </table>

    </div>


    {{-- MOTIF --}}
    <div class="section">

        <div class="section-title">
            Motif du retard
        </div>

        <div class="motif">
            {{ $retard->motif ?? 'Aucun motif renseigné.' }}
        </div>

    </div>


    {{-- OBSERVATION --}}
    <div class="section">

        <div class="section-title">
            Observation
        </div>

        <div class="observation">
            {{ $retard->observation ?? 'Aucune observation.' }}
        </div>

    </div>


    {{-- MENTION --}}
    <div class="notice">

        <strong>Important :</strong>

        Le présent billet atteste que l'élève identifié ci-dessus
        est arrivé en retard à l'établissement à la date et à l'heure
        indiquées.

        Il doit être conservé par l'élève et présenté à toute personne
        habilitée de l'établissement qui en ferait la demande.

    </div>


    {{-- SIGNATURES --}}
    <table class="signatures">

        <tr>

            <td class="signature-cell">

                <div class="signature-title">
                    L'ÉDUCATEUR
                </div>

                <div class="signature-line"></div>

            </td>

            <td class="signature-cell">

                <div class="signature-title">
                    RESPONSABLE / PARENT
                </div>

                <div class="signature-line"></div>

            </td>

        </tr>

    </table>


    {{-- PIED DE PAGE --}}
    <div class="footer">

        StatEval-CI — Gestion scolaire

        @if($retard->billet_edite_le)
            &nbsp; | &nbsp;
            Édité le
            {{ $retard->billet_edite_le->format('d/m/Y à H:i') }}
        @endif

    </div>

</div>

</body>
</html>