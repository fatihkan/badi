# Badi 30-saniye demo — vhs ile render edilir.
#
# Render etmek icin:
#   brew install vhs              # macOS (veya https://github.com/charmbracelet/vhs)
#   vhs assets/demo.tape          # -> assets/demo.gif uretir
#
# Cikti: assets/demo.gif (~3-5 MB hedef)

Output assets/demo.gif

Set FontSize 14
Set Width 960
Set Height 540
Set Padding 20
Set Theme "Dracula"
Set Shell "bash"

Type "npm install -g @fatihkan/badi"
Sleep 500ms
Enter
Sleep 2s

Type "badi init"
Sleep 300ms
Enter
Sleep 2s

Type "badi doctor"
Sleep 300ms
Enter
Sleep 2s

Type "badi list --agents | head -10"
Sleep 300ms
Enter
Sleep 2s

Type "badi skills available | head -10"
Sleep 300ms
Enter
Sleep 2s

Type "badi stats --gun 7"
Sleep 300ms
Enter
Sleep 3s
