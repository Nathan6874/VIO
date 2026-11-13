package ci.vio.backend.common;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Utilitaire pour capitaliser les noms, prénoms, titres, villes, communes.
 * Gère les cas particuliers :
 * - "jean dubus" → "Jean Dubus"
 * - "jean-pierre" → "Jean-Pierre"
 * - "d'appolonia" → "D'Appolonia"
 * - "abidjan" → "Abidjan"
 * - "cocody angré" → "Cocody Angré"
 */
public final class NameCapitalizer {

    private NameCapitalizer() {
        // utility class
    }

    /**
     * Capitalise un nom complet ou un titre.
     * Ex: "jean dubus" → "Jean Dubus"
     *     "appartement 3 pièces" → "Appartement 3 Pièces"
     */
    public static String capitalize(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }

        // 1. Trim + collapse spaces
        String trimmed = input.trim().replaceAll("\\s+", " ");

        // 2. Split sur les espaces
        return Arrays.stream(trimmed.split(" "))
                .map(NameCapitalizer::capitalizeWord)
                .collect(Collectors.joining(" "));
    }

    /**
     * Capitalise un mot unique.
     * Gère les tirets et apostrophes :
     * - "jean-pierre" → "Jean-Pierre"
     * - "d'appolonia" → "D'Appolonia"
     */
    private static String capitalizeWord(String word) {
        if (word.isEmpty()) {
            return word;
        }

        // Gérer les tirets (Jean-Pierre)
        if (word.contains("-")) {
            return Arrays.stream(word.split("-"))
                    .map(NameCapitalizer::simpleCapitalize)
                    .collect(Collectors.joining("-"));
        }

        // Gérer les apostrophes (D'Appolonia)
        if (word.contains("'")) {
            int idx = word.indexOf('\'');
            String before = word.substring(0, idx);
            String after = word.substring(idx + 1);
            return simpleCapitalize(before) + "'" + simpleCapitalize(after);
        }

        return simpleCapitalize(word);
    }

    /**
     * Capitalise la première lettre, garde le reste en minuscules.
     * Ex: "JEAN" → "Jean"
     *     "jean" → "Jean"
     */
    private static String simpleCapitalize(String word) {
        if (word.isEmpty()) return word;
        return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
    }
}