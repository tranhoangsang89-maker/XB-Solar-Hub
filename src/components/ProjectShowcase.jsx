export default function ProjectShowcase() {
  const projects = [
    {
      title: 'Biệt thự Lake View City (Quận 2, TP.HCM)',
      specs: '15 kWp - Inverter Sungrow Hybrid 3 Pha + Pin Sungrow SBR 12.8kWh + Tấm pin JA Solar N-Type',
      img: '/lake-view-villa.jpg'
    },
    {
      title: 'Nhà phố dân dụng (TP. Mỹ Tho, Tiền Giang)',
      specs: '5.4 kWp - Inverter Sungrow SG5.0RS + 9 tấm JA Solar 610W',
      img: '/townhouse-solar.jpg'
    },
    {
      title: 'HT ĐMT Nhà máy Sheico (KCN Đông Nam, Củ Chi)',
      specs: '8 MWp - Inverter Sungrow SG125CX',
      img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1000'
    },
    {
      title: 'ĐMT Mặt nước KCN Phước Đông (Tây Ninh)',
      specs: '3.4 MWp - Inverter Sungrow SG250CX/SG350HX',
      img: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1000'
    },
    {
      title: 'Trang trại Năng lượng sạch (Tân Uyên, Bình Dương)',
      specs: '17 MWp - Tấm pin JA Solar + Sungrow SG110CX',
      img: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=1000'
    }
  ];

  return (
    <section className="py-16 bg-slate-800/30 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Thư viện Dự Án Tiêu Biểu</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Các dự án trọng điểm được thực hiện bởi XBSolar</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, idx) => (
            <div key={idx} className={`group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50 hover:border-amber-500/50 transition-all ${idx === 3 || idx === 4 ? 'md:col-span-1 lg:col-span-1' : ''}`}>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent flex flex-col justify-end p-5 opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white font-bold text-lg mb-2 leading-tight">{p.title}</h3>
                <p className="text-amber-400 text-xs font-semibold leading-relaxed">{p.specs}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
