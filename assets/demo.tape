# Badi ~35-second demo — rendered with vhs.
#
# To render:
#   brew install vhs                  # macOS (or https://github.com/charmbracelet/vhs)
#   npm install -g @fatihkan/badi     # so the demo can run
#   vhs assets/demo.tape              # -> produces assets/demo.gif
#
# Output: assets/demo.gif (~1-3 MB target)

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

Type "# badi — the agentic safety layer for Claude Code"
Sleep 800ms
Enter
Sleep 500ms

Type "badi init --harness claude | tail -5"
Sleep 300ms
Enter
Sleep 2800ms

Type "badi list --agents | head -8"
Sleep 300ms
Enter
Sleep 2500ms

Type "badi list --commands | head -8"
Sleep 300ms
Enter
Sleep 2500ms

Type "badi list --hooks | head -9"
Sleep 300ms
Enter
Sleep 2800ms

Type "badi skills available | head -8"
Sleep 300ms
Enter
Sleep 2500ms

Type "badi doctor | tail -3"
Sleep 300ms
Enter
Sleep 2500ms

Type "# 30 agents · 86 commands · 14 hooks · 63 opt-in skills · 6 harnesses"
Sleep 800ms
Enter
Sleep 1800ms
