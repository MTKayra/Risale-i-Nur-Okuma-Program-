// Firebase Realtime Database tabanlı sürüm

let state = {
  mode: 'select', // 'select' | 'view'
  currentGroupId: null,
  adminCode: '',
  darkMode: false,
  enteredCode: '',
  newMember: { name: '', book: '', pages: '', minutes: '' },
  shareLink: '',
  members: [] // Firebase'den gelen üyeler
};

const books = {
  big: [
    { name: 'Sözler', pages: 700 },
    { name: "Lem'alar", pages: 584 },
    { name: 'Mektubat', pages: 566 },
    { name: 'Şuâlar', pages: 760 },
    { name: 'Menevî-i Nuriye', pages: 220 },
    { name: "İşaratü'l İ'caz", pages: 356 },
    { name: 'Sikka-i Tasdik-i Gaybi', pages: 512 },
    { name: 'Barla Lahikası', pages: 400 },
    { name: 'Kastamonu Lahikası', pages: 320 },
    { name: 'Emirdag Lahikası - I', pages: 380 },
    { name: 'Emirdag Lahikası - II', pages: 350 }
  ],
  small: [
    { name: 'Gençlik Rehberi', pages: 120 },
    { name: 'Hastalar Risalesi', pages: 64 },
    { name: 'Meyve Risalesi', pages: 112 },
    { name: 'İhlas Risalesi', pages: 32 },
    { name: 'Uhuvvet Risalesi', pages: 48 },
    { name: 'Küçük Sözler', pages: 48 },
    { name: "Ayetü'l Kübra", pages: 74 },
    { name: 'Asa-yı Musa', pages: 240 },
    { name: 'Ramazan Risalesi', pages: 64 },
    { name: 'Haşir Risalesi', pages: 88 },
    { name: 'Hanımlar Rehberi', pages: 48 },
    { name: 'Katre Risalesi', pages: 48 },
    { name: 'Lemaat', pages: 60 },
    { name: 'Tabiat Risalesi', pages: 56 },
    { name: 'Reçeteler', pages: 40 }
  ]
};

// localStorage'dan sadece darkMode'u yükle
function loadDarkMode() {
  try {
    const saved = localStorage.getItem('risale-dark-mode');
    if (saved === 'true') state.darkMode = true;
  } catch (e) {
    console.error('Dark mode okuma hatası', e);
  }
}

function saveDarkMode() {
  try {
    localStorage.setItem('risale-dark-mode', state.darkMode.toString());
  } catch (e) {
    console.error('Dark mode yazma hatası', e);
  }
}

// Firebase: Grup oluştur
async function createGroup() {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const groupId = Date.now().toString();
    const groupData = {
      code,
      createdAt: new Date().toISOString(),
      members: {}
    };

    // Grup oluştur
    await database.ref(`groups/${groupId}`).set(groupData);
    // Kod -> groupId mapping
    await database.ref(`groupsByCode/${code}`).set(groupId);

    state.currentGroupId = groupId;
    state.adminCode = code;
    state.mode = 'view';
    state.members = [];

    // Üyeleri dinlemeye başla
    listenToMembers();
    render();
  } catch (e) {
    console.error('Grup oluşturma hatası', e);
    alert('Grup oluşturulurken bir hata oluştu: ' + e.message);
  }
}

// Firebase: Gruba katıl
async function joinGroup() {
  const code = (state.enteredCode || '').trim().toUpperCase();
  if (!code) {
    alert('Lütfen bir grup kodu giriniz.');
    return;
  }

  try {
    // Kod ile groupId'yi bul
    const snapshot = await database.ref(`groupsByCode/${code}`).once('value');
    const groupId = snapshot.val();

    if (!groupId) {
      alert('Bu kodla bir grup bulunamadı.');
      return;
    }

    // Grup bilgisini kontrol et
    const groupSnapshot = await database.ref(`groups/${groupId}`).once('value');
    const group = groupSnapshot.val();

    if (!group) {
      alert('Grup bulunamadı.');
      return;
    }

    state.currentGroupId = groupId;
    state.adminCode = code;
    state.mode = 'view';

    // Üyeleri dinlemeye başla
    listenToMembers();
    render();
  } catch (e) {
    console.error('Gruba katılma hatası', e);
    alert('Gruba katılırken bir hata oluştu.');
  }
}

// Firebase: Üyeleri dinle (gerçek zamanlı güncelleme)
function listenToMembers() {
  if (!state.currentGroupId) return;

  database.ref(`groups/${state.currentGroupId}/members`).on('value', snapshot => {
    const membersObj = snapshot.val() || {};
    // Firebase objesini array'e çevir
    state.members = Object.keys(membersObj).map(id => ({
      id,
      ...membersObj[id]
    }));
    render();
  });
}

// Firebase: Üye ekle
async function addMember() {
  const { name, book, pages, minutes } = state.newMember;
  if (!name || !book) {
    alert('Lütfen tüm alanları doldurunuz.');
    return;
  }

  if (!state.currentGroupId) {
    alert('Önce bir grup oluşturun veya seçin.');
    return;
  }

  try {
    const memberId = Date.now().toString();
    const memberData = {
      name,
      book,
      pagesRead: parseInt(pages, 10) || 0,
      timeSpent: parseInt(minutes, 10) || 0,
      date: new Date().toLocaleDateString('tr-TR')
    };

    await database.ref(`groups/${state.currentGroupId}/members/${memberId}`).set(memberData);
    state.newMember = { name: '', book: '', pages: '', minutes: '' };
    // listenToMembers otomatik güncelleyecek
  } catch (e) {
    console.error('Üye ekleme hatası', e);
    alert('Üye eklenirken bir hata oluştu.');
  }
}

// Firebase: Üye sil
async function deleteMember(id) {
  if (!state.currentGroupId) return;

  try {
    await database.ref(`groups/${state.currentGroupId}/members/${id}`).remove();
    // listenToMembers otomatik güncelleyecek
  } catch (e) {
    console.error('Üye silme hatası', e);
    alert('Üye silinirken bir hata oluştu.');
  }
}

function toggleDark() {
  state.darkMode = !state.darkMode;
  saveDarkMode();
  render();
}

function logoutToSelect() {
  // Firebase listener'ı durdur
  if (state.currentGroupId) {
    database.ref(`groups/${state.currentGroupId}/members`).off('value');
  }

  state.mode = 'select';
  state.currentGroupId = null;
  state.adminCode = '';
  state.members = [];
  render();
}

function generateShareLink() {
  const base = window.location.origin + window.location.pathname;
  state.shareLink = `${base}?join=${state.adminCode}`;
  render();
}

async function handleJoinParam() {
  const params = new URLSearchParams(window.location.search);
  const join = params.get('join');
  if (!join) return;

  const code = join.toUpperCase();
  try {
    const snapshot = await database.ref(`groupsByCode/${code}`).once('value');
    const groupId = snapshot.val();

    if (groupId) {
      const groupSnapshot = await database.ref(`groups/${groupId}`).once('value');
      const group = groupSnapshot.val();

      if (group) {
        state.currentGroupId = groupId;
        state.adminCode = code;
        state.mode = 'view';
        listenToMembers();
        render();
        return;
      }
    }

    // Grup yoksa kodu alana yaz
    state.mode = 'select';
    state.enteredCode = code;
    render();
  } catch (e) {
    console.error('Join param işleme hatası', e);
    state.mode = 'select';
    state.enteredCode = code;
    render();
  }
}

function getStats() {
  const members = state.members || [];
  const totalPages = members.reduce((s, m) => s + (m.pagesRead || 0), 0);
  const totalTime = members.reduce((s, m) => s + (m.timeSpent || 0), 0);
  const avgPages = members.length ? (totalPages / members.length).toFixed(1) : 0;
  const avgTime = members.length ? (totalTime / members.length).toFixed(0) : 0;
  return { totalPages, totalTime, avgPages, avgTime };
}



function render() {
  const app = document.getElementById('app');
  const dark = state.darkMode;
  document.body.className =
    (dark
      ? 'bg-gray-900 text-yellow-300'
      : 'bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white') + ' min-h-screen';

  const members = state.members || [];
  const stats = getStats();

  if (state.mode === 'select') {
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="${dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 class="text-3xl font-bold mb-2 text-center">📚 Risale-i Nur</h1>
          <p class="text-center mb-8 opacity-75">Grup Okuma Takip Sistemi</p>

          <button
            id="btn-create-group"
            class="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-lg mb-4 flex items-center justify-center gap-2 transition"
          >
            <span class="text-xl">＋</span> <span>Yeni Grup Oluştur</span>
          </button>

          <div class="border-t border-gray-300 my-6"></div>

          <p class="text-center mb-4 text-sm opacity-75">Var olan gruba katıl:</p>
          <input
            id="input-join-code"
            type="text"
            placeholder="Grup kodunu giriniz (örn: ABC123)"
            value="${state.enteredCode || ''}"
            class="w-full p-3 border-2 rounded-lg mb-4 ${dark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-800'
      }"
          />
          <button
            id="btn-join-group"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            Gruba Katıl
          </button>

          <button
            id="btn-toggle-dark"
            class="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition text-sm"
          >
            ${dark ? '☀ Açık Mod' : '🌙 Koyu Mod'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-create-group').onclick = createGroup;
    document.getElementById('btn-join-group').onclick = () => {
      state.enteredCode = document.getElementById('input-join-code').value;
      joinGroup();
    };
    document.getElementById('btn-toggle-dark').onclick = toggleDark;
    return;
  }

  // VIEW MODE
  app.innerHTML = `
    <div class="min-h-screen p-4">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8 pt-6">
          <h1 class="text-4xl font-bold mb-2">📚 Risale-i Nur Okuma</h1>
          <p class="text-yellow-200">Grup Takip Sistemi</p>
          <p class="text-sm mt-4">
            Grup Kodu:
            <span class="font-bold bg-black bg-opacity-30 px-3 py-1 rounded">
              ${state.adminCode || 'N/A'}
            </span>
          </p>
        </div>

        <div class="${dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
    } rounded-lg shadow-xl p-6 mb-6">
          <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
            📖 <span>Okuma Verisi Gir</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              id="input-name"
              type="text"
              placeholder="Adınız"
              value="${state.newMember.name || ''}"
              class="p-3 border-2 rounded-lg ${dark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-800'
    }"
            />

            <select
              id="select-book"
              class="p-3 border-2 rounded-lg ${dark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-800'
    }"
            >
              <option value="">Kitap Seçiniz</option>
              <optgroup label="Büyük Kitaplar">
                ${books.big
      .map(
        b =>
          `<option value="${b.name}" ${state.newMember.book === b.name ? 'selected' : ''
          }>${b.name}</option>`
      )
      .join('')}
              </optgroup>
              <optgroup label="Küçük Risaleler">
                ${books.small
      .map(
        b =>
          `<option value="${b.name}" ${state.newMember.book === b.name ? 'selected' : ''
          }>${b.name}</option>`
      )
      .join('')}
              </optgroup>
            </select>

            <input
              id="input-pages"
              type="number"
              placeholder="Okunan Sayfa Sayısı"
              value="${state.newMember.pages || ''}"
              class="p-3 border-2 rounded-lg ${dark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-800'
    }"
            />

            <input
              id="input-minutes"
              type="number"
              placeholder="Harcanan Zaman (dakika)"
              value="${state.newMember.minutes || ''}"
              class="p-3 border-2 rounded-lg ${dark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-800'
    }"
            />
          </div>

          <button
            id="btn-add-member"
            class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <span class="text-xl">＋</span> <span>Ekle</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            id="btn-share"
            class="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            🔗 <span>Paylaş</span>
          </button>
          <button
            id="btn-logout"
            class="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            ⏏ <span>Çık</span>
          </button>
          <button
            id="btn-toggle-dark2"
            class="bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            ${dark ? '☀ Açık Mod' : '🌙 Koyu Mod'}
          </button>
        </div>

        ${state.shareLink
      ? `
        <div class="${dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
      } rounded-lg p-4 mb-6 border-2 border-purple-500">
          <p class="text-sm mb-2 font-bold">📤 Paylaşılabilir Link:</p>
          <div class="flex gap-2">
            <input
              type="text"
              value="${state.shareLink}"
              readonly
              class="flex-1 p-2 border-2 rounded ${dark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-800'
      } text-sm"
            />
            <button
              id="btn-copy-link"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded transition"
            >
              Kopyala
            </button>
          </div>
        </div>
        `
      : ''
    }

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="${dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
    } rounded-lg p-4 shadow text-center">
            <p class="text-xs mb-1 opacity-70">Toplam Sayfa</p>
            <p class="text-2xl font-bold text-green-400">${stats.totalPages}</p>
          </div>
          <div class="${dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
    } rounded-lg p-4 shadow text-center">
            <p class="text-xs mb-1 opacity-70">Toplam Zaman</p>
            <p class="text-2xl font-bold text-blue-400">${stats.totalTime} dk</p>
          </div>
          <div class="${dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
    } rounded-lg p-4 shadow text-center">
            <p class="text-xs mb-1 opacity-70">Ort. Sayfa</p>
            <p class="text-2xl font-bold text-purple-400">${stats.avgPages}</p>
          </div>
          <div class="${dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
    } rounded-lg p-4 shadow text-center">
            <p class="text-xs mb-1 opacity-70">Ort. Zaman</p>
            <p class="text-2xl font-bold text-yellow-400">${stats.avgTime} dk</p>
          </div>
        </div>

        <div class="${dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
    } rounded-lg shadow-xl overflow-hidden">
          <div class="p-6 border-b-2 ${dark ? 'border-gray-700' : 'border-gray-300'}">
            <h2 class="text-2xl font-bold flex items-center gap-2">
              👥 <span>Grup Üyeleri (${members.length})</span>
            </h2>
          </div>

          ${members.length === 0
      ? '<p class="p-6 text-center opacity-60">Henüz veri girilmemiş.</p>'
      : `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="${dark ? 'bg-gray-700' : 'bg-gray-200'}">
                <tr>
                  <th class="p-4 text-left">İsim</th>
                  <th class="p-4 text-left">Kitap</th>
                  <th class="p-4 text-center">Sayfa</th>
                  <th class="p-4 text-center">Zaman (dk)</th>
                  <th class="p-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                ${members
        .map(
          m => `
                  <tr class="border-b ${dark
              ? 'border-gray-700 hover:bg-gray-700'
              : 'border-gray-200 hover:bg-gray-100'
            } transition">
                    <td class="p-4">${m.name}</td>
                    <td class="p-4">${m.book}</td>
                    <td class="p-4 text-center font-bold">${m.pagesRead || 0}</td>
                    <td class="p-4 text-center">${m.timeSpent || 0}</td>
                    <td class="p-4 text-center">
                      <button
                        data-id="${m.id}"
                        class="btn-delete bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                `
        )
        .join('')}
              </tbody>
            </table>
          </div>
          `
    }
        </div>

        <div class="text-center mt-8 text-yellow-200 text-sm">
          <p>بسم الله الرحمن الرحيم</p>
          <p class="mt-2">Bu platform tamamen ücretsizdir, iman hizmetine vesiledir.</p>
        </div>
      </div>
    </div>
  `;

  // Event bağlama
  document.getElementById('btn-add-member').onclick = () => {
    state.newMember = {
      name: document.getElementById('input-name').value,
      book: document.getElementById('select-book').value,
      pages: document.getElementById('input-pages').value,
      minutes: document.getElementById('input-minutes').value
    };
    addMember();
  };
  document.getElementById('btn-share').onclick = generateShareLink;
  document.getElementById('btn-logout').onclick = logoutToSelect;
  document.getElementById('btn-toggle-dark2').onclick = toggleDark;

  const copyBtn = document.getElementById('btn-copy-link');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(state.shareLink || '');
      alert('Link kopyalandı.');
    };
  }
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      deleteMember(id);
    };
  });
}

// Başlangıç
loadDarkMode();
handleJoinParam();
render();
