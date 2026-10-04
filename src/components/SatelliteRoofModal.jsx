// src/components/SatelliteRoofModal.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents, Polygon, Polyline, Marker, useMap } from 'react-leaflet';
import * as turf from '@turf/turf';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X, MapPin, Satellite, Trash2, RotateCcw, CheckCircle2,
  Navigation, Search, Loader2, ChevronRight, Sun, Zap,
  AlertTriangle, AlertCircle, Info,
} from 'lucide-react';

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Constants ─────────────────────────────────────────────────────────────────
const PANEL_AREA_M2 = 2.6;          // JA Solar JAM66D45 LB 610W footprint
const PANEL_POWER_KW = 0.61;        // kW per panel
const USABLE_RATIO = 0.75;          // usable roof ratio accounting for shading/gaps

const PACKAGE_NEEDS = [
  { name: 'ST-ECO 3kW',       areaM2: 13,  panels: 5,  kwp: 3.05 },
  { name: 'ST-ECO 5kW',       areaM2: 23,  panels: 9,  kwp: 5.49 },
  { name: 'ST-ECO 10kW',      areaM2: 42,  panels: 16, kwp: 10.08 },
  { name: 'ST-HYBRID 5kW',    areaM2: 23,  panels: 9,  kwp: 5.49 },
  { name: 'ST-HYBRID 5kW PRO',areaM2: 26,  panels: 10, kwp: 6.10 },
  { name: 'ST-HYBRID 10kW',   areaM2: 42,  panels: 16, kwp: 10.08 },
];

const GOOGLE_SATELLITE_URL =
  'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

const DEFAULT_CENTER = [10.7769, 106.7009]; // TP.HCM
const DEFAULT_ZOOM = 13;

// ── Polygon dot marker icon ───────────────────────────────────────────────────
const dotIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:#F59E0B;border:2.5px solid #fff;
    box-shadow:0 0 6px rgba(245,158,11,0.8);
    cursor:crosshair;
  "></div>`,
  iconAnchor: [7, 7],
});

const firstDotIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#10B981;border:3px solid #fff;
    box-shadow:0 0 8px rgba(16,185,129,0.9);
    cursor:pointer;
  "></div>`,
  iconAnchor: [9, 9],
});

// ── Shoelace / Turf area calculator ──────────────────────────────────────────
function calcAreaM2(latLngs) {
  if (latLngs.length < 3) return 0;
  try {
    const coords = latLngs.map((p) => [p[1], p[0]]); // [lng, lat]
    coords.push(coords[0]); // close
    const polygon = turf.polygon([coords]);
    return turf.area(polygon); // m²
  } catch {
    return 0;
  }
}

// ── Map event handler ─────────────────────────────────────────────────────────
function MapClickHandler({ onMapClick, drawing }) {
  useMapEvents({
    click(e) {
      if (drawing) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

// ── Fly-to controller ─────────────────────────────────────────────────────────
function FlyToController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom ?? 19, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// ── Address search box ────────────────────────────────────────────────────────
function AddressSearch({ onResult }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim() || q.length < 3) { setResults([]); return; }
    setLoading(true);
    setError('');
    try {
      // Đổi sang dùng Photon API (dựa trên OpenStreetMap) vì Nominatim thường chặn IP VN / trình duyệt gắt gao
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Chuyển đổi dữ liệu Photon về định dạng tương thích
      const formattedResults = data.features.map(f => {
        const p = f.properties;
        const nameParts = [p.name, p.street, p.housenumber, p.district, p.city, p.state, p.country].filter(Boolean);
        // Loại bỏ trùng lặp trong nameParts
        const uniqueParts = [...new Set(nameParts)];
        
        return {
          place_id: p.osm_id,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          display_name: uniqueParts.join(', ')
        };
      });

      setResults(formattedResults);
      if (formattedResults.length === 0) setError('Không tìm thấy địa chỉ. Thử tìm tên đường hoặc phường/quận.');
    } catch (err) {
      console.error('Lỗi Geocoding API:', err);
      setError('Lỗi kết nối máy chủ tìm kiếm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (item) => {
    onResult({ lat: parseFloat(item.lat), lng: parseFloat(item.lon), zoom: 19 });
    setQuery(item.display_name.split(',').slice(0, 2).join(', '));
    setResults([]);
  };

  return (
    <div className="relative z-[1000]">
      <div className="flex items-center gap-2 bg-white/95 border border-emerald-300 rounded-xl px-3 py-2 focus-within:border-amber-500 transition-colors">
        {loading
          ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
          : <Search className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Tìm địa chỉ (đường, phường, quận...)"
          className="bg-transparent text-sm text-teal-800 placeholder-slate-500 outline-none w-full"
          id="roof-search-input"
          aria-label="Tìm kiếm địa chỉ"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setError(''); }} className="text-emerald-600 hover:text-teal-800 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {(results.length > 0 || error) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-emerald-300 rounded-xl overflow-hidden shadow-2xl">
          {error && (
            <div className="px-3 py-2 text-xs text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </div>
          )}
          {results.map((item) => (
            <button
              key={item.place_id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2.5 text-xs text-emerald-800 hover:bg-emerald-100 hover:text-teal-800 border-b border-emerald-200/50 last:border-0 transition-colors flex items-start gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Fit bounds helper ─────────────────────────────────────────────────────────
function FitBoundsController({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 3) {
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 20 });
    }
  }, []); // only on mount
  return null;
}

// ── Area result panel ─────────────────────────────────────────────────────────
function AreaResultPanel({ areaM2, onApply, onClear }) {
  const usableArea = areaM2 * USABLE_RATIO;
  const maxPanels = Math.floor(usableArea / PANEL_AREA_M2);
  const maxKwp = parseFloat((maxPanels * PANEL_POWER_KW).toFixed(2));

  const suitablePackages = PACKAGE_NEEDS.filter((p) => p.areaM2 <= areaM2);
  const neededPackages = PACKAGE_NEEDS.filter((p) => p.areaM2 > areaM2);
  const bestFit = suitablePackages[suitablePackages.length - 1];

  return (
    <div className="bg-white/95 border border-emerald-300 rounded-2xl p-4 space-y-3">
      {/* Main area display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-700 text-[11px] font-medium">📐 Diện tích mái đo được</p>
          <p className="text-2xl font-black text-amber-400">
            {areaM2.toFixed(1)} <span className="text-base font-semibold">m²</span>
          </p>
          <p className="text-emerald-600 text-[10px]">Vùng lắp được ~{usableArea.toFixed(1)} m² (75% hiệu dụng)</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-700 text-[11px] font-medium">⚡ Tối đa lắp được</p>
          <p className="text-xl font-black text-emerald-400">{maxPanels} tấm</p>
          <p className="text-emerald-600 text-[10px]">~{maxKwp} kWp</p>
        </div>
      </div>

      {/* Package fit evaluation */}
      <div className="space-y-1.5">
        <p className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
          <Info className="w-3 h-3" /> Đánh giá so với các gói SmartTech
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {PACKAGE_NEEDS.slice(0, 6).map((pkg) => {
            const fits = areaM2 >= pkg.areaM2;
            return (
              <div
                key={pkg.name}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold border ${
                  fits
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {fits
                  ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  : <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
                <span className="truncate">{pkg.name}</span>
                <span className="text-[9px] opacity-70 flex-shrink-0">({pkg.areaM2}m²)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best fit highlight */}
      {bestFit && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
          <p className="text-amber-400 text-[11px] font-bold flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />
            Gợi ý tối ưu: <span className="text-teal-800">{bestFit.name}</span>
          </p>
          <p className="text-emerald-700 text-[10px] mt-0.5">
            {bestFit.panels} tấm JA Solar × {bestFit.kwp} kWp — cần {bestFit.areaM2}m² / bạn có {areaM2.toFixed(0)}m² ✓
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onClear}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs py-2.5 rounded-xl transition-colors"
          id="roof-clear-result-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Vẽ lại
        </button>
        <button
          onClick={() => onApply(areaM2, maxPanels, maxKwp, bestFit)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-teal-800 font-bold text-xs py-2.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-amber-500/30"
          id="roof-apply-btn"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Áp dụng vào Báo Giá
        </button>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function SatelliteRoofModal({ isOpen, onClose, onApplyArea }) {
  const [points, setPoints] = useState([]);           // [[lat, lng], ...]
  const [drawing, setDrawing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [showTip, setShowTip] = useState(true);

  const areaM2 = completed && points.length >= 3 ? calcAreaM2(points) : 0;

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setPoints([]);
      setDrawing(false);
      setCompleted(false);
      setFlyTarget(null);
      setGeoError('');
      setShowTip(true);
    }
  }, [isOpen]);

  const handleMapClick = useCallback((latLng) => {
    if (completed) return;
    setPoints((prev) => [...prev, latLng]);
    setShowTip(false);
  }, [completed]);

  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setPoints([]);
    setCompleted(false);
    setShowTip(true);
  };

  const handleComplete = () => {
    if (points.length < 3) return;
    setCompleted(true);
    setDrawing(false);
  };

  const handleStartDrawing = () => {
    setDrawing(true);
    setShowTip(false);
    setCompleted(false);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 19 });
        setGeoLoading(false);
      },
      () => {
        setGeoError('Không lấy được vị trí. Cho phép quyền truy cập GPS.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleApply = (area, panels, kwp, pkg) => {
    onApplyArea?.({ areaM2: area, maxPanels: panels, maxKwp: kwp, suggestedPackage: pkg });
    onClose();
  };

  const handleAddressResult = (target) => {
    setFlyTarget(target);
  };

  if (!isOpen) return null;

  // Polygon display points (closed)
  const polygonPositions = points.length >= 3 ? points : [];
  // Preview line for in-progress drawing
  const previewLine = !completed && points.length >= 2 ? points : [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white/90 border-b border-emerald-200 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Satellite className="w-4.5 h-4.5 text-amber-400 w-[18px] h-[18px]" />
            </div>
            <div>
              <h2 className="text-teal-800 font-bold text-sm leading-tight">🛰️ Khảo sát Mái Từ Xa — Ảnh Vệ Tinh</h2>
              <p className="text-emerald-700 text-[10px]">Esri World Imagery · Nominatim · @turf/area</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center justify-center text-emerald-700 hover:text-teal-800 transition-colors flex-shrink-0"
            id="roof-modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Main body ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">

          {/* ── Left sidebar (controls) ──────────────────────────────────── */}
          <div className="flex-shrink-0 w-full lg:w-80 bg-emerald-50/95 border-b lg:border-b-0 lg:border-r border-emerald-200 flex flex-col overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* Address search */}
              <div>
                <label className="text-emerald-800 text-xs font-bold mb-2 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  Tìm địa chỉ nhà
                </label>
                <AddressSearch onResult={handleAddressResult} />
              </div>

              {/* GPS Button */}
              <button
                onClick={handleGeolocate}
                disabled={geoLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-semibold text-xs py-2.5 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-60"
                id="roof-gps-btn"
              >
                {geoLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Navigation className="w-3.5 h-3.5" />}
                Định vị vị trí của tôi (GPS)
              </button>
              {geoError && (
                <p className="text-rose-400 text-[10px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" /> {geoError}
                </p>
              )}

              {/* Tip banner */}
              {showTip && !drawing && !completed && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <p className="text-amber-400 text-[11px] font-bold mb-1">💡 Hướng dẫn đo mái</p>
                  <ol className="text-emerald-700 text-[10px] space-y-0.5 list-decimal list-inside">
                    <li>Tìm địa chỉ hoặc định vị GPS</li>
                    <li>Zoom vào mái nhà trên ảnh vệ tinh</li>
                    <li>Nhấn "Bắt đầu vẽ mái" rồi click các góc</li>
                    <li>Nhấn "Hoàn tất" để tính diện tích</li>
                  </ol>
                </div>
              )}

              {/* Drawing controls */}
              <div>
                <p className="text-emerald-800 text-xs font-bold mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Chế độ đo đạc
                  {points.length > 0 && (
                    <span className="ml-auto text-amber-400 font-bold">{points.length} điểm</span>
                  )}
                </p>

                {!drawing && !completed && (
                  <button
                    onClick={handleStartDrawing}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-sm py-3 rounded-xl transition-all hover:scale-[1.02]"
                    id="roof-start-draw-btn"
                  >
                    <MapPin className="w-4 h-4" />
                    Bắt đầu vẽ mái
                  </button>
                )}

                {drawing && !completed && (
                  <div className="space-y-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-center">
                      <p className="text-emerald-400 text-xs font-bold animate-pulse">
                        ● Click trên bản đồ để chấm điểm ({points.length}/∞)
                      </p>
                      {points.length < 3 && (
                        <p className="text-emerald-600 text-[10px] mt-0.5">Cần ít nhất 3 điểm</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleUndo}
                        disabled={points.length === 0}
                        className="flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-40 text-emerald-800 font-semibold text-xs py-2 rounded-xl transition-colors"
                        id="roof-undo-btn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa điểm
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 font-semibold text-xs py-2 rounded-xl transition-colors"
                        id="roof-reset-btn"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Vẽ lại
                      </button>
                    </div>

                    <button
                      onClick={handleComplete}
                      disabled={points.length < 3}
                      className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-all ${
                        points.length >= 3
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-teal-800 shadow-lg shadow-amber-500/30 hover:scale-[1.02]'
                          : 'bg-emerald-100 text-emerald-600 cursor-not-allowed opacity-60'
                      }`}
                      id="roof-complete-btn"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Hoàn tất đo mái
                    </button>
                  </div>
                )}

                {completed && !drawing && (
                  <div className="space-y-2">
                    <button
                      onClick={() => { handleReset(); handleStartDrawing(); }}
                      className="w-full flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs py-2.5 rounded-xl transition-colors"
                      id="roof-redraw-btn"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Vẽ lại từ đầu
                    </button>
                  </div>
                )}
              </div>

              {/* Results */}
              {completed && areaM2 > 0 && (
                <AreaResultPanel
                  areaM2={areaM2}
                  onApply={handleApply}
                  onClear={() => { handleReset(); handleStartDrawing(); }}
                />
              )}

              {completed && areaM2 === 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
                  <p className="text-rose-400 text-xs font-bold">Không tính được diện tích</p>
                  <p className="text-emerald-700 text-[10px] mt-0.5">Các điểm có thể bị thẳng hàng hoặc quá gần nhau.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Map area ─────────────────────────────────────────────────── */}
          <div className="flex-1 relative min-h-[300px]">
            {/* Drawing cursor overlay */}
            {drawing && (
              <div
                className="absolute inset-0 z-[400] pointer-events-none"
                style={{ cursor: 'crosshair' }}
              />
            )}

            {/* Zoom tip */}
            {!completed && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-emerald-50/80 backdrop-blur-sm border border-emerald-300 rounded-full px-3 py-1 text-[10px] text-emerald-800 pointer-events-none whitespace-nowrap">
                Zoom đến level 19–20 để thấy rõ mái nhà
              </div>
            )}

            <MapContainer
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
              attributionControl={true}
              maxZoom={22}
              zoomSnap={0.5}
            >
              {/* Satellite imagery */}
              <TileLayer
                url={GOOGLE_SATELLITE_URL}
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                attribution='&copy; Google Maps'
                maxZoom={22}
                maxNativeZoom={20}
                tileSize={256}
              />

              {/* Fly-to controller */}
              <FlyToController target={flyTarget} />

              {/* Click handler */}
              <MapClickHandler onMapClick={handleMapClick} drawing={drawing && !completed} />

              {/* Completed polygon */}
              {completed && polygonPositions.length >= 3 && (
                <Polygon
                  positions={polygonPositions}
                  pathOptions={{
                    color: '#F59E0B',
                    fillColor: '#F59E0B',
                    fillOpacity: 0.35,
                    weight: 2.5,
                    dashArray: null,
                  }}
                />
              )}

              {/* In-progress preview line */}
              {!completed && previewLine.length >= 2 && (
                <Polyline
                  positions={previewLine}
                  pathOptions={{
                    color: '#F59E0B',
                    weight: 2,
                    dashArray: '6 4',
                    opacity: 0.9,
                  }}
                />
              )}

              {/* In-progress fill preview (if 3+ points) */}
              {!completed && points.length >= 3 && (
                <Polygon
                  positions={points}
                  pathOptions={{
                    color: '#F59E0B',
                    fillColor: '#F59E0B',
                    fillOpacity: 0.2,
                    weight: 1.5,
                    dashArray: '6 4',
                  }}
                />
              )}

              {/* Vertex markers */}
              {points.map((pt, idx) => (
                <Marker
                  key={idx}
                  position={pt}
                  icon={idx === 0 ? firstDotIcon : dotIcon}
                />
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
