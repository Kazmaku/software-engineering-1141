//namespace TaoyuanMap.Models
namespace final_project.Models
{
    public class School
    {
        public string 行政區 { get; set; } = "";
        public string 學校名稱 { get; set; } = "";
        public string 聯絡電話 { get; set; } = "";
        public string 學區 { get; set; } = "";
        public string 地址 { get; set; } = "";
        public double? Lat { get; set; }
        public double? Lng { get; set; }
    }

    public class SchoolDetailViewModel : School
    {
        public List<string> HighlightVillages { get; set; } = new();
    }
}
