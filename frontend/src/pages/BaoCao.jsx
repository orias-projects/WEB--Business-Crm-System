import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Target, Users, Award, Calendar, Download } from 'lucide-react';

export default function BaoCao() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [doanhThuData, setDoanhThuData] = useState([]);
  const [topNhanVien, setTopNhanVien] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [coHoiStats, setCoHoiStats] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [last12MonthsData, setLast12MonthsData] = useState([]);
  const [prevTopNhanVien, setPrevTopNhanVien] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleExportExcel = async (type = 'doanhthu') => {
    try {
      const response = await api.get(`/baocao/export/excel`, {
        params: {
          type,
          year: selectedYear,
          month: selectedMonth
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export Excel error:', error);
      alert('Lỗi xuất file Excel');
    }
  };

  const handleExportPDF = async (type = 'doanhthu') => {
    try {
      const response = await api.get(`/baocao/export/pdf`, {
        params: {
          type,
          year: selectedYear,
          month: selectedMonth
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export PDF error:', error);
      alert('Lỗi xuất file PDF');
    }
  };

  const handleExportTyLeChuyenDoi = async () => {
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
      console.error('Export conversion rate error:', error);
      alert('Lỗi xuất báo cáo tỷ lệ chuyển đổi');
    }
  };

  const handleExportHopDongGanHetHan = async () => {
    try {
      const response = await api.get('/baocao/export/hop-dong-gan-het-han', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_HopDongGanHetHan_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export expiring contracts error:', error);
      alert('Lỗi xuất báo cáo hợp đồng gần hết hạn');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Tính toán startDate và endDate từ tháng/năm đã chọn
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = new Date(selectedYear, selectedMonth - 1, lastDay).toISOString().split('T')[0];
      
      // Tính toán tháng trước
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      const prevStartDate = new Date(prevYear, prevMonth - 1, 1).toISOString().split('T')[0];
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      const prevEndDate = new Date(prevYear, prevMonth - 1, prevLastDay).toISOString().split('T')[0];
      
      // Lấy dữ liệu 12 tháng gần nhất (từ tháng hiện tại trở về trước)
      const twelveMonthsAgo = new Date(selectedYear, selectedMonth - 12, 1);
      const twelveMonthsStartDate = twelveMonthsAgo.toISOString().split('T')[0];
      const twelveMonthsEndDate = endDate;
      
      const promises = [
        api.get(`/baocao/doanhthu?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/baocao/doanhthu?startDate=${prevStartDate}&endDate=${prevEndDate}`), // Tháng trước
        api.get(`/baocao/doanhthu?startDate=${twelveMonthsStartDate}&endDate=${twelveMonthsEndDate}`), // 12 tháng
        api.get(`/baocao/kpi/${user.id}`),
        api.get('/cohoi')
      ];

      if (user.roleId >= 2) {
        promises.push(api.get(`/baocao/top-nhanvien?month=${selectedMonth}&year=${selectedYear}`));
        promises.push(api.get(`/baocao/top-nhanvien?month=${prevMonth}&year=${prevYear}`)); // Tháng trước
      }

      const responses = await Promise.all(promises);
      
      setDoanhThuData(responses[0].data.data || []);
      setPreviousMonthData(responses[1].data.data || []);
      
      // Xử lý dữ liệu 12 tháng gần nhất tính từ tháng/năm đã chọn
      const last12Months = responses[2].data.data || [];
      const chartData = [];
      
      // Tính 12 tháng từ tháng đã chọn trở về trước
      // Ví dụ: Nếu chọn tháng 11/2024, sẽ hiển thị từ tháng 12/2023 đến tháng 11/2024
      for (let i = 11; i >= 0; i--) {
        // Tính tháng và năm cho từng tháng trong 12 tháng
        let month = selectedMonth - i;
        let year = selectedYear;
        
        // Xử lý khi tháng < 1 (lùi về năm trước)
        while (month < 1) {
          month += 12;
          year -= 1;
        }
        
        // Tìm dữ liệu tương ứng
        const monthData = last12Months.find(d => d.thang === month && d.nam === year);
        chartData.push({
          thang: month,
          nam: year,
          label: `T${month}/${year}`,
          doanhThu: monthData ? parseFloat(monthData.tongDoanhThu || 0) : 0
        });
      }
      setLast12MonthsData(chartData);
      
      // Map backend KPI structure to frontend format
      const backendKpi = responses[3].data.data;
      if (backendKpi) {
        setKpiData({
          khMoi: {
            actual: backendKpi.ThucTe.SoKhachHang,
            target: backendKpi.ChiTieu.SoKhachHang
          },
          coHoiThanhCong: {
            actual: backendKpi.ThucTe.SoCoHoiThanhCong,
            target: backendKpi.ChiTieu.SoCoHoi
          },
          doanhThu: {
            actual: backendKpi.ThucTe.DoanhThu,
            target: backendKpi.ChiTieu.DoanhThu
          }
        });
      }
      
      // Lọc cơ hội theo tháng/năm đã chọn
      const coHois = responses[4].data.data || [];
      const filteredCoHois = coHois.filter(co => {
        if (!co.NgayTao) return false;
        const coDate = new Date(co.NgayTao);
        return coDate.getMonth() + 1 === selectedMonth && coDate.getFullYear() === selectedYear;
      });
      
      const stats = [
        { name: 'Mới', value: filteredCoHois.filter(c => c.TrangThaiCoHoi === 'Mới').length, color: '#3B82F6' },
        { name: 'Chờ xử lý', value: filteredCoHois.filter(c => c.TrangThaiCoHoi === 'Chờ xử lý').length, color: '#F59E0B' },
        { name: 'Thành công', value: filteredCoHois.filter(c => c.TrangThaiCoHoi === 'Thành công').length, color: '#10B981' },
        { name: 'Thất bại', value: filteredCoHois.filter(c => c.TrangThaiCoHoi === 'Thất bại').length, color: '#EF4444' }
      ];
      setCoHoiStats(stats);

      if (user.roleId >= 2) {
        if (responses[5]) {
          setTopNhanVien(responses[5].data.data || []);
        }
        if (responses[6]) {
          setPrevTopNhanVien(responses[6].data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const getKPIColor = (percent) => {
    if (percent >= 100) return 'text-green-600';
    if (percent >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKPIBgColor = (percent) => {
    if (percent >= 100) return 'bg-green-100';
    if (percent >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getMedalIcon = (rank) => {
    const medals = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    };
    return medals[rank] || `#${rank}`;
  };

  // Tính tổng hợp các chỉ số từ dữ liệu đã lọc
  const currentMonthData = doanhThuData.find(d => d.thang === selectedMonth && d.nam === selectedYear);
  const totalRevenue = currentMonthData ? parseFloat(currentMonthData.tongDoanhThu || 0) : 0;
  const totalContracts = currentMonthData ? parseInt(currentMonthData.soHopDong || 0) : 0;
  
  // Tính tổng khách hàng mới và cơ hội từ topNhanVien
  const totalCustomers = topNhanVien.reduce((sum, nv) => sum + parseInt(nv.SoKhachHang || 0), 0);
  const totalChances = topNhanVien.reduce((sum, nv) => sum + parseInt(nv.SoCoHoi || 0), 0);
  
  // Tính dữ liệu tháng trước
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const prevMonthData = previousMonthData?.find(d => d.thang === prevMonth && d.nam === prevYear);
  const prevRevenue = prevMonthData ? parseFloat(prevMonthData.tongDoanhThu || 0) : 0;
  const prevContracts = prevMonthData ? parseInt(prevMonthData.soHopDong || 0) : 0;
  
  // Tính phần trăm thay đổi
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  const revenueChange = calculatePercentageChange(totalRevenue, prevRevenue);
  const contractsChange = calculatePercentageChange(totalContracts, prevContracts);
  
  // Tính khách hàng và cơ hội tháng trước
  const prevCustomers = prevTopNhanVien.reduce((sum, nv) => sum + parseInt(nv.SoKhachHang || 0), 0);
  const prevChances = prevTopNhanVien.reduce((sum, nv) => sum + parseInt(nv.SoCoHoi || 0), 0);
  const customersChange = calculatePercentageChange(totalCustomers, prevCustomers);
  const chancesChange = calculatePercentageChange(totalChances, prevChances);

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
        <h1 className="text-2xl font-bold text-gray-900">BÁO CÁO THỐNG KÊ KPI NHÂN VIÊN THÁNG</h1>
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
        <div className="card bg-white border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Tổng Doanh thu</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            <p className={`text-sm mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% từ tháng trước
            </p>
          </div>
        </div>

        <div className="card bg-white border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Hợp đồng phát sinh</p>
            <p className="text-2xl font-bold text-gray-900">{totalContracts}</p>
            <p className={`text-sm mt-1 ${contractsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {contractsChange >= 0 ? '+' : ''}{contractsChange.toFixed(1)}% so với tháng trước
            </p>
          </div>
        </div>

        <div className="card bg-white border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Khách hàng mới</p>
            <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString('vi-VN')}</p>
            <p className={`text-sm mt-1 ${customersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {customersChange >= 0 ? '+' : ''}{customersChange.toFixed(1)}% so với tháng trước
            </p>
          </div>
        </div>

        <div className="card bg-white border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Cơ hội phát sinh</p>
            <p className="text-2xl font-bold text-gray-900">{totalChances.toLocaleString('vi-VN')}</p>
            <p className={`text-sm mt-1 ${chancesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {chancesChange >= 0 ? '+' : ''}{chancesChange.toFixed(1)}% so với tháng trước
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
                onClick={() => handleExportExcel('top-nhanvien')} 
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Xuất Excel
              </button>
              <button 
                onClick={() => handleExportPDF('top-nhanvien')} 
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu (VND)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng mới</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hợp đồng phát sinh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cơ hội phát sinh</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topNhanVien.length > 0 ? (
                  <>
                    {topNhanVien.map((nv, index) => (
                      <tr key={nv.ID} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{nv.TenNhanVien}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatCurrency(nv.TongDoanhThu || 0)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nv.SoKhachHang || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nv.SoHopDong || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nv.SoCoHoi || 0}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900" colSpan="2">Tổng cộng</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatCurrency(topNhanVien.reduce((sum, nv) => sum + parseFloat(nv.TongDoanhThu || 0), 0))}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalCustomers}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalContracts}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{totalChances}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      {user.roleId >= 2 ? 'Không có dữ liệu' : 'Chỉ quản lý mới có quyền xem bảng này'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Biểu đồ doanh thu 12 tháng gần nhất - Bên phải */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu 12 tháng gần nhất</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={last12MonthsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="thang" 
                label={{ value: 'Tháng', position: 'insideBottom', offset: -5 }}
                tickFormatter={(value, index) => {
                  const item = last12MonthsData[index];
                  return item ? `T${item.thang}` : `T${value}`;
                }}
              />
              <YAxis 
                label={{ value: 'Doanh thu', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    const item = payload[0].payload;
                    return `Tháng ${item.thang}/${item.nam}`;
                  }
                  return `Tháng ${label}`;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="doanhThu" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Doanh thu"
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
