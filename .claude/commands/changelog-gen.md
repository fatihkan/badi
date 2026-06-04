CHANGELOG.md update command. Generates a changelog from git history grouped by conventional commit types.

# Gerekli Araclar
- Bash (badi changelog komutu cagirisi)
- git

# Prosedur

### Adim 1: Son Tag'i Bul
```bash
git describe --tags --abbrev=0
```

### Adim 2: Version Sayisini Belirle

Kullaniciya yeni surumu sor:
- Breaking change varsa: major (2.0.0)
- Yeni ozellik (feat) varsa: minor (1.5.0)
- Sadece fix varsa: patch (1.4.3)

### Adim 3: Badi CLI Ile Changelog Uret

Onizleme (yazmaz):
```bash
badi changelog                              # Son tag'den HEAD
badi changelog --from v1.0.0                # Belirli tag'den
badi changelog --from v1.0.0 --to v2.0.0    # Arada
```

CHANGELOG.md'ye yaz:
```bash
badi changelog --write --version 1.5.0
```

### Adim 4: Manuel Rotus

Otomatik urettikten sonra:
- Kullanici okunabilirligi icin gerekirse duzenle
- Breaking change'leri uste cikar
- Feature hash'lerini kaldir (kullanici icin anlamsiz)
- Kategorileri yeniden sirala (Eklenen -> Duzeltilen -> Diger)

### Adim 5: Tag + Release

Changelog hazir olduktan sonra:
```bash
git add CHANGELOG.md package.json
git commit -m "chore: vX.Y.Z release"
git tag vX.Y.Z
git push origin main --tags
gh release create vX.Y.Z --title "vX.Y.Z - Baslik" --notes-file RELEASE_NOTES.md
```

### Adim 6: npm Publish (varsa)

```bash
npm publish --access public
```

# Ornek
```
/changelog-gen              # onizleme
/changelog-gen 1.5.0        # v1.5.0 olarak dosyaya yaz
```
