# Katki Rehberi

Badi'ye katki yapmak istediginiz icin tesekkurler!

## Nasil Katki Yapilir

1. Repoyu fork'layin
2. `main` dalinden yeni bir dal olusturun
3. Odakli degisiklikler yapin, aciklayici commit mesajlari yazin
4. Kapsamli dar tutun, gereksiz refactoring eklemeyin
5. Mevcut dosya yapisi ve isimlendirme kurallarina uyun
6. Hassas veri veya konfigur  asyon dosyasi commit etmeyin

## PR Gereksinimleri

PR aciklamanizda su bilgiler bulunmali:
- Neyin degistirildigi
- Neden degistirildigi
- Nasil dogrulandigi

## Dogrulama

PR gondermeden once su komutlari calistirin:

```bash
npm install
npm run lint
npm test
```

## Degerlendirenler Su Kriterlere Bakar

- Teknik dogruluk
- Uygun kapsam (gereksiz degisiklik yok)
- Proje yapisi ve kurallarla uyum
- Turkce icerik kalitesi
