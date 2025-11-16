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
    // ... (Kod FLASH PAGE, NAVIGASI, dan MUAT NAIK GAMBAR) ...
    // ... (Fungsi loadContent kini mengendalikan jenis "upload") ...
    // ... (Tatasusunan allItems kini mengandungi item { name: "Muat Naik Gambar", type: "upload", icon: "fa-camera" }) ...
    // ... (Logik muat naik di bawah kini menggunakan storage.ref().child().put(file) yang sebenar) ...

    // [Kod selebihnya tidak berubah dari versi Firebase terakhir yang berfungsi]
    
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
    
    
    // --- 2. KOD UNTUK NAVIGASI PDF & MUAT NAIK GAMBAR SEBAGAI TAB ---
    
    // Fail PDF
    const pdfFiles = [
        { name: "Tentatif Program", type: "pdf", file: "TENTATIF.pdf", icon: "fa-calendar-days" },
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

    const allItems = [...pdfFiles, imageUploadItem]; 

    const navContainer = document.getElementById('pdf-navigation');
    const pdfContainer = document.getElementById('pdf-container');
    const uploadContainer = document.getElementById('upload-container');
    const pdfFrame = document.getElementById('pdf-frame');
    const currentPdfName = document.getElementById('current-pdf-name');

    uploadContainer.style.display = 'none';
    pdfFrame.src = allItems[0].file;
    currentPdfName.textContent = allItems[0].file;

    function loadContent(item, button) {
        document.querySelectorAll('.pdf-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        if (item.type === "pdf") {
            pdfContainer.style.display = 'block';
            uploadContainer.style.display = 'none';
            pdfFrame.src = item.file;
            currentPdfName.textContent = item.file;
            pdfFrame.style.height = '650px'; 
            
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