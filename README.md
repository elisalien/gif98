# GIF98

> Visualiseur de GIFs rythmé au BPM, dans une interface façon Windows 98/XP pleine de fenêtres, d'erreurs et d'écrans bleus.

![Platform](https://img.shields.io/badge/platform-Web-informational) ![Stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-orange)

## À propos

GIF98 est un petit lecteur de GIFs qui tourne entièrement dans le navigateur. On charge ses propres GIFs, on choisit un effet et un tempo, puis on lance « le spectacle » : les GIFs s'ouvrent dans des fenêtres rétro Windows 98/XP qui apparaissent, se multiplient et « plantent » en rythme.

## Fonctionnalités

- Chargement de plusieurs GIFs locaux (gestionnaire de GIFs)
- Tempo réglable de 60 à 200 BPM
- 17 effets : cascade de fenêtres, spam de dialogues d'erreur, écran bleu de la mort, corruption d'écran, fuite mémoire visuelle, gel système, Matrix (pluie de code), kaléidoscope, vortex spirale, hélice ADN, feux d'artifice, vagues ondulantes, cube 3D rotatif, mosaïque dynamique, système orbital, vision tunnel, flip book rapide
- 10 presets « glitch » : Cascade Spam, BSOD Panic, DLL Hell, Registry Corrupt, Memory Leak, System Hang, Matrix XP, Defrag, Screensaver, Psychedelic
- Réglages d'intensité (1–10), de nombre maximal de fenêtres et de disposition (aléatoire, grille, cascade XP, cercle, diagonale, centre explosif)
- Interface bureau rétro (fenêtres, barre des tâches, bouton Démarrer) et raccourcis clavier

## Installation

Aucune dépendance ni build : ouvrir `index.html` dans un navigateur récent.

## Utilisation

1. Dans **Gestionnaire de GIFs**, cliquer sur **Choisir des GIFs…** et sélectionner un ou plusieurs fichiers `.gif`.
2. Dans **Panneau de Contrôle**, choisir un preset ou régler BPM, effet, intensité, nombre de fenêtres et disposition.
3. Cliquer sur **Lancer le Spectacle** (ou appuyer sur `Espace`).

### Raccourcis clavier

| Touche | Action |
| --- | --- |
| `Espace` | Lancer (écran d'accueil) / pause–reprise (pendant la lecture) |
| `?` / `H` | Afficher les raccourcis (écran d'accueil) |
| `↑` / `↓` | BPM +5 / −5 |
| `→` / `←` | Intensité +1 / −1 |
| `1`–`9` | Changer rapidement d'effet |
| `G` | Déclencher un glitch |
| `C` | Nettoyer l'écran |
| `H` | Masquer/afficher les contrôles (pendant la lecture) |
| `F` | Plein écran |
| `Échap` | Retour à l'accueil |

## Structure du projet

```
.
├── index.html   # Bureau rétro : gestionnaire de GIFs, panneau de contrôle, zone de lecture
├── style.css    # Thème Windows 98/XP
└── app.js       # État, presets, effets, rythme au BPM, raccourcis clavier
```

## Stack technique

HTML, CSS, JavaScript (vanilla), sans dépendance.

## Crédits & licence

Aucune licence n'est spécifiée — tous droits réservés.

---

<p align="center">
  Fait par <a href="https://github.com/elisalien">Élisalien</a> ·
  <a href="https://gitlab.com/elisalien/catalog">Catalogue des shaders, sources & logiciels</a>
</p>
