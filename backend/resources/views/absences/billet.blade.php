<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">

    <title>Billet d'absence - {{ $absence->numero_billet }}</title>

    <style>
        @page {
            margin: 25px;
        }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 12px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
        }

        .header {
            border-bottom: 3px solid #1d4ed8;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-left {
            width: 70%;
            vertical-align: top;
        }

        .header-right {
            width: 30%;
            text-align: right;
            vertical-align: top;
        }

        .school-name {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
        }

        .school-subtitle {
            font-size: 11px;
            color: #6b7280;
        }

        .document-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #111827;
            margin: 20px 0 5px;
        }

        .document-subtitle {
            text-align: center;
            color: #6b7280;
            font-size: 11px;
            margin-bottom: 20px;
        }

        .ticket-number {
            border: 2px solid #1d4ed8;
            padding: 8px 12px;
            text-align: center;
            border-radius: 5px;
        }

        .ticket-number-label {
            font-size: 9px;
            color: #6b7280;
            text-transform: uppercase;
        }

        .ticket-number-value {
            font-size: 16px;
            font-weight: bold;
            color: #1d4ed8;
            margin-top: 4px;
        }

        .section {
            margin-top: 15px;
            border: 1px solid #d1d5db;
        }

        .section-title {
            background: #eff6ff;
            color: #1e3a8a;
            font-size: 13px;
            font-weight: bold;
            padding: 8px 10px;
            border-bottom: 1px solid #d1d5db;
        }

        .section-content {
            padding: 10px;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 6px 5px;
            vertical-align: top;
        }

        .label {
            width: 25%;
            color: #6b7280;
            font-size: 10px;
        }

        .value {
            width: 25%;
            font-weight: bold;
        }

        .status {
            display: inline-block;
            padding: 4px 9px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
        }

        .status-justified {
            background: #dcfce7;
            color: #166534;
        }

        .status-not-justified {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-edited {
            background: #dbeafe;
            color: #1e40af;
        }

        .observation {
            min-height: 50px;
            padding: 8px;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            white-space: pre-wrap;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 35px;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 10px;
        }

        .signature-title {
            font-weight: bold;
            font-size: 11px;
        }

        .signature-space {
            height: 60px;
        }

        .footer {
            margin-top: 25px;
            border-top: 1px solid #d1d5db;
            padding-top: 8px;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
        }

        .notice {
            margin-top: 15px;
            padding: 10px;
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            font-size: 10px;
        }
    </style>
</head>

<body>

<div class="container">

    {{-- EN-TÊTE --}}
    <div class="header">
        <table class="header-table">
            <tr>
                <td class="header-left">

                    <div class="school-name">
                        {{ config('app.name', 'StatEval-CI') }}
                    </div>

                    <div class="school-subtitle">
                        Gestion scolaire
                    </div>

                </td>

                <td class="header-right">

                    <div class="ticket-number">

                        <div class="ticket-number-label">
                            Numéro du billet
                        </div>

                        <div class="ticket-number-value">
                            {{ $absence->numero_billet ?? 'N/A' }}
                        </div>

                    </div>

                </td>
            </tr>
        </table>
    </div>


    {{-- TITRE --}}
    <div class="document-title">
        BILLET D'ABSENCE
    </div>

    <div class="document-subtitle">
        Justificatif d'absence d'un élève
    </div>


    {{-- INFORMATIONS ELEVE --}}
    <div class="section">

        <div class="section-title">
            Informations sur l'élève
        </div>

        <div class="section-content">

            <table class="info-table">

                <tr>

                    <td class="label">
                        Nom et prénoms :
                    </td>

                    <td class="value">
                        {{ $absence->eleve?->nom }}
                        {{ $absence->eleve?->prenoms }}
                    </td>

                    <td class="label">
                        Classe :
                    </td>

                    <td class="value">
                        {{ $absence->classe?->libelle ?? '-' }}
                    </td>

                </tr>

                <tr>

                    <td class="label">
                        Année scolaire :
                    </td>

                    <td class="value">
                        {{ $absence->anneeScolaire?->libelle ?? '-' }}
                    </td>

                    <td class="label">
                        Éducateur :
                    </td>

                    <td class="value">
                        @if($absence->educateur)
                            {{ $absence->educateur->nom }}
                            {{ $absence->educateur->prenoms }}
                        @else
                            -
                        @endif
                    </td>

                </tr>

            </table>

        </div>

    </div>


    {{-- INFORMATIONS ABSENCE --}}
    <div class="section">

        <div class="section-title">
            Informations sur l'absence
        </div>

        <div class="section-content">

            <table class="info-table">

                <tr>

                    <td class="label">
                        Date :
                    </td>

                    <td class="value">
                        {{ $absence->date_absence
                            ? $absence->date_absence->format('d/m/Y')
                            : '-' }}
                    </td>

                    <td class="label">
                        Durée :
                    </td>

                    <td class="value">
                        {{ $absence->duree_heures ?? 0 }} heure(s)
                    </td>

                </tr>

                <tr>

                    <td class="label">
                        Heure de début :
                    </td>

                    <td class="value">
                        {{ $absence->heure_debut ?? '-' }}
                    </td>

                    <td class="label">
                        Heure de fin :
                    </td>

                    <td class="value">
                        {{ $absence->heure_fin ?? '-' }}
                    </td>

                </tr>

                <tr>

                    <td class="label">
                        Justification :
                    </td>

                    <td class="value">

                        @if($absence->justifiee)

                            <span class="status status-justified">
                                Justifiée
                            </span>

                        @else

                            <span class="status status-not-justified">
                                Non justifiée
                            </span>

                        @endif

                    </td>

                    <td class="label">
                        Motif :
                    </td>

                    <td class="value">
                        {{ $absence->motif ?? '-' }}
                    </td>

                </tr>

            </table>

        </div>

    </div>


    {{-- BILLET --}}
    <div class="section">

        <div class="section-title">
            Informations relatives au billet
        </div>

        <div class="section-content">

            <table class="info-table">

                <tr>

                    <td class="label">
                        Numéro :
                    </td>

                    <td class="value">
                        {{ $absence->numero_billet ?? '-' }}
                    </td>

                    <td class="label">
                        Statut :
                    </td>

                    <td class="value">

                        @if($absence->billet_edite)

                            <span class="status status-edited">
                                Édité
                            </span>

                        @else

                            Non édité

                        @endif

                    </td>

                </tr>

                <tr>

                    <td class="label">
                        Date d'édition :
                    </td>

                    <td class="value" colspan="3">

                        {{ $absence->billet_edite_le
                            ? $absence->billet_edite_le->format('d/m/Y à H:i')
                            : '-' }}

                    </td>

                </tr>

            </table>

        </div>

    </div>


    {{-- OBSERVATION --}}
    <div class="section">

        <div class="section-title">
            Observation
        </div>

        <div class="section-content">

            <div class="observation">

                {{ $absence->observation ?? 'Aucune observation.' }}

            </div>

        </div>

    </div>


    {{-- AVERTISSEMENT --}}
    <div class="notice">

        <strong>Important :</strong>
        Ce billet constitue une pièce administrative relative
        à l'absence de l'élève mentionné ci-dessus.
        Il doit être conservé par l'établissement conformément
        à ses procédures administratives.

    </div>


    {{-- SIGNATURES --}}
    <table class="signature-table">

        <tr>

            <td>

                <div class="signature-title">
                    L'Éducateur
                </div>

                <div class="signature-space"></div>

                <div>
                    Signature
                </div>

            </td>

            <td>

                <div class="signature-title">
                    Administration / Direction
                </div>

                <div class="signature-space"></div>

                <div>
                    Signature et cachet
                </div>

            </td>

        </tr>

    </table>


    {{-- PIED DE PAGE --}}
    <div class="footer">

        Billet d'absence N° {{ $absence->numero_billet ?? '-' }}

        &nbsp; | &nbsp;

        Document généré automatiquement par
        {{ config('app.name', 'StatEval-CI') }}

    </div>

</div>

</body>
</html>