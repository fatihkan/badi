# Badi Komut Indeksi

> 50 komut | 10 kategori

## Oturum Yonetimi
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/start` | Oturumu baslat, oncelikleri belirle | Her oturum basi |
| `/sync` | Oturum ortasinda baglam yenile | Gerektiginde |
| `/clear` | Baglami temizle ve sifirla | Token limiti yaklastiginda |
| `/wrap-up` | Gun sonu rituel, ozet ve yarin plani | Her oturum sonu |

## Kalite Kontrol
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/audit` | Kod kalitesi denetimi (T1-T4 seviyeleri) | Ozellik tamamlandiginda |
| `/review` | Derinlemesine kod incelemesi | PR oncesi |
| `/doctor` | Badi konfigurasyonunu dogrula | Ayda bir veya sorun oldugunda |

## Dagitim ve Surum
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/release` | Surum notlari olustur | Surum oncesi |
| `/launch` | Urun lansman plani | Yeni urun/ozellik |
| `/deploy` | Dagitim kontrol listesi | Dagitim oncesi |
| `/hotfix` | Acil duzeltme is akisi | Uretim sorunu |
| `/changelog` | Git'ten degisiklik gunlugu olustur | Surum oncesi |

## Koordinasyon
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/standup` | Gunluk toplanti ozeti | Her sabah |
| `/retro` | Sprint retrospektifi | Sprint sonu |
| `/onboard` | Proje alistirma | Yeni proje/uye |
| `/handoff` | Is teslim brifingi | Gorev devri |

## Analiz ve Strateji
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/debt-map` | Teknik borc haritasi | Ayda bir |
| `/competitive-intel` | Rekabet analizi | Strateji planlamasi |
| `/drift-detect` | Konfigurasyon sapma tespiti | Ayda bir |
| `/system-audit` | Derin altyapi denetimi | Ayda bir |
| `/brief` | Proje brifingi olustur | Yeni proje |
| `/proposal` | Musteri teklifi olustur | Teklif istendiginde |

## Destek ve Kocluk
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/coach` | Veri odakli is kaliplari analizi | Haftalik |
| `/unstick` | Tikaniklik cozme | Sorun yasadiginda |
| `/report` | Profesyonel rapor olustur | Raporlama gerektiginde |
| `/playbook` | Is akisini komuta donustur | Tekrarlanan islemler |

## Guvenlik ve Performans
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/health` | Sistem sagligi kontrolu | Hafta basi |
| `/security-scan` | Guvenlik acigi taramas | Sprint sonu |
| `/perf-check` | Performans profilleme | Ozellik tamamlandiginda |
| `/api-doc` | API dokumantasyonu olustur | API degisikliginde |

## Yazilim Muhendisligi
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/scaffold` | Kod iskelesi olusturma (modul, API, CRUD) | Yeni bilesen olusturulacaginda |
| `/refactor` | Kod kokusu tespiti ve refactoring plani | Kod kalitesi iyilestirmesinde |
| `/adr` | Mimari Karar Kaydi (ADR) olustur | Onemli teknik kararlarda |
| `/post-mortem` | Olay sonrasi analiz raporu | Uretim olayi sonrasinda |
| `/docs-audit` | Dokumantasyon denetimi | Ayda bir veya buyuk degisiklik sonrasi |
| `/architect` | Proje planlama — fikirden 5 dokuman uret | Yeni proje baslatildiginda |
| `/spec-check` | Spesifikasyon uyum kontrolu | Gelistirme sirasinda |

## Icerik Uretimi ve Sosyal Medya
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/icerik-basla` | Gunluk icerik seansini baslat | Her gun sabah |
| `/icerik-plan` | Haftalik icerik planlama seansi | Haftalik (Pazar aksami) |
| `/icerik-durum` | Icerik uretim durumu paneli | Gunluk kontrol |
| `/icerik-kapat` | Gun sonu icerik kapanis rituelu | Her gun aksam |
| `/icerik-fikir` | Yapilandirilmis icerik fikir listesi uret | Fikir tikanikligi |
| `/icerik-uret` | Sosyal medya icerigi uret (post, caption, gorsel brief) | Icerik gerektiginde |
| `/gorsel-brief` | Gorsel tasarim brifingi ve AI prompt olustur | Gorsel gerektiginde |
| `/video-senaryo` | Video senaryosu yaz (Reels, Shorts, TikTok, YouTube) | Video planlandiginda |
| `/icerik-takvimi` | Haftalik/aylik icerik takvimi olustur | Hafta/ay basinda |
| `/marka-sesi` | Marka sesi rehberi tanimla ve yonet | Ilk kurulum ve guncelleme |
| `/karousel` | Karousel (coklu kare) icerik olustur | Egitici/liste icerigi icin |

## Dashboard ve Plugin
| Komut | Aciklama | Tetikleyici |
|-------|----------|-------------|
| `/dashboard` | Gunluk istatistik paneli | Gerektiginde |
| `/plugin` | Plugin yukleme/kaldirma/listeleme | Plugin islemlerinde |
