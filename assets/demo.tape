# Badi 30-saniye demo — vhs ile render edilir.
#
# Render etmek icin:
#   brew install vhs                  # macOS (veya https://github.com/charmbracelet/vhs)
#   npm install -g @fatihkan/badi     # demo'nun calismasi icin
#   vhs assets/demo.tape              # -> assets/demo.gif uretir
#
# Cikti: assets/demo.gif (~1-3 MB hedef)

Output assets/demo.gif

Set FontSize 14
Set Width 960
Set Height 540
Set Padding 20
Set Theme "Dracula"
Set Shell "bash"

Hide
Type "cd /tmp && rm -rf badi-demo && mkdir badi-demo && cd badi-demo && clear" Enter
Sleep 1s
Show

Type "# Badi: Workflow management CLI for Claude Code"
Sleep 800ms
Enter
Sleep 600ms

Type "badi list --agents | head -8"
Sleep 300ms
Enter
Sleep 2500ms

Type "badi list --commands | head -10"
Sleep 300ms
Enter
Sleep 2500ms

Type "badi skills available | head -10"
Sleep 300ms
Enter
Sleep 2500ms

Type "badi list --hooks | head -8"
Sleep 300ms
Enter
Sleep 2500ms

Type "# 22 agents - 77 commands - 12 hooks - 24 opt-in skills"
Sleep 800ms
Enter
Sleep 1500ms
