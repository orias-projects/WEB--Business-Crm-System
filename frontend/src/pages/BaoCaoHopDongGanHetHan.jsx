import { useState } from 'react';
import api from '../lib/api';
import { Download, AlertTriangle } from 'lucide-react';

export default function BaoCaoHopDongGanHetHan() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
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
            console.error('Export error:', error);
            alert('Lỗi xuất báo cáo');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    BÁO CÁO HỢP ĐỒNG GẦN ĐẾN HẠN
                </h1>
                <button
                    onClick={handleExport}
                    className="btn-primary flex items-center gap-2"
                >
                    <Download size={20} />
                    Xuất Excel
                </button>
            </div>

            <div className="card bg-white p-8 text-center text-gray-500">
                <p>Tính năng xem trực tiếp đang được phát triển. Vui lòng xuất Excel để xem chi tiết.</p>
            </div>
        </div>
    );
}
