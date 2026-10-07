export default function ProjectShowcase() {
  const projects = [
    {
      title: 'Biệt thự Lake View City (Quận 2, TP.HCM)',
      specs: '14.4 kWp (20 tấm JA 720W) - Inverter SOLIS Hybrid 18kW + Pin Hithium 16kWh',
      img: '/lake-view-villa.jpg'
    },
    {
      title: 'Nhà phố dân dụng (TP. Mỹ Tho, Tiền Giang)',
      specs: '5.04 kWp (7 tấm JA 720W) - Inverter SUNGROW SG5.0RS On-grid',
      img: '/townhouse-solar.jpg'
    },
    {
      title: 'Biệt thự Vườn (Đà Lạt, Lâm Đồng)',
      specs: '10.08 kWp (14 tấm JA 720W) - Inverter SOLIS Hybrid 10kW + Pin Dyness 10.24kWh',
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000'
    },
    {
      title: 'Shophouse Thương Mại (KĐT Sala, TP.HCM)',
      specs: '20.16 kWp (28 tấm JA 720W) - Inverter SUNGROW SG20RT On-grid',
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000'
    },
    {
      title: 'Villa Nghỉ Dưỡng (Hồ Tràm, Vũng Tàu)',
      specs: '15.12 kWp (21 tấm JA 720W) - 2x Inverter SOLIS Hybrid 8kW + Pin Dyness 16kWh',
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'
    }
  ];

  return (
    <section className="py-16 bg-white/30 border-t border-emerald-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-teal-800 mb-2">Thư viện Dự Án Tiêu Biểu</h2>
          <p className="text-emerald-700 max-w-2xl mx-auto">Các dự án trọng điểm được thực hiện bởi SmartTech</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, idx) => (
            <div key={idx} className={`group relative rounded-2xl overflow-hidden bg-white border border-emerald-200/50 hover:border-amber-500/50 transition-all ${idx === 3 || idx === 4 ? 'md:col-span-1 lg:col-span-1' : ''}`}>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-50 via-emerald-50/80 to-transparent flex flex-col justify-end p-5 opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="text-teal-800 font-bold text-lg mb-2 leading-tight">{p.title}</h3>
                <p className="text-amber-400 text-xs font-semibold leading-relaxed">{p.specs}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
