<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">

    <title>Billet d'absence</title>

    <style>
        @page {
            margin: 20px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #1f2937;
        }

        .container {
            border: 2px solid #1e3a8a;
            padding: 20px;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .school-name {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
        }

        .document-title {
            margin-top: 8px;
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .reference {
            margin-top: 6px;
            font-size: 11px;
            color: #4b5563;
        }

        .section {
            margin-bottom: 18px;
        }

        .section-title {
            background: #eff6ff;
            color: #1e3a8a;
            font-weight: bold;
            padding: 8px;
            border-left: 4px solid #1e3a8a;
            margin-bottom: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            padding: 7px;
            border-bottom: 1px solid #e5e7eb;
        }

        .label {
            width: 35%;
            font-weight: bold;
            color: #4b5563;
        }

        .status {
            display: inline-block;
            padding: 5px 10px;
            font-weight: bold;
        }

        .justifiee {
            color: #166534;
            background: #dcfce7;
        }

        .non-justifiee {
            color: #991b1b;
            background: #fee2e2;
        }

        .observation {
            min-height: 60px;
            border: 1px solid #d1d5db;
            padding: 10px;
        }

        .signature-table {
            margin-top: 40px;
        }

        .signature {
            width: 45%;
            text-align: center;
            padding-top: 45px;
        }

        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #d1d5db;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">

        <div class="school-name">
            {{ config('app.name', 'Établissement scolaire') }}
        </div>

        <div class="document-title">
            Billet d'absence
        </div>

        <div class="reference">
            Numéro : <strong>{{ $absence->numero_billet }}</strong>
        </div>

    </div>


    {{-- ÉLÈVE --}}

    <div class="section">

        <div class="section-title">
            Identification de l'élève
        </div>

        <table>

            <tr>
                <td class="label">
                    Nom et prénoms
                </td>

                <td>
                    <strong>
                        {{ $absence->eleve->nom }}
                        {{ $absence->eleve->prenoms }}
                    </strong>
                </td>
            </tr>

            <tr>
                <td class="label">
                    Classe
                </td>

                <td>
                    {{ $absence->classe->libelle ?? '-' }}
                </td>
            </tr>

            <tr>
                <td class="label">
                    Année scolaire
                </td>

                <td>
                    {{ $absence->anneeScolaire->libelle ?? '-' }}
                </td>
            </tr>

        </table>

    </div>


    {{-- ABSENCE --}}

    <div class="section">

        <div class="section-title">
            Informations sur l'absence
        </div>

        <table>

            <tr>
                <td class="label">
                    Date
                </td>

                <td>
                    {{ $absence->date_absence?->format('d/m/Y') ?? '-' }}
                </td>
            </tr>

            <tr>
                <td class="label">
                    Heure de début
                </td>

                <td>
                    {{ $absence->heure_debut ?? '-' }}
                </td>
            </tr>

            <tr>
                <td class="label">
                    Heure de fin
                </td>

                <td>
                    {{ $absence->heure_fin ?? '-' }}
                </td>
            </tr>

            <tr>
                <td class="label">
                    Durée
                </td>

                <td>
                    {{ $absence->duree_heures ?? 0 }} heure(s)
                </td>
            </tr>

            <tr>
                <td class="label">
                    Justification
                </td>

                <td>

                    @if($absence->justifiee)

                        <span class="status justifiee">
                            ABSENCE JUSTIFIÉE
                        </span>

                    @else

                        <span class="status non-justifiee">
                            ABSENCE NON JUSTIFIÉE
                        </span>

                    @endif

                </td>
            </tr>

            <tr>
                <td class="label">
                    Motif
                </td>

                <td>
                    {{ $absence->motif ?? '-' }}
                </td>
            </tr>

        </table>

    </div>


    {{-- OBSERVATION --}}

    <div class="section">

        <div class="section-title">
            Observation
        </div>

        <div class="observation">
            {{ $absence->observation ?? 'Aucune observation.' }}
        </div>

    </div>


    {{-- SIGNATURES --}}

    <table class="signature-table">

        <tr>

            <td class="signature">
                L'éducateur<br>
                <strong>
                    {{ $absence->educateur->nom ?? '' }}
                    {{ $absence->educateur->prenoms ?? '' }}
                </strong>
            </td>

            <td class="signature">
                Visa de la Direction
            </td>

        </tr>

    </table>


    <div class="footer">

        Billet d'absence généré automatiquement par
        {{ config('app.name', 'StatEval-CI') }}.

        <br>

        Numéro du billet :
        {{ $absence->numero_billet }}

    </div>

</div>

</body>
</html>