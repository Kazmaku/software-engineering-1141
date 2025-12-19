import json

# =================PATH=================
input_file = '../raw/school_with_location.json' 
output_file = '../data/school_clean.json'
# =======================================

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        schools = json.load(f)


    merged_schools = {}

    for s in schools:
        # 建立唯一的 Key: 行政區 + 學校名稱 (避免不同區有同名學校)
        key = f"{s['行政區']}_{s['學校名稱']}"

        if key in merged_schools:
            # 如果已經有這間學校，就把新的學區文字「接」在後面
            # 加個全形逗號隔開
            existing_area = merged_schools[key]['學區']
            new_area = s['學區']
            # 簡單判斷避免重複串接
            if new_area not in existing_area:
                merged_schools[key]['學區'] = existing_area + "，" + new_area
        else:
            # 如果是新學校，直接加入
            merged_schools[key] = s

    clean_data = list(merged_schools.values())


    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(clean_data, f, ensure_ascii=False, indent=4)

    print(f"原始筆數: {len(schools)} -> 合併後筆數: {len(clean_data)}")

except FileNotFoundError:
    print(f"找不到檔案 {input_file}")