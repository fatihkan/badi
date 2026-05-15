# Bilgi Tabani

> Tum ajanlar bu dosyayi oturum basinda okur.
> Yalnizca Denetci (Auditor) onayladiginda yazilir.
> Kaynagi belirtilmeyen kayit girilmez.

## Kaynak Hiyerarsisi
1. **Kullanici mudahalesi** — tarihli, en yuksek oncelik
2. **Ampirik** — denenerek dogrulanan kural
3. **Agent cikarimi** — ajanin gozlemledigini Denetci onayladi

---

## Kesin Kurallar
<!-- Kullanici tarafindan dogrudan belirlenmis kurallar -->

## Platform ve Arac Kurallari
<!-- Arac/platform ile ilgili ogrenilen kurallar -->

## Proje Kaliplari
<!-- Projede tekrar eden yapi/kaliplar -->

### Skill ailesi eklemede "advisory/defensive" siniri
Pentest, security, exploit gibi alanlarda yeni skill ailesi eklerken
Badi yalnizca **advisory/defensive** kapsamla sinirli kalir. Live exploit
execution, payload crafting, C2 operation, weaponization gibi aktif
saldiri yetenekleri vault'a EKLENMEZ — bunlar icin yetkili pentest tool
kullanilir. Skill icerigi: scope-deklare disiplini, OPSEC tagging,
metodoloji, output analizi, raporlama, detection rule yazimi.
[Kaynak: 2026-05-15 pentest-* aile karari]

### `badi ai token` POTANSIYEL raporlar, gercek per-turn yuk degil
Claude Code `.claude/commands/*.md`'yi sadece slash invocation'da yukler;
sistem prompt'una sadece kisa aciklama girer. `.claude/agents/*.md` Agent
tool cagrildiginda yuklenir. `.claude/references/`, `.claude/memory.md`,
`.claude/knowledge-base.md` Claude Code tarafindan otomatik yuklenmez.
Buna gore "88K token kullaniliyor" ifadesi yanltir — bu POTANSIYEL tavan,
gercek baseline ~3-5K (CLAUDE.md + komut/agent advertisement). Token
optimizasyonu uc katmanda planlanmali: baseline (sistem prompt'taki
aciklamalar), invocation cost (komut gövdesi), DX (menu kalabaligi).
[Kaynak: 2026-05-15 v1.26 olcum dogrulamasi]

### STACK_MAP entry kalibi: tek tespit, cok skill
`lib/skills/stack-map.js` icinde bir entry birden cok skill onerebilir.
Komponent / aile bazli skill curation icin: ana tespit dosyasi
(scope.md, findings.db gibi) -> 4-5 skill paketi oneren tek entry yaz.
Bu, kullanicinin `badi skills auto-install` ile bir hamlede ilgili
tum kategorileri aktive etmesini saglar.
[Kaynak: 2026-05-15 pentest-engagement entry tasarimi]

## Bilinen Hata Kaliplari
<!-- Daha once karsilasilan ve cozulen hatalar -->
