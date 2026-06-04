Project planning command. Turns vague project ideas into 5 structured documents: specification, implementation plan, task list, brand identity, and a kickoff prompt.

# Gerekli Araclar
- Read (referans dosyalari, mevcut proje bilgisi)
- Write (5 dokuman + TaskBoard entegrasyonu)
- Agent (project-architect ajani)
- Bash (proje analizi)

# Prosedur (7 Adim)

### Adim 1: Proje Fikrini Al
Kullanicidan projeyi tanimlamasini iste:
- Proje fikri (1-2 cumle yeterli, ham olabilir)
- Proje boyutu tahmini: Kucuk (hafta sonu) / Orta / Buyuk

### Adim 2: Project-Architect Ajanini Etkinlestir
Ajana devret:
- Proje fikrini ilet
- Boyut tahminine gore soru katmanini belirle
- Interaktif kesif surecini baslat (Katman 1-3 sorular)

### Adim 3: Referanslari Yukle
Ajan su referans dosyalarini okur:
- `.claude/references/design-patterns.md`
- `.claude/references/specification-guide.md`
- `.claude/references/implementation-guide.md`
- `.claude/references/tasks-guide.md`
- `.claude/references/tech-stacks.md`
- `.claude/references/elicitation-guide.md`

### Adim 4: Tech Stack Secimi
Interaktif tech stack danismanligi:
- 8 karar noktasinda secenek sun
- Her secenek icin artilari/eksileri goster
- Kullanicinin onayini al

### Adim 5: 5 Dokumani Olustur
Sirali olarak olustur:
1. `docs/SPECIFICATION.md` — Kapsam, ozellikler, kabul kriterleri
2. `docs/IMPLEMENTATION.md` — Tech stack, kaliplar, dizin yapisi
3. `docs/TASKS.md` — Sirali gorev listesi (faz bazli)
4. `docs/BRANDING.md` — Gorsel kimlik (kullaniciya yonelik projelerde)
5. `docs/PROMPT.md` — Tek seferlik calistirma prompt'u

### Adim 6: Badi Entegrasyonu
Uretilen dokumanlarI Badi sistemine entegre et:
- TASKS.md'den gorevleri `.claude/workspace/TaskBoard.md`'ye aktar
- IMPLEMENTATION.md'den temel mimari kararlarI `knowledge-base.md`'ye aday goster
- SPECIFICATION.md ozetini `memory.md`'ye ekle

### Adim 7: Sonraki Adimlar
Kullaniciya yonlendir:
- `/scaffold` ile proje yapisini olustur (IMPLEMENTATION.md'den)
- `/start` ile gelistirme oturumunu baslat
- `/spec-check` ile uyum kontrolu yap (gelistirme sirasinda)

# Cikti Formati
```
=== BADI PROJE MIMARISI ===
Proje: [proje adi]
Boyut: [kucuk/orta/buyuk]
Tech Stack: [ana teknolojiler]

Olusturulan Dokumanlar:
  + docs/SPECIFICATION.md
  + docs/IMPLEMENTATION.md
  + docs/TASKS.md
  + docs/BRANDING.md (varsa)
  + docs/PROMPT.md

Entegrasyon:
  ~ TaskBoard.md guncellendi ([sayi] gorev eklendi)
  ~ memory.md guncellendi (proje ozeti)

Sonraki:
  1. /scaffold — Proje yapisini olustur
  2. /start — Gelistirmeye basla
==============================
```
