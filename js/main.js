// 初始化地圖
const map = L.map('map').setView([24.993, 121.301], 11); // 桃園市中心

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let villageLayer = null;
let schoolMarker = null;
let allSchoolsData = []; // 儲存完整的學校資料

// 讀取資料
Promise.all([
    fetch('data/school_clean.json').then(r => r.json()),
    fetch('data/taoyuan_villages.geojson').then(r => r.json())
])
    .then(([schools, geoJson]) => {
        allSchoolsData = schools;
        initDistricts(schools); // 初始化行政區選單
        initMapLayer(geoJson);  // 初始化地圖圖層
    })
    .catch(err => {
        console.error("讀取失敗:", err);
        alert("資料讀取失敗，請確認 data/school_clean.json 與 data/taoyuan_villages.geojson 是否存在。");
    });

//初始化地圖圖層 (透明)
function initMapLayer(geoJson) {
    villageLayer = L.geoJSON(geoJson, {
        style: { color: '#3388ff', weight: 1, opacity: 0, fillOpacity: 0 }
    }).addTo(map);
}

// ==========================================
//  選單邏輯區
// ==========================================

const districtSelect = document.getElementById('districtSelect');
const schoolSelect = document.getElementById('schoolSelect');

//初始化行政區選單
function initDistricts(schools) {
    const districts = [...new Set(schools.map(s => s.行政區))];
    districts.sort((a, b) => a.localeCompare(b, 'zh-Hant'));

    districtSelect.innerHTML = '<option value="">請選擇行政區...</option>';
    districts.forEach(dist => {
        const option = document.createElement('option');
        option.value = dist;
        option.textContent = dist;
        districtSelect.appendChild(option);
    });
}

//監聽「行政區」改變
districtSelect.addEventListener('change', (e) => {
    const selectedDist = e.target.value;

    schoolSelect.innerHTML = '<option value="">請選擇學校...</option>';
    document.getElementById('school-info').style.display = 'none';

    if (selectedDist === "") {
        schoolSelect.disabled = true;
        return;
    }

    const filteredSchools = allSchoolsData.filter(s => s.行政區 === selectedDist);

    filteredSchools.forEach(school => {
        const option = document.createElement('option');
        option.value = school.學校名稱;
        option.textContent = school.學校名稱;
        schoolSelect.appendChild(option);
    });

    schoolSelect.disabled = false;
});

// 監聽「學校」改變
schoolSelect.addEventListener('change', (e) => {
    const selectedSchoolName = e.target.value;
    const selectedDist = districtSelect.value;

    if (selectedSchoolName === "") return;

    const targetSchool = allSchoolsData.find(s =>
        s.行政區 === selectedDist && s.學校名稱 === selectedSchoolName
    );

    if (targetSchool) {
        showSchoolOnMap(targetSchool);
    }
});

// ==========================================
//  地圖顯示邏輯區
// ==========================================

function showSchoolOnMap(school) {
    document.getElementById('school-info').style.display = 'block';
    document.getElementById('display-name').textContent = school.學校名稱;
    document.getElementById('display-phone').textContent = school.聯絡電話;
    document.getElementById('display-area').textContent = school.學區;

    if (school.lat && school.lng) {
        map.flyTo([school.lat, school.lng], 15);

        if (schoolMarker) map.removeLayer(schoolMarker);
        schoolMarker = L.marker([school.lat, school.lng])
            .addTo(map)
            .bindPopup(`<b>${school.行政區} ${school.學校名稱}</b>`)
            .openPopup();
    }

    highlightDistricts(school);
}

function highlightDistricts(schoolData) {
    if (!villageLayer) return;
    villageLayer.eachLayer(layer => villageLayer.resetStyle(layer));

    const areaText = schoolData.學區;
    const districtName = schoolData.行政區;

    if (!areaText) return;

    const targetVillages = areaText
        .split(/，|、/)
        .map(t => t.replace(/◎/g, '').replace(/[\(（].*?[\)）]/g, '').replace('里', '').trim())
        .filter(t => t.length > 0);

    let bounds = L.latLngBounds();
    let foundAny = false;

    villageLayer.eachLayer(layer => {
        const mapTown = layer.feature.properties.TOWNNAME;
        const mapVill = layer.feature.properties.VILLNAME;

        if ((mapTown.includes(districtName) || districtName.includes(mapTown))) {
            const isVillMatch = targetVillages.some(target => mapVill.includes(target) && target.length >= 2);

            if (isVillMatch) {
                layer.setStyle({
                    color: '#e74c3c', weight: 2, opacity: 1,
                    fillColor: '#f39c12', fillOpacity: 0.5
                });
                bounds.extend(layer.getBounds());
                foundAny = true;
            }
        }
    });
}