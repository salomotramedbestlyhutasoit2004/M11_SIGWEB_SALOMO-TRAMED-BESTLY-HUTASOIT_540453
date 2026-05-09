# M11_SIGWEB_SALOMO TRAMED BESTLY HUTASOIT_540453

# WebGIS Latihan Mandiri - OGC Services

WebGIS ini dibangun menggunakan OpenLayers dengan layanan standar OGC (WMS dan WFS).

## Kriteria

- Minimal 1 layer WMS + 1 layer WFS dari sumber publik (GeoServer `topp:states`).
- Toggle Visibility tiap layer (Bisa disembunyikan/ditampilkan).
- Popup atribut saat fitur WFS diklik.
- Bonus: GetFeatureInfo untuk WMS layer (Muncul popup saat gambar WMS diklik).
- Bonus: CQL_FILTER interaktif (Dropdown UI) yang mensinkronisasi WMS dan WFS.
- Bonus: Analisis perbandingan layer disajikan sebagai WMS vs WFS.

## Analisis Perbandingan: WMS vs WFS

Berdasarkan implementasi pada aplikasi ini, berikut adalah perbandingan antara WMS dan WFS menggunakan dataset yang sama:

### 1. WMS (Web Map Service)

- Konsep: Server me-render data spasial menjadi sebuah file gambar statis (Tile/Raster seperti PNG) lalu mengirimkannya ke klien (browser).
- Kelebihan: Sangat ringan dan cepat dimuat oleh browser meskipun datanya sangat masif (jutaan fitur) karena browser hanya perlu menampilkan gambar.
- Interaksi: Karena berupa gambar, klien tidak memiliki data atribut aslinya. Untuk melihat data (seperti popup), klien harus melakukan request tambahan ke server menggunakan perintah `GetFeatureInfo`.

### 2. WFS (Web Feature Service)

- Konsep: Server mengirimkan data mentah berupa fitur vektor (GeoJSON/GML) beserta seluruh atributnya ke klien. Proses rendering (menggambar garis/warna) dilakukan sepenuhnya oleh browser klien (OpenLayers).
- Kelebihan: Sangat interaktif. Karena data sudah ada di dalam memory browser, klien bisa langsung memunculkan popup saat diklik tanpa perlu request bolak-balik ke server. Klien juga bisa mengubah styling (warna/bentuk) secara bebas.
- Kelemahan: Jika datanya terlalu besar dan berat, browser klien bisa menjadi lambat atau hang karena harus merender ribuan/jutaan titik koordinat secara langsung.
