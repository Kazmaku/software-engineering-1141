using final_project.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;

//namespace TaoyuanMap.Controllers
namespace final_project.Controllers
{
    public class HomeController : Controller
    {
        private readonly IWebHostEnvironment _env;
        private static List<School> _schools = new();

        public HomeController(IWebHostEnvironment env)
        {
            _env = env;
            LoadData();
        }

        private void LoadData()
        {
            if (_schools.Count == 0)
            {
                var path = Path.Combine(_env.WebRootPath, "data", "school_clean.json");
                if (System.IO.File.Exists(path))
                {
                    var json = System.IO.File.ReadAllText(path);
                    _schools = JsonSerializer.Deserialize<List<School>>(json) ?? new();
                }
            }
        }

        // 頁面進入點
        public IActionResult Index()
        {
            var districts = _schools
                .Select(s => s.行政區)
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            ViewBag.Districts = districts;
            return View();
        }

        // API: 根據行政區取得學校列表
        [HttpGet]
        public IActionResult GetSchools(string district)
        {
            var schools = _schools
                .Where(s => s.行政區 == district)
                .Select(s => new { s.學校名稱 }) // 只需要名稱供選單使用
                .ToList();

            return Json(schools);
        }

        // API: 取得特定學校的詳細資訊 (包含解析後的學區村里)
        [HttpGet]
        public IActionResult GetSchoolDetails(string district, string name)
        {
            var school = _schools.FirstOrDefault(s => s.行政區 == district && s.學校名稱 == name);

            if (school == null) return NotFound();

            var viewModel = new SchoolDetailViewModel
            {
                行政區 = school.行政區,
                學校名稱 = school.學校名稱,
                聯絡電話 = school.聯絡電話,
                學區 = school.學區,
                Lat = school.Lat,
                Lng = school.Lng,
                // 重點：在後端進行邏輯解析
                HighlightVillages = ParseAreaString(school.學區)
            };

            return Json(viewModel);
        }

        private List<string> ParseAreaString(string areaText)
        {
            if (string.IsNullOrWhiteSpace(areaText)) return new List<string>();

            // 匹配非分隔符號的連續文字 或 括號內容
            var regex = new Regex(@"(?:[^\(（，、]+|[\(（][^）\)]*[\)）])+", RegexOptions.Compiled);
            var matches = regex.Matches(areaText);

            var results = new List<string>();

            foreach (Match match in matches)
            {
                var text = match.Value;
                // 清理文字
                text = text.Replace("◎", "");
                text = Regex.Replace(text, @"[\(（].*?[\)）]", ""); // 移除括號
                text = text.Replace("里", "").Trim();

                if (!string.IsNullOrEmpty(text))
                {
                    results.Add(text);
                }
            }
            return results;
        }
    }
}
