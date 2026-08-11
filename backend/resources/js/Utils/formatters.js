/**
 * Met un nom en majuscules.
 * Exemple : "amouzou" → "AMOUZOU"
 */
export function formatNom(value) {
    return value.toUpperCase();
}

/**
 * Met chaque prénom avec une première lettre majuscule
 * et le reste en minuscules.
 *
 * Exemples :
 * "KOFFI"       → "Koffi"
 * "jean koffi"  → "Jean Koffi"
 * "JEAN-MARC"   → "Jean-Marc"
 * "n'guessan"   → "N'Guessan"
 */
export function formatPrenoms(value) {
    return value
        .toLowerCase()
        .replace(/(^|[\s'-])([a-zà-ÿ])/g, (_, separator, letter) => {
            return separator + letter.toUpperCase();
        });
}

/**
 * Texte courant :
 * première lettre de chaque mot en majuscule.
 */
export function formatTexte(value) {
    return value
        .toLowerCase()
        .replace(/(^|[\s'-])([a-zà-ÿ])/g, (_, separator, letter) => {
            return separator + letter.toUpperCase();
        });
}

/**
 * Email :
 * toujours en minuscules et sans espaces.
 */
export function formatEmail(value) {
    return value
        .toLowerCase()
        .replace(/\s/g, "");
}

/**
 * Téléphone :
 * conserve uniquement les chiffres.
 */
export function formatTelephone(value) {
    return value.replace(/\D/g, "");
}

/**
 * Matricule national :
 * 8 chiffres + 1 lettre majuscule.
 */
export function formatMatricule(value) {
    return value
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, "")
        .slice(0, 9);
}