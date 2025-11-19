document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================
    // 🔥 1. KONFIGURASI DAN INISIALISASI FIREBASE
    // Konfigurasi dari Projek kot2025buku
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
    const app = firebase.initializeApp(firebaseConfig);
    const storage = app.storage();
    const storageRef = storage.ref(); 
    
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
    
    
    // --- 2. KOD UNTUK NAVIGASI PDF, CSV & MUAT NAIK GAMBAR SEBAGAI TAB ---
    
    // Fail Dokumen/Kandungan (TENTATIF ditukar kepada CSV)
    const documentFiles = [
        { name: "Tentatif Program", type: "csv", file: "TENTATIF.csv", icon: "fa-calendar-days" },
        { name: "Rekod Kejohanan", type: "pdf", file: "REKOD KEJOHANAN.pdf", icon: "fa-medal" },
        { name: "Peserta Rumah Biru", type: "pdf", file: "PESERTA BIRU.pdf", icon: "fa-water" },
        { name: "Peserta Rumah Kuning", type: "pdf", file: "ATLET RUMAH KUNING.pdf", icon: "fa-sun" },
        { name: "Peserta Rumah Merah", type: "pdf", file: "PESERTA MERAH.pdf", icon: "fa-fire" }
    ];
    
    const imageUploadItem = { 
        name: "Muat Naik Gambar", 
        type: "upload", 
        icon: "fa-camera" 
    };

    const allItems = [...documentFiles, imageUploadItem]; 

    const navContainer = document.getElementById('pdf-navigation');
    const pdfContainer = document.getElementById('pdf-container');
    const uploadContainer = document.getElementById('upload-container');
    const pdfFrame = document.getElementById('pdf-frame');
    const csvContent = document.getElementById('csv-content'); // Elemen baharu untuk paparan CSV
    const currentPdfName = document.getElementById('current-pdf-name');

    uploadContainer.style.display = 'none';
    pdfFrame.style.display = 'none'; // Sembunyikan iframe secara lalai
    csvContent.style.display = 'block'; // Paparkan CSV content secara lalai untuk item pertama
    currentPdfName.textContent = allItems[0].file;

    // Fungsi untuk memuatkan dan memaparkan kandungan CSV
    function loadCSVContent(filePath) {
        // Paparkan status memuatkan
        csvContent.innerHTML = '<p>Memuatkan Tentatif Program...</p>'; 

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ralat HTTP! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                // Logik asas untuk menukar CSV kepada jadual HTML
                const rows = data.split('\n').filter(row => row.trim() !== '');
                if (rows.length === 0) {
                    csvContent.innerHTML = '<p>Fail CSV kosong atau tidak sah.</p>';
                    return;
                }
                
                const table = document.createElement('table');
                table.classList.add('tentatif-table');
                let html = '';
                
                // Header (baris pertama CSV)
                const headers = rows[0].split(',');
                html += '<thead><tr>';
                headers.forEach(header => {
                    html += `<th>${header.trim()}</th>`;
                });
                html += '</tr></thead><tbody>';
                
                // Baris Data (baris kedua dan seterusnya)
                for (let i = 1; i < rows.length; i++) {
                    const cells = rows[i].split(',');
                    // Semak jika bilangan sel sepadan dengan header, elak baris kosong atau rosak
                    if (cells.length === headers.length && cells.some(cell => cell.trim() !== '')) { 
                        html += '<tr>';
                        cells.forEach(cell => {
                            html += `<td>${cell.trim()}</td>`;
                        });
                        html += '</tr>';
                    }
                }
                
                html += '</tbody>';
                table.innerHTML = html;
                
                csvContent.innerHTML = ''; // Kosongkan status memuatkan
                csvContent.appendChild(table);

            })
            .catch(error => {
                console.error('Ralat memuatkan CSV:', error);
                csvContent.innerHTML = `<p style="color: red;">Gagal memuatkan ${filePath}. Sila semak konsol.</p>`;
            });
    }
    
    // Panggil fungsi untuk memuatkan item pertama (TENTATIF.csv)
    loadCSVContent(allItems[0].file);


    function loadContent(item, button) {
        document.querySelectorAll('.pdf-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        if (item.type === "pdf") {
            pdfContainer.style.display = 'block';
            uploadContainer.style.display = 'none';
            pdfFrame.style.display = 'block';
            csvContent.style.display = 'none'; // Sembunyikan paparan CSV
            pdfFrame.src = item.file;
            currentPdfName.textContent = item.file;
            pdfFrame.style.height = '650px'; 
            
        } else if (item.type === "csv") {
            pdfContainer.style.display = 'block';
            uploadContainer.style.display = 'none';
            pdfFrame.style.display = 'none'; // Sembunyikan iframe
            csvContent.style.display = 'block'; // Paparkan paparan CSV
            currentPdfName.textContent = item.file;
            loadCSVContent(item.file);
            
        } else if (item.type === "upload") {
            pdfContainer.style.display = 'none';
            uploadContainer.style.display = 'block';
            document.querySelector('.pdf-viewer h2').innerHTML = `<i class="fa-solid ${item.icon}"></i> ${item.name}`;
        }
    }

    allItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<i class="fa-solid ${item.icon}"></i> ${item.name}`; 
        button.className = 'pdf-button';
        if (index === 0) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            loadContent(item, button);
        });
        navContainer.appendChild(button);
    });
    // ---------------------------------
    
    
    // =================================================================
    // 🔥 3. KOD MUAT NAIK GAMBAR MENGGUNAKAN FIREBASE STORAGE
    // Kod ini dikekalkan kerana logik 'state_changed' untuk kemajuan muat naik telah betul.
    // =================================================================
    const uploadForm = document.getElementById('upload-form');
    const imageUpload = document.getElementById('image-upload');
    const uploadStatus = document.getElementById('upload-status');
    const uploadedImagePreview = document.getElementById('uploaded-image-preview');
    const previewCaption = document.getElementById('preview-caption');


    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        uploadedImagePreview.style.display = 'none'; 
        previewCaption.style.display = 'none'; 
        
        if (imageUpload.files.length === 0) {
            uploadStatus.textContent = "Sila pilih fail untuk dimuat naik.";
            uploadStatus.style.color = 'orange';
            return;
        }

        const file = imageUpload.files[0];
        const fileType = file.type;
        const fileName = file.name;
        
        if (!fileType.startsWith('image/')) {
            uploadStatus.textContent = "Hanya fail gambar (JPG, PNG, GIF, dll.) dibenarkan.";
            uploadStatus.style.color = 'red';
            return;
        }
        
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB maksimum
        if (file.size > MAX_SIZE) {
            uploadStatus.textContent = "Saiz fail melebihi 5MB.";
            uploadStatus.style.color = 'red';
            return;
        }
        
        // Cipta laluan fail unik di Firebase Storage (uploads/timestamp_namafail)
        const uniqueFileName = `${Date.now()}_${fileName}`;
        const imageRef = storageRef.child(`uploads/${uniqueFileName}`); 

        uploadStatus.textContent = `Memuat naik fail: ${fileName} ...`;
        uploadStatus.style.color = '#3498db'; 

        // Mula proses muat naik ke Firebase Storage
        const uploadTask = imageRef.put(file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                // Kemas kini status muat naik
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // Pastikan kemajuan dipaparkan sebagai integer terhampir
                uploadStatus.textContent = `Muat Naik: ${Math.round(progress)}% Selesai`;
                uploadStatus.style.color = '#3498db'; 
            }, 
            (error) => {
                // Pengendalian ralat
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
    // ------------------------------------------
});