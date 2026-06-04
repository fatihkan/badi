Refactoring command. Detects code smells and creates a safe refactoring plan.

# Gerekli Araclar
- Read (kod okuma)
- Grep (kalip tarama)
- Glob (dosya bulma)
- Agent (refactoring-advisor ajani)
- Bash (test calistirma)

# Prosedur (5 Adim)

### Adim 1: Kapsami Belirle
- Belirli dosya/fonksiyon mu yoksa modul mu?
- Kullanicinin hedefi nedir? (performans, okunabilirlik, test edilebilirlik, SOLID uyumu)

### Adim 2: Refactoring-Advisor Ajanina Devret
Ajana su bilgileri ilet:
- Hedef dosya/dosyalar
- Kullanicinin amaci
- Mevcut test kapsami durumu

### Adim 3: Oneri Incelemesi
Ajanin onerilerini kullaniciya sun:
- Her oneri icin once/sonra ornegi
- Risk degerlendirmesi
- Etkilenecek diger dosyalar

### Adim 4: Onaylanan Degisiklikleri Uygula
Kullanici onayiyla:
- Refactoring adimlarini sirali uygula
- Her adimdan sonra testleri calistir
- Basarisiz olursa geri al

### Adim 5: Dogrula ve Belgele
- Tum testlerin gectigini dogrula
- Degisiklik ozetini gunluk nota ekle
- Buyuk refactoring'ler icin ADR olusturmayi oner

# Cikti Formati
```
=== BADI REFACTORING ===
Kapsam: [dosya/modul]
Tespit: [kod kokusu sayisi]
Uygulanan: [refactoring sayisi]
Testler: GECTI / BASARISIZ
========================
```
