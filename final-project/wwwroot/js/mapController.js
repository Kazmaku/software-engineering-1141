// 初始化地圖
const map = L.map('map').setView([24.993, 121.301], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let villageLayer = null;
let schoolMarker = null;

// 載入 GeoJSON 圖層 
fetch('/data/taoyuan_villages.geojson')
    .then(r => r.json())
    .then(geoJson => {
        initMapLayer(geoJson);
    })
    .catch(err => console.error("GeoJSON 讀取失敗:", err));

function initMapLayer(geoJson) {
    villageLayer = L.geoJSON(geoJson, {
        style: {
            color: '#555', weight: 0.2, opacity: 0.5,
            fillColor: '#3388ff', fillOpacity: 0.1
        }
    }).addTo(map);
}



const districtSelect = document.getElementById('districtSelect');
const schoolSelect = document.getElementById('schoolSelect');

// 行政區改變 -> 呼叫 GetSchools
districtSelect.addEventListener('change', async (e) => {
    const selectedDist = e.target.value;

    schoolSelect.innerHTML = '<option value="">讀取中...</option>';
    schoolSelect.disabled = true;
    document.getElementById('school-info').style.display = 'none';

    if (!selectedDist) {
        schoolSelect.innerHTML = '<option value="">請先選擇行政區</option>';
        return;
    }

    try {
        const response = await fetch(`/Home/GetSchools?district=${encodeURIComponent(selectedDist)}`);
        const schools = await response.json();

        schoolSelect.innerHTML = '<option value="">請選擇學校...</option>';
        schools.forEach(s => {
            const option = document.createElement('option');
            option.value = s.學校名稱;
            option.textContent = s.學校名稱;
            schoolSelect.appendChild(option);
        });
        schoolSelect.disabled = false;
    } catch (err) {
        console.error("無法取得學校列表", err);
        schoolSelect.innerHTML = '<option value="">讀取錯誤</option>';
    }
});

// 學校改變 -> 呼叫 GetSchoolDetails
schoolSelect.addEventListener('change', async (e) => {
    const selectedSchoolName = e.target.value;
    const selectedDist = districtSelect.value;

    if (!selectedSchoolName) return;

    try {
        const url = `/Home/GetSchoolDetails?district=${encodeURIComponent(selectedDist)}&name=${encodeURIComponent(selectedSchoolName)}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Not Found");

        const schoolData = await response.json();
        showSchoolOnMap(schoolData);

    } catch (err) {
        console.error("無法取得學校詳情", err);
    }
});


function showSchoolOnMap(school) {
    // 更新 UI 文字
    document.getElementById('school-info').style.display = 'block';
    document.getElementById('display-name').textContent = school.學校名稱;
    document.getElementById('display-phone').textContent = school.聯絡電話;
    document.getElementById('display-area').textContent = school.學區;

    // 設定 Marker(只標記)
    if (school.lat && school.lng) {
        if (schoolMarker) map.removeLayer(schoolMarker);
        schoolMarker = L.marker([school.lat, school.lng])
            .addTo(map)
            .bindPopup(`<b>${school.行政區} ${school.學校名稱}</b>`);

    }

    // 執行高亮並嘗試縮放到學區範圍
    const zoomedToArea = highlightDistricts(school.行政區, school.highlightVillages);


    if (!zoomedToArea && school.lat && school.lng) {
        map.flyTo([school.lat, school.lng], 16);
        schoolMarker.openPopup();
    }
}
function highlightDistricts(districtName, targetVillages) {
    if (!villageLayer) return false; 

 
    villageLayer.eachLayer(layer => villageLayer.resetStyle(layer));

    if (!targetVillages || targetVillages.length === 0) return false;

    const bounds = L.latLngBounds();
    let hasMatch = false;

   
    villageLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        const mapTown = props.TOWNNAME;
        const mapVill = props.VILLNAME;

        if ((mapTown.includes(districtName) || districtName.includes(mapTown))) {
            const isMatch = targetVillages.some(target => mapVill.includes(target) && target.length >= 2);

            if (isMatch) {
                layer.setStyle({
                    color: '#e74c3c', weight: 2, opacity: 1,
                    fillColor: '#f39c12', fillOpacity: 0.5
                });

               
                bounds.extend(layer.getBounds());
                hasMatch = true;
            }
        }
    });

    
    if (hasMatch && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        return true;
    }

    return false;
}