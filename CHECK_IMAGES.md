# Film Görselleri Kontrol Listesi

## Klasör Yapısı

Görseller şu klasörlerde olmalı:

```
public/images/movies/
├── nowshowing/          # Şu anda yayında olan filmler
│   ├── {film-adi}.jpg
│   └── {film-adi}-slider.png
└── comingsoon/          # Gelecekte yayınlanacak filmler
    ├── {film-adi}.jpg
    └── {film-adi}-slider.png
```

## Dosya Adı Formatı

Film başlığından dosya adına dönüşüm:
- Büyük/küçük harf → küçük harf
- Özel karakterler kaldırılır (é → e, ü → u)
- Boşluklar → alt çizgi (_)
- Tire (-) korunur

### Örnekler:

| Film Başlığı | Dosya Adı |
|-------------|-----------|
| LES MISÉRABLES – DIE GESCHICHTE VON JEAN VALJEAN | `les_mis_rables_die_geschichte_von_jean_valjean.jpg` |
| BON VOYAGE – BIS HIERHER UND NOCH WEITER | `bon_voyage_bis_hierher_und_noch_weiter.jpg` |
| CHARLIE DER SUPERHUND | `charlie_der_superhund.jpg` |

## Kontrol Komutları

### Windows PowerShell:

```powershell
# Şu anda yayında olan filmler için görselleri kontrol et
Get-ChildItem "public\images\movies\nowshowing\*.jpg" | Select-Object Name

# Gelecekte yayınlanacak filmler için görselleri kontrol et
Get-ChildItem "public\images\movies\comingsoon\*.jpg" | Select-Object Name

# Eksik slider görsellerini bul
$nowShowing = Get-ChildItem "public\images\movies\nowshowing\*.jpg"
foreach ($file in $nowShowing) {
    $sliderName = $file.BaseName + "-slider.png"
    $sliderPath = Join-Path $file.DirectoryName $sliderName
    if (-not (Test-Path $sliderPath)) {
        Write-Host "Eksik slider: $sliderName"
    }
}
```

## Gerekli Görseller

### Şu anda yayında (nowshowing):
- bon_voyage_bis_hierher_und_noch_weiter.jpg
- bon_voyage_bis_hierher_und_noch_weiter-slider.png
- das_system_milch.jpg
- das_system_milch-slider.png
- kein_weg_zuruck.jpg
- kein_weg_zuruck-slider.png
- ... (diğer isComingSoon: false olan filmler)

### Gelecekte yayınlanacak (comingsoon):
- ab_durch_die_mitte.jpg
- ab_durch_die_mitte-slider.png
- charlie_der_superhund.jpg
- charlie_der_superhund-slider.png
- les_mis_rables_die_geschichte_von_jean_valjean.jpg
- les_mis_rables_die_geschichte_von_jean_valjean-slider.png
- ... (diğer isComingSoon: true olan filmler)
