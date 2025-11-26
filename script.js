document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================
    // 🔥 1. KONFIGURASI DAN INISIALISASI FIREBASE
    // Konfigurasi dari Projek kot2025buku (Dikekalkan untuk konteks penuh)
    // =================================================================
    const firebaseConfig = {
        apiKey: "AIzaSyCiCwB6n2evOajLi91IKjBklWaHTPODFFk",
        authDomain: "kot2025buku.firebaseapp.com",
        projectId: "kot2025buku",
        storageBucket: "kot2025buku.firebasestorage.app",
        messagingSenderId: "295981114262",
        appId: "1:295981114262:web:ee953afd33559526efb3b7"
    };

    // Inisialisasi Firebase
    // Hanya inisialisasi jika ia belum diinisialisasi untuk mengelakkan ralat berulang
    let app;
    try {
        app = firebase.initializeApp(firebaseConfig);
    } catch(e) {
        app = firebase.app();
    }
    const storage = app.storage();
    const storageRef = storage.ref(); 
    
    // --- 1. KOD UNTUK FLASH PAGE (Dibiarkan untuk konteks) ---\
    const flashPage = document.getElementById('flash-page');
    const FADE_TIMEOUT_MS = 10000; 

    function handleFlashPage() {
        setTimeout(() => {
            if (flashPage) { // Tambah semakan null
                flashPage.classList.add('fade-out');
                setTimeout(() => {
                    flashPage.style.display = 'none';
                }, 1000); // Masa peralihan (transition time)
            }
        }, FADE_TIMEOUT_MS);
    }
    
    // Hanya panggil jika elemen flash page wujud
    if (flashPage) {
         handleFlashPage();
    }
    // ----------------------------------------------------------------

    
    // --- 2. KOD UNTUK NAVIGASI KANDUNGAN (PDF, CSV & PAUTAN LUARAN) ---
    
    // Fail Dokumen/Kandungan
    const documentFiles = [
        { name: "Tentatif Program", type: "csv", file: "TENTATIF.csv", icon: "fa-calendar-days" },
        { name: "Rekod Kejohanan", type: "pdf", file: "REKOD KEJOHANAN.pdf", icon: "fa-medal" },
        // Item Baharu: Peserta Kejohanan
        { name: "Peserta Kejohanan", type: "csv-filterable", file: "peserta.csv", icon: "fa-users" },
        // Item Baharu: Laman Keputusan
        { name: "Laman Keputusan", type: "link", url: "https://ediharianto1974.github.io/sukan/", icon: "fa-trophy" } 
    ];

    const allItems = documentFiles; 

    const navContainer = document.getElementById('pdf-navigation');
    const pdfContainer = document.getElementById('pdf-container');
    const pdfFrame = document.getElementById('pdf-frame');
    const csvContent = document.getElementById('csv-content');
    const currentPdfName = document.getElementById('current-pdf-name');
    
    // Elemen baharu untuk penapisan
    const filterControls = document.getElementById('filter-controls');
    const filterTahun = document.getElementById('filter-tahun');
    const filterAcara = document.getElementById('filter-acara');
    const filterRumah = document.getElementById('filter-rumah');

    pdfFrame.style.display = 'none';
    csvContent.style.display = 'block'; 
    filterControls.style.display = 'none'; 
    currentPdfName.textContent = allItems[0].file;
    
    let currentData = []; 
    let currentItemType = allItems[0].type;
    
    const ACARA_HEADER_NAME = 'ACARA';

    // Fungsi untuk memuatkan, memaparkan, dan MENAPIS kandungan CSV
    function loadCSVContent(filePath, isFilterable = false, filter = {}) {
        csvContent.innerHTML = `<p>Memuatkan ${filePath}...</p>`; 
        filterControls.style.display = 'none';

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ralat HTTP! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                // KOD DIPERBAIKI: Guna RegEx untuk split baris
                const rows = data.split(/[\r\n]+/).filter(row => row.trim() !== '');
                
                if (rows.length === 0) {
                    csvContent.innerHTML = '<p>Fail CSV kosong atau tidak sah.</p>';
                    return;
                }
                
                // Simpan data mentah (hanya sekali jika isFilterable)
                if (isFilterable && currentData.length === 0) {
                    currentData = rows;
                    populateFilters(rows);
                }
                
                const dataToProcess = isFilterable ? currentData : rows;

                // Logik untuk menukar CSV kepada jadual HTML
                const table = document.createElement('table');
                table.classList.add('data-table');
                let html = '';
                
                // Header (baris pertama CSV)
                const headers = dataToProcess[0].split(',');
                html += '<thead><tr>';
                headers.forEach(header => {
                    html += `<th>${header.trim().toUpperCase()}</th>`;
                });
                html += '</tr></thead><tbody>';
                
                // Baris Data (baris kedua dan seterusnya)
                for (let i = 1; i < dataToProcess.length; i++) {
                    const cells = dataToProcess[i].split(',');
                    
                    // Indeks lajur untuk penapisan
                    const headersTrimmed = headers.map(h => h.trim().toUpperCase());
                    const idxTahun = headersTrimmed.indexOf('TAHUN');
                    const idxRumah = headersTrimmed.indexOf('RUMAH');
                    const idxAcara = headersTrimmed.indexOf(ACARA_HEADER_NAME); // Akan jadi 3
                    
                    // *** PERTAMA: SEMAK KEWUJUDAN LAJUR ACARA (TIDAK BOLEH UNDEFINED) ***
                    if (idxAcara === -1 || cells.length <= idxAcara) {
                        // Jika baris terlalu pendek, langkau terus untuk mengelakkan ralat 'trim'
                        continue; 
                    }
                    // *******************************************************************
                    
                    let isVisible = true;
                    if (isFilterable) {
                        
                        // Logik Penapisan
                        if (filter.tahun && idxTahun !== -1 && cells[idxTahun].trim() !== filter.tahun) {
                            isVisible = false;
                        }
                        if (filter.rumah && idxRumah !== -1 && cells[idxRumah].trim() !== filter.rumah) {
                            isVisible = false;
                        }
                        if (filter.acara) {
                            let cellAcara = cells[idxAcara].trim().replace(/^"|"$/g, ''); // Buang petikan dari nilai acara
                            // Tiada lagi logik penyatuan acara
                            
                            if (cellAcara !== filter.acara) {
                                isVisible = false;
                            }
                        }
                    }

                    if (isVisible && cells.length === headers.length && cells.some(cell => cell.trim() !== '')) { 
                        html += '<tr>';
                        cells.forEach(cell => {
                            // Guna regex untuk keluarkan petikan berganda jika ada
                            html += `<td>${cell.trim().replace(/^"|"$/g, '')}</td>`;
                        });
                        html += '</tr>';
                    }
                }
                
                html += '</tbody>';
                table.innerHTML = html;
                
                csvContent.innerHTML = ''; 
                csvContent.appendChild(table);

                if (isFilterable) {
                    filterControls.style.display = 'block';
                }

            })
            .catch(error => {
                console.error('Ralat memuatkan CSV:', error);
                csvContent.innerHTML = `<p style="color: red;">Gagal memuatkan ${filePath}. Sila semak konsol.</p>`;
            });
    }

    // Fungsi untuk mengisi dropdown penapis
    function populateFilters(rows) {
        const headers = rows[0].split(',').map(h => h.trim().toUpperCase());
        const idxTahun = headers.indexOf('TAHUN');
        const idxRumah = headers.indexOf('RUMAH');
        const idxAcara = headers.indexOf(ACARA_HEADER_NAME); // Akan jadi 3

        const uniqueTahun = new Set();
        const uniqueRumah = new Set();
        const uniqueAcaraRaw = new Set(); 
        const uniqueAcara = new Set();
        
        // LOG DIAGNOSTIK MUKTAMAD
        console.log("-----------------------------------------");
        console.log("DIAGNOSTIK ACARA CSV (DEBUG MUKTAMAD):");
        console.log("HEADERS DITEMUI:", headers);
        console.log("INDEX ACARA (idxAcara):", idxAcara);
        
        if (idxAcara === -1) {
             console.error("Ralat: Gagal mencari lajur 'ACARA'. Sila semak ejaan header.");
        }
        // **************************************************
        
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split(',');
            
            if (cells.length <= idxAcara) {
                continue; 
            }
            
            if (cells.length === headers.length) { // Semak jika bilangan sel sepadan dengan header
                if (idxTahun !== -1) uniqueTahun.add(cells[idxTahun].trim());
                if (idxRumah !== -1) uniqueRumah.add(cells[idxRumah].trim());
                
                
                if (idxAcara !== -1) {
                    let acaraValue = cells[idxAcara].trim().replace(/^"|"$/g, '');
                    
                    // DEBUG: Tambah nilai mentah
                    uniqueAcaraRaw.add(acaraValue);
                    
                    // Tambah log khas untuk baris RELAY (atau baris yang mungkin bermasalah)
                    if (acaraValue.toUpperCase().includes('RELAY') || i < 5 || i > rows.length - 5) { 
                        console.log(`Baris ${i} (Acara Mentah): ${acaraValue}`);
                    }
                    
                    // TIADA LOGIK PENYATUAN ACARA: Hanya tambah nilai acara yang ditemui
                    if (acaraValue) uniqueAcara.add(acaraValue);
                }
            }
        }
        
        // LOG DIAGNOSTIK
        console.log("-----------------------------------------");
        console.log("Nilai Acara UNIK AKHIR:", Array.from(uniqueAcara));
        console.log("-----------------------------------------");
        
        // Bersihkan dan isi dropdown
        [filterTahun, filterAcara, filterRumah].forEach(dropdown => dropdown.innerHTML = `<option value="">Semua ${dropdown.id.split('-')[1].charAt(0).toUpperCase() + dropdown.id.split('-')[1].slice(1)}</option>`);

        Array.from(uniqueTahun).sort().forEach(val => {
            if (val) filterTahun.innerHTML += `<option value="${val}">${val}</option>`;
        });
        Array.from(uniqueRumah).sort().forEach(val => {
            if (val) filterRumah.innerHTML += `<option value="${val}">${val}</option>`;
        });
        // Menggunakan uniqueAcara 
        Array.from(uniqueAcara).sort().forEach(val => {
            if (val) filterAcara.innerHTML += `<option value="${val}">${val}</option>`;
        });
    }
    
    // Pengendali perubahan dropdown (Penapisan)
    function handleFilterChange() {
        if (currentItemType !== 'csv-filterable' || currentData.length === 0) return;

        const filters = {
            tahun: filterTahun.value,
            acara: filterAcara.value,
            rumah: filterRumah.value
        };
        
        loadCSVContent(document.querySelector('.pdf-button.active').dataset.file, true, filters);
    }

    filterTahun.addEventListener('change', handleFilterChange);
    filterAcara.addEventListener('change', handleFilterChange);
    filterRumah.addEventListener('change', handleFilterChange);

    // Panggil fungsi untuk memuatkan item pertama (TENTATIF.csv)
    loadCSVContent(allItems[0].file);


    function loadContent(item, button) {
        document.querySelectorAll('.pdf-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        currentItemType = item.type; 

        if (item.type === "link") {
            window.open(item.url, '_blank'); 
            
        } else if (item.type === "pdf") {
            pdfContainer.style.display = 'block';
            filterControls.style.display = 'none';
            pdfFrame.style.display = 'block';
            csvContent.style.display = 'none'; 
            pdfFrame.src = item.file;
            currentPdfName.textContent = item.file;
            pdfFrame.style.height = '650px'; 
            
        } else if (item.type === "csv") {
            // TENTATIF Program (CSV biasa)
            currentData = []; 
            pdfContainer.style.display = 'block';
            filterControls.style.display = 'none';
            pdfFrame.style.display = 'none'; 
            csvContent.style.display = 'block'; 
            currentPdfName.textContent = item.file;
            loadCSVContent(item.file, false); 
            
        } else if (item.type === "csv-filterable") {
             // Peserta Kejohanan (CSV dengan penapis)
            pdfContainer.style.display = 'block';
            pdfFrame.style.display = 'none'; 
            csvContent.style.display = 'block'; 
            currentPdfName.textContent = item.file;
            
            // Muat semula dengan nilai penapis semasa (jika ada)
            loadCSVContent(item.file, true, {
                tahun: filterTahun.value,
                acara: filterAcara.value,
                rumah: filterRumah.value
            });
        }
        
        if (item.type !== "link") {
             document.querySelector('.pdf-viewer h2').innerHTML = `<i class="fa-solid fa-file-pdf"></i> Paparan Dokumen`;
        }
    }
    
    // KOD FIREBASE (Dikekalkan di sini)
    const uploadForm = document.getElementById('upload-form');
    const imageUpload = document.getElementById('image-upload');
    const uploadStatus = document.getElementById('upload-status');
    const uploadedImagePreview = document.getElementById('uploaded-image-preview');
    const previewCaption = document.getElementById('preview-caption');

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const file = imageUpload.files[0];
            
            if (!file) {
                uploadStatus.textContent = "Sila pilih fail untuk dimuat naik.";
                uploadStatus.style.color = 'red';
                return;
            }
            
            uploadStatus.textContent = "Memuat naik...";
            uploadStatus.style.color = 'blue';

            // Nama fail unik
            const uniqueFileName = `${Date.now()}_${file.name}`;
            const imageRef = storageRef.child('images/' + uniqueFileName);
            
            const uploadTask = imageRef.put(file);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    uploadStatus.textContent = `Muat naik: ${progress.toFixed(2)}%`;
                }, 
                (error) => {
                    console.error("Ralat Muat Naik Firebase:", error);
                    uploadStatus.textContent = `Muat naik gagal. Sila cuba lagi. Ralat: ${error.message}`;
                    uploadStatus.style.color = 'red';
                }, 
                () => {
                    // Muat naik berjaya!
                    uploadStatus.textContent = `Muat naik berjaya! Mencari URL...`;
                    
                    // Dapatkan URL muat turun
                    imageRef.getDownloadURL().then((downloadURL) => {
                        
                        uploadStatus.textContent = "Muat naik berjaya! Gambar telah disimpan di pelayan.";
                        uploadStatus.style.color = 'green';
                        imageUpload.value = ''; // Kosongkan input
                        
                        // Paparkan Gambar dari Firebase URL
                        uploadedImagePreview.src = downloadURL; 
                        uploadedImagePreview.style.display = 'block';
                        previewCaption.textContent = `Pratonton gambar yang baru dimuat naik: ${uniqueFileName}`;
                        previewCaption.style.display = 'block';

                    }).catch((error) => {
                        console.error("Ralat mendapatkan URL:", error);
                        uploadStatus.textContent = "Muat naik berjaya, tetapi gagal mendapatkan URL gambar.";
                        uploadStatus.style.color = 'orange';
                    });
                }
            );
        });
    }

    allItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<i class="fa-solid ${item.icon}"></i> ${item.name}`; 
        button.className = 'pdf-button';
        button.dataset.file = item.file || item.url; 
        
        if (index === 0) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            loadContent(item, button);
        });
        navContainer.appendChild(button);
    });
    // ---------------------------------
});
