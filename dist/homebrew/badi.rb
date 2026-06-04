# Homebrew Formula for Badi — npm-backed CLI distribution.
#
# Bu dosya `fatihkan/homebrew-badi` tap repo'sundaki Formula/ dizinine
# kopyalanmali. Kullanici daha sonra:
#
#   brew tap fatihkan/badi
#   brew install badi
#
# komutlariyla yukleyebilir. Sha256 ve url release tarafindan otomatik
# guncellenir (.github/workflows/dist-publish.yml goruntule).
#
# Tap repo skeleton (manual install):
#   gh repo create fatihkan/homebrew-badi --public --description "Homebrew tap for Badi"
#   cd /tmp && git clone https://github.com/fatihkan/homebrew-badi.git
#   mkdir -p homebrew-badi/Formula
#   cp dist/homebrew/badi.rb homebrew-badi/Formula/badi.rb
#   cd homebrew-badi && git add -A && git commit -m "init" && git push

require "language/node"

class Badi < Formula
  desc "Workflow management for Claude Code, Cursor, Gemini CLI, Windsurf, and AGENTS.md"
  homepage "https://github.com/fatihkan/badi"
  url "https://registry.npmjs.org/@fatihkan/badi/-/badi-1.30.1.tgz"
  sha256 "REPLACE_AT_RELEASE_TIME"
  license "MIT"

  depends_on "node@20"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "v#{version}", shell_output("#{bin}/badi --version")
  end
end
