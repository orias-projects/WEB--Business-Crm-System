import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Download } from 'lucide-react';

export default function BaoCaoTyLeChuyenDoi() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [nhanVienStats, setNhanVienStats] = useState([]);
  const [totalStats, setTotalStats] = useState(null);
  const [prevTotalStats, setPrevTotalStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await api.get('/baocao/ty-le-chuyen-doi', {
        params: {
          month: selectedMonth,
          year: selectedYear
        }
      });

      if (response.data.success) {
        setNhanVienStats(response.data.data.nhanVienStats || []);
        setTotalStats(response.data.data.totalStats || null);
        setPrevTotalStats(response.data.data.prevTotalStats || null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/baocao/export/ty-le-chuyen-doi', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_TyLeChuyenDoi_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export Excel error:', error);
      alert('Lỗi xuất file Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      // Tạm thời chưa có API PDF cho tỷ lệ chuyển đổi
      alert('Tính năng xuất PDF đang được phát triển');
    } catch (error) {
      console.error('Export PDF error:', error);
      alert('Lỗi xuất file PDF');
    }
  };

  // Tính phần trăm thay đổi
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Tính tổng hợp các chỉ số
  const totalThanhCong = totalStats?.CoHoiThanhCong || 0;
  const totalMoi = totalStats?.CoHoiMoi || 0;
  const totalChoXuLy = totalStats?.CoHoiChoXuLy || 0;
  const totalThatBai = totalStats?.CoHoiThatBai || 0;

  // Tính dữ liệu tháng trước
  const prevThanhCong = prevTotalStats?.CoHoiThanhCong || 0;
  const prevMoi = prevTotalStats?.CoHoiMoi || 0;
  const prevChoXuLy = prevTotalStats?.CoHoiChoXuLy || 0;
  const prevThatBai = prevTotalStats?.CoHoiThatBai || 0;

  const thanhCongChange = calculatePercentageChange(totalThanhCong, prevThanhCong);
  const moiChange = calculatePercentageChange(totalMoi, prevMoi);
  const choXuLyChange = calculatePercentageChange(totalChoXuLy, prevChoXuLy);
  const thatBaiChange = calculatePercentageChange(totalThatBai, prevThatBai);

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = [
    { name: 'Thành công', value: totalThanhCong, color: '#10B981' },
    { name: 'Mới', value: totalMoi, color: '#3B82F6' },
    { name: 'Chờ xử lý', value: totalChoXuLy, color: '#F59E0B' },
    { name: 'Thất bại', value: totalThatBai, color: '#EF4444' }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">BÁO CÁO TỶ LỆ CHUYỂN ĐỔI CƠ HỘI THÁNG</h1>
        <div className="flex items-center gap-2">
          <select
            value={`${selectedMonth}/${selectedYear}`}
            onChange={(e) => {
              const [month, year] = e.target.value.split('/');
              setSelectedMonth(parseInt(month));
              setSelectedYear(parseInt(year));
            }}
            className="input max-w-xs"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const month = date.getMonth() + 1;
              const year = date.getFullYear();
              return (
                <option key={`${month}/${year}`} value={`${month}/${year}`}>
                  Tháng {month}/{year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-white border border-green-200" style={{ backgroundColor: '#F0FDF4' }}>
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Cơ hội thành công</p>
            <p className="text-2xl font-bold text-gray-900">{totalThanhCong.toLocaleString('vi-VN')}</p>
            <p className={`text-sm mt-1 ${thanhCongChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {thanhCongChange >= 0 ? '+' : ''}{thanhCongChange.toFixed(1)}% từ tháng trước
            </p>
          </div>
        </div>

        <div className="card bg-white border border-blue-200" style={{ backgroundColor: '#EFF6FF' }}>
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Cơ hội mới</p>
            <p className="text-2xl font-bold text-gray-900">{totalMoi.toLocaleString('vi-VN')}</p>
            <p className={`text-sm mt-1 ${moiChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {moiChange >= 0 ? '+' : ''}{moiChange.toFixed(1)}% so với tháng trước
            </p>
          </div>
        </div>

        <div className="card bg-white border border-yellow-200" style={{ backgroundColor: '#FEFCE8' }}>
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Cơ hội chờ xử lý</p>
            <p className="text-2xl font-bold text-gray-900">{totalChoXuLy.toLocaleString('vi-VN')}</p>
            <p className={`text-sm mt-1 ${choXuLyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {choXuLyChange >= 0 ? '+' : ''}{choXuLyChange.toFixed(1)}% so với tháng trước
            </p>
          </div>
        </div>

        <div className="card bg-white border border-red-200" style={{ backgroundColor: '#FEF2F2' }}>
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Cơ hội thất bại</p>
            <p className="text-2xl font-bold text-gray-900">{totalThatBai.toLocaleString('vi-VN')}</p>
            <p className={`text-sm mt-1 ${thatBaiChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {thatBaiChange >= 0 ? '+' : ''}{thatBaiChange.toFixed(1)}% so với tháng trước
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Table and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bảng thống kê chi tiết - Bên trái */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Bảng thống kê chi tiết</h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Xuất Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Xuất PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cơ hội mới</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cơ hội chờ xử lý</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cơ hội thành công</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cơ hội thất bại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng cơ hội phát sinh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tỷ lệ chuyển đổi cơ hội</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nhanVienStats.length > 0 ? (
                  <>
                    {nhanVienStats.map((nv, index) => (
                      <tr key={nv.ID_NhanVien || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{nv.TenNhanVien}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nv.CoHoiMoi || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nv.CoHoiChoXuLy || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nv.CoHoiThanhCong || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nv.CoHoiThatBai || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nv.TongCoHoi || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{nv.TyLeChuyenDoi || 0}%</td>
                      </tr>
                    ))}
                    {totalStats && (
                      <tr className="bg-gray-100 font-semibold">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900" colSpan="2">Tổng cộng</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalStats.CoHoiMoi || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalStats.CoHoiChoXuLy || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalStats.CoHoiThanhCong || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalStats.CoHoiThatBai || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalStats.TongCoHoi || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalStats.TyLeChuyenDoi || 0}%</td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Biểu đồ tỷ lệ chuyển đổi cơ hội tháng - Bên phải */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Biểu đồ tỷ lệ chuyển đổi cơ hội tháng</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
