import geopandas as gpd
import os

# =================PATH=================
input_shp_file = "../raw/VILLAGE_NLSC_11401031.shp" 
output_geojson_file = "../data/taoyuan_villages.geojson"
# =======================================

print(f"正在讀取 {input_shp_file}")

try:
    gdf = gpd.read_file(input_shp_file, encoding='utf-8')

    taoyuan_gdf = gdf[gdf['COUNTYNAME'] == '桃園市']

    if taoyuan_gdf.empty:
        print("COUNTYNAME Not found")
    else:
        print(f"{len(taoyuan_gdf)} 個桃園市的村里。")


        if taoyuan_gdf.crs and taoyuan_gdf.crs.to_string() != "EPSG:4326":
            print("正在將座標系統轉換為 WGS84 (經緯度)...")
            taoyuan_gdf = taoyuan_gdf.to_crs(epsg=4326)

        taoyuan_gdf = taoyuan_gdf[['TOWNNAME', 'VILLNAME', 'geometry']]

        if os.path.exists(output_geojson_file):
            os.remove(output_geojson_file)
            
        taoyuan_gdf.to_file(output_geojson_file, driver='GeoJSON', encoding='utf-8')
        print(f"output: {output_geojson_file}")

except Exception as e:
    print(f"error: {e}")