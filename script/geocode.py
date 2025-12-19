import json
import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

# =================PATH=================
input_file = '../raw/taoyuan-school.json'
output_file = '../raw/school_with_location.json'
# =======================================

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        schools = json.load(f)
except FileNotFoundError:
    print(f"找不到檔案: {input_file}")
    schools = []


geolocator = Nominatim(user_agent="taoyuan_school_map_project")

print(f"開始處理 {len(schools)} 間學校的座標...")

for school in schools:

    query_address = f"桃園市{school['行政區']}{school['學校名稱']}"
    
    try:
        location = geolocator.geocode(query_address, timeout=10)
        
        if location:
            school['lat'] = location.latitude
            school['lng'] = location.longitude
            print(f"成功: {query_address} -> ({location.latitude}, {location.longitude})")
        else:
            # 如果找不到，標記為 null，後續需手動補
            school['lat'] = None
            school['lng'] = None
            print(f"找不到: {query_address}")
            
    except Exception as e:
        print(f"錯誤: {query_address} - {e}")
        school['lat'] = None
        school['lng'] = None


    time.sleep(1.2) 


with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(schools, f, ensure_ascii=False, indent=4)

print(f"\n output: {output_file}")