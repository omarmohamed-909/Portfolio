import re

def fix():
    with open('o:/portfolio/presentation/index.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # Fix mojibake
    replacements = {
        'â€”': '—',
        'Â·': '·',
        'ðŸ ª': '🍪',
        'ðŸ›¡ï¸ ': '🛡️',
        'ðŸ”’': '🔒',
        'ðŸš«': '🚫',
        'â”€': '─'
    }

    for bad, good in replacements.items():
        text = text.replace(bad, good)

    with open('o:/portfolio/presentation/index.html', 'w', encoding='utf-8') as f:
        f.write(text)

if __name__ == '__main__':
    fix()
    print("Done")
