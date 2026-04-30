# SafePredict Project Workplan

Dokumen ini merangkum alur pengerjaan proyek SafePredict berdasarkan project brief dan riset teknis pendukung. Tujuannya adalah memberi urutan kerja yang jelas untuk tim hackathon, dari validasi masalah sampai prototype siap demo.

## 1. Tujuan Produk

Membangun platform yang tidak hanya mendeteksi pelanggaran K3 dari CCTV, tetapi juga memprediksi peningkatan risiko kecelakaan berdasarkan gabungan data visual dan data operasional pabrik.

Target output utama:

1. Deteksi PPE real-time dari feed CCTV existing.
2. Logging near-miss dan violation secara otomatis.
3. Risk score prediktif per area dan per waktu.
4. Dashboard supervisor dengan heatmap, tren, dan rekomendasi aksi.
5. Laporan K3 yang bisa diekspor untuk kebutuhan operasional.

## 2. Dasar Riset yang Dipakai

Riset berikut dipakai sebagai landasan desain sistem:

- OSHA menyatakan shift panjang dan shift malam meningkatkan risiko cedera dan kelelahan kerja; ini memperkuat fitur risk scoring berbasis shift dan durasi kerja.
- Azure IoT Hub mendukung komunikasi dua arah, routing telemetry, autentikasi perangkat, dan integrasi edge-to-cloud.
- Dokumentasi Azure IoT menjelaskan pola cloud-connected dan edge-connected yang cocok untuk pabrik dengan CCTV existing dan kebutuhan inferensi lokal.
- Azure Vision mendukung image analysis, OCR, dan spatial analysis untuk analisis visual berbasis cloud bila dibutuhkan.
- FastAPI cocok untuk backend API karena validasi tipe, dokumentasi OpenAPI otomatis, dan performa yang tinggi.
- scikit-learn cocok untuk preprocessing, model selection, dan baseline prediction.
- XGBoost cocok untuk model tabular risk score karena efisien untuk boosted tree dan fleksibel untuk fitur campuran.

## 3. Arsitektur Target

Alur data yang disarankan:

1. CCTV existing dikonsumsi via RTSP stream.
2. Frame diproses di edge atau service inference untuk deteksi PPE dan near-miss.
3. Event penting dikirim ke backend melalui API atau message pipeline.
4. Data operasional masuk dari upload jadwal shift, jam kerja, dan jadwal maintenance.
5. Feature store sederhana dibentuk dari gabungan visual event dan operasional.
6. Model prediktif menghasilkan risk score per area, per jam, dan per shift.
7. Dashboard menampilkan heatmap, notifikasi, dan histori violation.
8. Laporan K3 di-generate dari data agregat.

Prinsip penting:

- Inference visual harus diprioritaskan di jalur terpisah dari model prediktif tabular.
- Data operasional wajib disimpan rapi karena menjadi pembeda utama dari solusi deteksi biasa.
- Semua output harus mudah didemokan dengan satu skenario pabrik yang konsisten.

## 4. Urutan Pengerjaan

### Fase 0. Scope Lock dan Definition of Done

Durasi: 0.5 - 1 hari

Aktivitas:

- Kunci area demo utama, misalnya press machine atau assembly zone.
- Kunci 3 kelas PPE minimum untuk demo: helmet, vest, shoes.
- Kunci output MVP: deteksi PPE, input shift, risk score, dashboard, alert sederhana.
- Tetapkan metrik demo: latency, akurasi deteksi, dan kegunaan dashboard.

Output:

- Dokumen scope MVP.
- Daftar fitur prioritas dan fitur stretch.

### Fase 1. Data dan Skema

Durasi: 1 - 2 hari

Aktivitas:

- Ambil dataset PPE yang relevan untuk baseline model.
- Definisikan skema event: area, timestamp, jenis PPE, confidence, shift, jam kerja, maintenance age, violation count.
- Siapkan format synthetic shift-accident log untuk training risk model tabular.
- Buat mapping area pabrik dan kategori risiko.

Output:

- Dataset terstruktur.
- Skema JSON/CSV untuk event dan risk features.
- Kamus data sederhana.

### Fase 2. Computer Vision MVP

Durasi: 2 - 4 hari

Aktivitas:

- Fine-tune atau baseline YOLOv8 untuk PPE detection.
- Buat pipeline inference dari RTSP atau video sample.
- Tambahkan logic near-miss logging berbasis rule sederhana, misalnya deteksi person tanpa PPE di area tertentu.
- Simpan hasil deteksi ke storage dan backend log.

Output:

- Model PPE awal.
- Service inference berjalan.
- Contoh log event visual.

### Fase 3. Model Prediksi Risiko

Durasi: 2 - 3 hari

Aktivitas:

- Bentuk fitur tabular dari jadwal shift, durasi kerja, histori violation, dan maintenance.
- Mulai dari baseline model sederhana, lalu naik ke XGBoost jika data cukup.
- Definisikan risk score 0-100 atau 0-1 agar mudah dibaca supervisor.
- Tambahkan penjelasan faktor penyebab risiko, misalnya shift malam, overtime, dan maintenance tertunda.

Output:

- Model risk score.
- Pipeline training dan inference.
- Output faktor risiko yang bisa dipresentasikan.

### Fase 4. Backend dan API

Durasi: 1 - 2 hari

Aktivitas:

- Bangun FastAPI untuk ingest event deteksi, input shift, dan hasil prediksi.
- Buat endpoint untuk dashboard, laporan, dan alert.
- Tambahkan validasi data dan skema response yang konsisten.
- Simpan log ke database ringan atau storage terstruktur.

Output:

- API terdokumentasi.
- Endpoint utama untuk event, risk, report, dan alert.

### Fase 5. Dashboard Supervisor

Durasi: 2 - 4 hari

Aktivitas:

- Bangun dashboard utama dengan ringkasan risk score.
- Tambahkan heatmap area pabrik.
- Tambahkan detail histori violation dan tren mingguan.
- Buat tampilan rekomendasi aksi preventif.

Output:

- Dashboard siap demo.
- Visualisasi risiko yang mudah dibaca juri.

### Fase 6. Alert dan Reporting

Durasi: 1 - 2 hari

Aktivitas:

- Buat notifikasi ketika risk score melewati threshold.
- Generate laporan K3 ringkas yang bisa diekspor PDF atau CSV.
- Buat ringkasan mingguan dan bulanan.

Output:

- Alert real-time sederhana.
- Laporan K3 otomatis.

### Fase 7. Integrasi Demo dan Hardening

Durasi: 1 - 2 hari

Aktivitas:

- Satukan semua komponen end-to-end.
- Uji satu skenario demo lengkap dari CCTV sampai dashboard.
- Perbaiki latency, state management, dan fallback bila video stream gagal.
- Siapkan script demo dan narasi presentasi.

Output:

- Prototype stabil.
- Demo flow yang bisa diulang.

## 5. Pembagian Tugas Tim

### Muhammad Rizal Anditama Nugraha - AI/ML Engineer

- Dataset preparation.
- YOLOv8 training dan evaluasi.
- Risk model tabular.
- Feature engineering dan scoring logic.

### Robi Moreno - IoT

- RTSP ingestion.
- Integrasi alert

### Rahma Fadillah - Frontend & UI/UX & Cloud Engineer

- Dashboard supervisor.
- Heatmap dan visual analytics.
- Alert UI.
- Design system dan flow demo.
- Data pipeline dan storage.
- Backend FastAPI.

## 6. Prioritas MVP

Jika waktu terbatas, urutan prioritasnya:

1. PPE detection dari video.
2. Input shift dan maintenance.
3. Risk score tabular sederhana.
4. Dashboard dengan heatmap.
5. Alert threshold.
6. Laporan otomatis.

Fitur stretch setelah MVP stabil:

- Integrasi HR system.
- Deteksi ergonomi.
- Multi-site support.
- Model explainability yang lebih kaya.

## 7. Risiko Implementasi

1. Dataset visual terlalu kecil atau tidak seimbang.
2. Risk model kurang kuat karena synthetic data.
3. Latency CCTV terlalu tinggi jika semua diproses penuh di backend.
4. Dashboard menjadi terlalu kompleks untuk demo.
5. Integrasi Azure bisa terlalu luas bila tidak dibatasi scope.

Mitigasi:

- Mulai dari baseline sederhana, lalu tingkatkan.
- Gunakan data sintetis hanya untuk memvalidasi konsep, bukan klaim final.
- Gunakan sampling frame dan event-based processing.
- Fokus ke satu area pabrik dan satu demo story yang kuat.

## 8. Definition of Done Demo

Prototype dianggap siap bila:

- Feed video bisa diproses dan menghasilkan deteksi PPE.
- Event deteksi masuk ke backend.
- Risk score tampil di dashboard berdasarkan data operasional.
- Supervisor menerima alert ketika threshold terlewati.
- Laporan K3 bisa diekspor.

## 9. Referensi Utama

- OSHA Worker Fatigue Hazards: https://www.osha.gov/worker-fatigue/hazards
- Azure IoT Hub: https://azure.microsoft.com/en-us/products/iot-hub
- Azure Vision in Foundry Tools: https://azure.microsoft.com/en-us/products/ai-foundry/tools/vision
- Azure IoT architecture guide: https://learn.microsoft.com/en-us/azure/architecture/guide/iot-edge-vision/machine-learning
- FastAPI documentation: https://fastapi.tiangolo.com/
- scikit-learn documentation: https://scikit-learn.org/stable/
- XGBoost documentation: https://xgboost.readthedocs.io/en/stable/

## 10. Catatan Eksekusi

Dokumen ini sengaja dibuat sebagai roadmap kerja, bukan final answer presentasi. Saat implementasi dimulai, fase 1 sampai 4 harus dikerjakan lebih dulu supaya dashboard dan demo bisa diproduksi cepat, lalu fase 5 sampai 7 dipakai untuk penguatan visual dan stabilisasi.