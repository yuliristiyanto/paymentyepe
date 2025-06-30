// Fungsi untuk menangani request GET/POST dari web app
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'login':
        return handleLogin(e);
      case 'getUsers':
        return getUsers();
      case 'addUser':
        return addUser(e);
      case 'updateUser':
        return updateUser(e);
      case 'deleteUser':
        return deleteUser(e);
      case 'getPelanggans':
        return getPelanggans();
      case 'addPelanggan':
        return addPelanggan(e);
      case 'updatePelanggan':
        return updatePelanggan(e);
      case 'deletePelanggan':
        return deletePelanggan(e);
      case 'getPayments':
        return getPayments();
      case 'addPayment':
        return addPayment(e);
      case 'confirmPayment':
        return confirmPayment(e);
      case 'deletePayment':
        return deletePayment(e);
      case 'getReports':
        return getReports(e);
      case 'getCustomerPayments':
        return getCustomerPayments(e);
      default:
        return ContentService.createTextOutput(JSON.stringify({success: false, message: 'Action tidak valid'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk menangani login
function handleLogin(e) {
  const username = e.parameter.username;
  const password = e.parameter.password;
  
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const userSheet = ss.getSheetByName('Users');
  const data = userSheet.getDataRange().getValues();
  
  // Lewati header
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[1] === username && row[2] === hashPassword(password)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        user: {
          username: row[1],
          role: row[3],
          idPelanggan: row[4] || null
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Username atau password salah'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Fungsi untuk hashing password (sederhana)
function hashPassword(password) {
  // Dalam implementasi nyata, gunakan library hashing yang lebih aman
  return Utilities.base64Encode(password);
}

// Fungsi-fungsi untuk manajemen user
function getUsers() {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  
  const users = [];
  for (let i = 1; i < data.length; i++) {
    users.push({
      username: data[i][1],
      role: data[i][3],
      idPelanggan: data[i][4],
      tglDibuat: data[i][5],
      status: data[i][6]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(users))
    .setMimeType(ContentService.MimeType.JSON);
}

function addUser(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Users');
  
  const newUser = [
    Utilities.getUuid(),
    e.parameter.username,
    hashPassword(e.parameter.password),
    e.parameter.role,
    e.parameter.role === 'pelanggan' ? e.parameter.idPelanggan : '',
    new Date().toISOString(),
    e.parameter.status
  ];
  
  sheet.appendRow(newUser);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateUser(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === e.parameter.username) {
      // Update data user
      if (e.parameter.password) {
        sheet.getRange(i+1, 3).setValue(hashPassword(e.parameter.password));
      }
      sheet.getRange(i+1, 4).setValue(e.parameter.role);
      sheet.getRange(i+1, 5).setValue(e.parameter.role === 'pelanggan' ? e.parameter.idPelanggan : '');
      sheet.getRange(i+1, 7).setValue(e.parameter.status);
      
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, message: 'User tidak ditemukan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteUser(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === e.parameter.username) {
      sheet.deleteRow(i+1);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, message: 'User tidak ditemukan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi-fungsi untuk manajemen pelanggan
function getPelanggans() {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pelanggan');
  const data = sheet.getDataRange().getValues();
  
  const pelanggans = [];
  for (let i = 1; i < data.length; i++) {
    pelanggans.push({
      id: data[i][0],
      nama: data[i][1],
      alamat: data[i][2],
      noHp: data[i][3],
      tglPasang: data[i][4],
      paket: data[i][5],
      status: data[i][6]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(pelanggans))
    .setMimeType(ContentService.MimeType.JSON);
}

function addPelanggan(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pelanggan');
  
  const newPelanggan = [
    e.parameter.id,
    e.parameter.nama,
    e.parameter.alamat,
    e.parameter.noHp,
    e.parameter.tglPasang,
    e.parameter.paket,
    e.parameter.status
  ];
  
  sheet.appendRow(newPelanggan);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function updatePelanggan(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pelanggan');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === e.parameter.id) {
      // Update data pelanggan
      sheet.getRange(i+1, 2).setValue(e.parameter.nama);
      sheet.getRange(i+1, 3).setValue(e.parameter.alamat);
      sheet.getRange(i+1, 4).setValue(e.parameter.noHp);
      sheet.getRange(i+1, 5).setValue(e.parameter.tglPasang);
      sheet.getRange(i+1, 6).setValue(e.parameter.paket);
      sheet.getRange(i+1, 7).setValue(e.parameter.status);
      
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, message: 'Pelanggan tidak ditemukan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function deletePelanggan(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pelanggan');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === e.parameter.id) {
      sheet.deleteRow(i+1);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, message: 'Pelanggan tidak ditemukan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi-fungsi untuk manajemen pembayaran
function getPayments() {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pembayaran');
  const data = sheet.getDataRange().getValues();
  
  const payments = [];
  for (let i = 1; i < data.length; i++) {
    payments.push({
      id: data[i][0],
      idPelanggan: data[i][1],
      bulan: data[i][2],
      tahun: data[i][3],
      tglBayar: data[i][4],
      jumlah: data[i][5],
      bukti: data[i][6],
      status: data[i][7],
      diprosesOleh: data[i][8]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(payments))
    .setMimeType(ContentService.MimeType.JSON);
}

function addPayment(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pembayaran');
  
  // Handle file upload
  let fileUrl = '';
  if (e.parameter.bukti) {
    const blob = Utilities.newBlob(Utilities.base64Decode(e.parameter.bukti), e.parameter.mimeType, e.parameter.fileName);
    const file = DriveApp.createFile(blob);
    fileUrl = file.getUrl();
  }
  
  const newPayment = [
    Utilities.getUuid(),
    e.parameter.idPelanggan,
    e.parameter.bulan,
    e.parameter.tahun,
    e.parameter.tglBayar,
    e.parameter.jumlah,
    fileUrl,
    'pending',
    ''
  ];
  
  sheet.appendRow(newPayment);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function confirmPayment(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pembayaran');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === e.parameter.id) {
      // Update status pembayaran
      sheet.getRange(i+1, 8).setValue('lunas');
      sheet.getRange(i+1, 9).setValue(e.parameter.username); // Username yang mengkonfirmasi
      
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, message: 'Pembayaran tidak ditemukan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function deletePayment(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pembayaran');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === e.parameter.id) {
      // Hapus file bukti transfer jika ada
      if (data[i][6]) {
        try {
          const fileId = data[i][6].match(/[-\w]{25,}/);
          if (fileId) {
            DriveApp.getFileById(fileId[0]).setTrashed(true);
          }
        } catch (error) {
          console.error('Gagal menghapus file bukti transfer:', error);
        }
      }
      
      sheet.deleteRow(i+1);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, message: 'Pembayaran tidak ditemukan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi untuk mendapatkan laporan
function getReports(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pembayaran');
  const data = sheet.getDataRange().getValues();
  
  const reports = [];
  const startDate = e.parameter.startDate ? new Date(e.parameter.startDate) : null;
  const endDate = e.parameter.endDate ? new Date(e.parameter.endDate) : null;
  const month = e.parameter.month;
  const year = e.parameter.year;
  
  for (let i = 1; i < data.length; i++) {
    const paymentDate = new Date(data[i][4]);
    let include = false;
    
    if (startDate && endDate) {
      // Filter berdasarkan range tanggal
      include = paymentDate >= startDate && paymentDate <= endDate;
    } else if (month && year) {
      // Filter berdasarkan bulan dan tahun
      include = paymentDate.getMonth() + 1 == month && paymentDate.getFullYear() == year;
    } else if (year) {
      // Filter berdasarkan tahun
      include = paymentDate.getFullYear() == year;
    }
    
    if (include) {
      reports.push({
        id: data[i][0],
        idPelanggan: data[i][1],
        bulan: data[i][2],
        tahun: data[i][3],
        tglBayar: data[i][4],
        jumlah: data[i][5],
        status: data[i][7]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(reports))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi untuk mendapatkan pembayaran pelanggan
function getCustomerPayments(e) {
  const ss = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
  const sheet = ss.getSheetByName('Pembayaran');
  const data = sheet.getDataRange().getValues();
  
  const payments = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === e.parameter.idPelanggan) {
      payments.push({
        bulan: data[i][2],
        tahun: data[i][3],
        tglBayar: data[i][4],
        jumlah: data[i][5],
        bukti: data[i][6],
        status: data[i][7]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(payments))
    .setMimeType(ContentService.MimeType.JSON);
}