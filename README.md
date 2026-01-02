# 學區視覺化地圖系統(以桃園市國小為例)

## 專案概述

本專案為基於 ASP.NET Core MVC 架構開發之地理資訊系統 (Web GIS)，旨在視覺化呈現桃園市各行政區之國小學區範圍。系統整合桃園市村里界圖資 (GeoJSON) 與教育局學校資料，透過互動式地圖介面，提供使用者查詢特定學校之詳細資訊及其實際學區覆蓋範圍。

本系統解決了傳統文字描述學區難以直觀理解地理邊界的問題，利用後端解析演算法與前端地圖渲染技術，將非結構化的學區文字描述轉換為地圖上的地理多邊形高亮顯示。

## 功能特性

* **互動式地圖介面**：整合 OpenStreetMap 與 Leaflet.js，提供流暢的地圖操作體驗。
* **動態行政區篩選**：實作級聯式選單 (Cascading Dropdowns)，使用者可依序選擇行政區與學校，系統將自動過濾相應資料。
* **學區視覺化渲染**：
* 系統自動解析學校資料中的學區文字描述（去除雜訊、括號內容與非關鍵字）。
* 將解析後的村里名稱與 GeoJSON 圖資進行比對匹配。
* 在地圖上自動高亮顯示該學校所屬之村里範圍，並自動縮放至該區域。


* **響應式設計**：使用 Bootstrap 框架，確保在不同裝置上皆能保持良好的操作體驗。

## 技術堆疊

### 後端技術 (Backend)

* **框架**：.NET 8.0 (ASP.NET Core MVC)
* **語言**：C#
* **資料處理**：System.Text.Json (JSON 序列化與反序列化)
* **演算法**：使用 Regular Expressions (Regex) 進行自然語言處理，解析非結構化學區字串。

### 前端技術 (Frontend)

* **地圖函式庫**：Leaflet.js (v1.9.4)
* **樣式框架**：Bootstrap
* **腳本語言**：JavaScript (ES6+)

### 資料格式

* **GIS 資料**：GeoJSON (桃園市村里界圖)
* **學校資料**：JSON (包含學校名稱、經緯度、電話、學區文字描述)

## 系統架構與實作細節

1. **資料載入機制**：
* 應用程式啟動時，`HomeController` 負責讀取並快取靜態 JSON 資料源。
* 針對 `.geojson` 檔案配置 `FileExtensionContentTypeProvider`，確保 MIME Type 正確傳輸。


2. **學區解析邏輯**：
* 針對原始資料中複雜的學區描述（例如包含「全里」、「(部分)」等註記），後端實作了字串清理與正規化邏輯。
* 透過 Regex 提取核心村里名稱，供前端進行圖層比對。


3. **地圖渲染邏輯**：
* 前端 `mapController.js` 負責載入村里界 GeoJSON 圖層。
* 接收後端回傳的目標村里列表後，遍歷圖層屬性 (`TOWNNAME`, `VILLNAME`) 進行模糊比對，命中目標即動態改變圖層樣式 (Style) 以達成高亮效果。



## 安裝與執行指南

### 前置需求

* .NET 8.0 SDK 或更高版本

### 執行步驟

1. **複製專案**
```bash
git clone [repository-url]
cd software-engineering-1141

```


2. **還原相依套件**
```bash
dotnet restore

```


3. **執行專案**
進入專案目錄後執行：
```bash
cd final-project
dotnet run

```


4. **瀏覽**
開啟瀏覽器並訪問 `https://localhost:7150` (或是終端機顯示的本地位址)。

## 專案結構

```
final-project/
├── Controllers/
│   └── HomeController.cs    # 核心控制器，處理資料查詢與視圖回傳
├── Models/
│   └── School.cs            # 學校資料模型定義
├── Views/
│   └── Home/
│       └── Index.cshtml     # 主要地圖介面
├── wwwroot/
│   ├── data/
│   │   ├── school_clean.json       # 學校資料來源
│   │   └── taoyuan_villages.geojson # 桃園市地理圖資
│   └── js/
│       └── mapController.js # 前端地圖邏輯控制
├── Program.cs               # 應用程式進入點與服務配置
└── appsettings.json         # 應用程式設定檔

```
