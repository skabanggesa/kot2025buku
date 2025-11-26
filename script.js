document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================
    // 🔥 1. KONFIGURASI DAN INISIALISASI
    // KOD FIREBASE DIBUANG sepenuhnya kerana fungsi Muat Naik Gambar telah diganti
    // =================================================================
    
    // --- 1. KOD UNTUK FLASH PAGE ---
    const flashPage = document.getElementById('flash-page');
    const FADE_TIMEOUT_MS = 10000; 

    function handleFlashPage() {
        setTimeout(() => {
            flashPage.classList.add('fade-out');
            setTimeout(() => {
                flashPage.style.display = 'none';
            }, 1000); 
        }, FADE_TIMEOUT_MS);
    }
    handleFlashPage();
    // ---------------------------------
    
    
    // --- 2. KOD UNTUK NAVIGASI KANDUNGAN (PDF, CSV & PAUTAN LUARAN) ---
    
    // Fail Dokumen/Kandungan (DIUBAHSUAI mengikut spesifikasi baharu)
    const documentFiles = [
        { name: "Tentatif Program", type: "csv", file: "TENTATIF.csv", icon: "fa-calendar-days" },
        { name: "Rekod Kejohanan", type: "pdf", file: "REKOD KEJOHANAN.pdf", icon: "fa-medal" },
        // Item Baharu: Peserta Kejohanan menggantikan Peserta Rumah
        { name: "Peserta Kejohanan", type: "csv-filterable", file: "peserta.csv", icon: "fa-users" },
        // Item Baharu: Laman Keputusan menggantikan Muat Naik Gambar
        { name: "Laman Keputusan", type: "link", url: "https://ediharianto1974.github.io/sukan/", icon: "fa-trophy" } 
    ];

    const allItems = documentFiles; // Senarai item baharu

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
    filterControls.style.display = 'none'; // Sembunyikan kawalan penapis secara lalai
    currentPdfName.textContent = allItems[0].file;
    
    let currentData = []; // Untuk menyimpan data CSV bagi penapisan
    let currentItemType = allItems[0].type;

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
                const rows = data.split('\n').filter(row => row.trim() !== '');
                if (rows.length === 0) {
                    csvContent.innerHTML = '<p>Fail CSV kosong atau tidak sah.</p>';
                    return;
                }
                
                // Simpan data mentah (hanya sekali jika isFilterable)
                if (isFilterable && currentData.length === 0) {
                    currentData = rows;
                    populateFilters(rows);
                }
                
                // Jika isFilterable, gunakan data tersimpan; jika tidak, gunakan data yang dimuatkan
                const dataToProcess = isFilterable ? currentData : rows;

                // Logik untuk menukar CSV kepada jadual HTML
                const table = document.createElement('table');
                table.classList.add('data-table');
                let html = '';
                
                // Header (baris pertama CSV)
                // Baris header akan dipaparkan tanpa penapisan
                const headers = dataToProcess[0].split(',');
                html += '<thead><tr>';
                headers.forEach(header => {
                    html += `<th>${header.trim().toUpperCase()}</th>`;
                });
                html += '</tr></thead><tbody>';
                
                // Baris Data (baris kedua dan seterusnya)
                for (let i = 1; i < dataToProcess.length; i++) {
                    const cells = dataToProcess[i].split(',');
                    // Laksanakan penapisan jika diperlukan
                    let isVisible = true;
                    if (isFilterable) {
                        // Indeks lajur untuk penapisan
                        const headersTrimmed = headers.map(h => h.trim().toUpperCase());
                        const idxTahun = headersTrimmed.indexOf('TAHUN');
                        const idxRumah = headersTrimmed.indexOf('RUMAH');
                        const idxAcara = headersTrimmed.indexOf('ACARA');

                        // Logik Penapisan
                        if (filter.tahun && idxTahun !== -1 && cells[idxTahun].trim() !== filter.tahun) {
                            isVisible = false;
                        }
                        if (filter.rumah && idxRumah !== -1 && cells[idxRumah].trim() !== filter.rumah) {
                            isVisible = false;
                        }
                        if (filter.acara && idxAcara !== -1 && cells[idxAcara].trim() !== filter.acara) {
                            isVisible = false;
                        }
                    }

                    if (isVisible && cells.length === headers.length && cells.some(cell => cell.trim() !== '')) { 
                        html += '<tr>';
                        cells.forEach(cell => {
                            html += `<td>${cell.trim()}</td>`;
                        });
                        html += '</tr>';
                    }
                }
                
                html += '</tbody>';
                table.innerHTML = html;
                
                csvContent.innerHTML = ''; 
                csvContent.appendChild(table);

                // Paparkan kawalan penapis jika ia adalah fail Peserta Kejohanan
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
        const idxAcara = headers.indexOf('ACARA');

        const uniqueTahun = new Set();
        const uniqueRumah = new Set();
        const uniqueAcara = new Set();
        
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split(',');
            if (cells.length === headers.length) {
                if (idxTahun !== -1) uniqueTahun.add(cells[idxTahun].trim());
                if (idxRumah !== -1) uniqueRumah.add(cells[idxRumah].trim());
                if (idxAcara !== -1) uniqueAcara.add(cells[idxAcara].trim());
            }
        }
        
        // Bersihkan dan isi dropdown
        [filterTahun, filterAcara, filterRumah].forEach(dropdown => dropdown.innerHTML = `<option value="">Semua ${dropdown.id.split('-')[1].charAt(0).toUpperCase() + dropdown.id.split('-')[1].slice(1)}</option>`);

        Array.from(uniqueTahun).sort().forEach(val => {
            if (val) filterTahun.innerHTML += `<option value="${val}">${val}</option>`;
        });
        Array.from(uniqueRumah).sort().forEach(val => {
            if (val) filterRumah.innerHTML += `<option value="${val}">${val}</option>`;
        });
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
        
        // Muat semula kandungan CSV dengan penapis baharu
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
        
        currentItemType = item.type; // Kemaskini jenis item semasa

        if (item.type === "link") {
            // Pengalihan ke URL luaran (Laman Keputusan)
            window.open(item.url, '_blank'); 
            // Kekalkan paparan semasa tanpa perubahan pada pdf-viewer
            
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
            currentData = []; // Kosongkan data penapis
            pdfContainer.style.display = 'block';
            filterControls.style.display = 'none';
            pdfFrame.style.display = 'none'; 
            csvContent.style.display = 'block'; 
            currentPdfName.textContent = item.file;
            loadCSVContent(item.file, false); // 'false' menandakan ia bukan fail yang boleh ditapis
            
        } else if (item.type === "csv-filterable") {
             // Peserta Kejohanan (CSV dengan penapis)
            pdfContainer.style.display = 'block';
            pdfFrame.style.display = 'none'; 
            csvContent.style.display = 'block'; 
            currentPdfName.textContent = item.file;
            // Jika data belum dimuatkan, ia akan memuatkan dan mengisi penapis
            // Jika sudah dimuatkan, ia akan memuatkan dengan penapis kosong
            loadCSVContent(item.file, true, {
                tahun: filterTahun.value,
                acara: filterAcara.value,
                rumah: filterRumah.value
            });
        }
        
        // Kemaskini tajuk Paparan Dokumen (hanya jika bukan pautan)
        if (item.type !== "link") {
             document.querySelector('.pdf-viewer h2').innerHTML = `<i class="fa-solid fa-file-pdf"></i> Paparan Dokumen`;
        }
    }

    allItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<i class="fa-solid ${item.icon}"></i> ${item.name}`; 
        button.className = 'pdf-button';
        // Simpan nama fail/url ke data-attribute untuk kegunaan penapisan
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
